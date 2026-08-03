import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const supabase = getSupabaseAdmin()
import { mapTeamName } from '@/lib/teamNames'
import { getConfirmedPositions, getConfirmed3rdPlaces } from '@/data/bracket-draw'
import { VM_GROUPS } from '@/data/vm-groups'
import type { MatchResult } from '@/lib/scoring'

const FD_API_KEY = process.env.FOOTBALL_DATA_API_KEY
const FD_BASE = 'https://api.football-data.org/v4'

// Kjent mapping fra football-data.org stage-strenger — brukes som primær kilde
const STAGE_MAP: Record<string, string> = {
  'GROUP_STAGE':        'group',
  'ROUND_OF_32':        'r32',
  'LAST_16':            'r16',
  'QUARTER_FINALS':     'qf',
  'SEMI_FINALS':        'sf',
  'THIRD_PLACE_MATCH':  'bronze',
  'FINAL':              'final',
}

// Hva vinneren/taperen oppnår per runde — keyed på INFERRED stage (ikke API-streng)
const WINNER_REACHES: Record<string, string> = {
  r32: 'r32', r16: 'r16', qf: 'qf', sf: 'sf', bronze: 'bronze', final: 'gold',
}
const LOSER_REACHES: Record<string, string> = {
  r32: 'group', r16: 'r32', qf: 'r16', sf: 'qf', bronze: 'qf', final: 'silver',
}

const STAGE_ORDER = ['group', 'r32', 'r16', 'qf', 'sf', 'bronze', 'silver', 'gold']

function higherStage(a: string | undefined, b: string): string {
  if (!a) return b
  return STAGE_ORDER.indexOf(a) >= STAGE_ORDER.indexOf(b) ? a : b
}

function sameVMGroup(a: string, b: string): boolean {
  return VM_GROUPS.some(g => g.teams.includes(a) && g.teams.includes(b))
}

// football-data.org rapporterer ofte winner: 'DRAW'/null for kamper avgjort på straffer,
// siden ordinær/ekstraomgang endte uavgjort. Fall tilbake på straffesparkresultatet da.
function resolveWinner(m: { score?: { winner?: string | null; penalties?: { home?: number | null; away?: number | null } } }): 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null {
  let winner = m.score?.winner ?? null
  if ((!winner || winner === 'DRAW') && m.score?.penalties?.home != null && m.score?.penalties?.away != null) {
    winner = m.score.penalties.home > m.score.penalties.away ? 'HOME_TEAM' : 'AWAY_TEAM'
  }
  return winner as 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')
  if (secret !== process.env.SYNC_SECRET && req.headers.get('x-vercel-cron') !== '1') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!FD_API_KEY) {
    return NextResponse.json({ error: 'FOOTBALL_DATA_API_KEY ikke satt' }, { status: 500 })
  }

  // Hent gjeldende avansement fra DB — brukes til stage-inferens når API gir ukjent/null stage
  const { data: existingAdv } = await supabase.from('advancement').select('team_name, stage_reached')
  const currentAdvMap = new Map<string, string>(
    (existingAdv ?? []).map(a => [a.team_name, a.stage_reached ?? 'group'])
  )

  // Lag som allerede har en ekte semifinale registrert — brukes til å skille bronsefinalen
  // fra en ekte semifinale når API-strengen for bronsefinalen er ukjent (se under).
  const { data: existingSF } = await supabase.from('match_results').select('home_team, away_team').eq('stage', 'sf')
  const sfPlayedTeams = new Set<string>((existingSF ?? []).flatMap(m => [m.home_team, m.away_team]))

  // Infer riktig stage: prøv API-mapping først, fall tilbake på advancement+bracket.
  // Fallback dekker tilfeller der football-data.org bruker ukjente stage-strenger
  // (f.eks. nytt R32-format i VM 2026 som ikke er i STAGE_MAP).
  function inferMatchStage(home: string, away: string, apiStage: string): string {
    const mapped = STAGE_MAP[apiStage]
    if (mapped && mapped !== 'group') return mapped
    // API-streng ukjent eller gir 'group' — infer fra advancement hvis lagene er fra ulike grupper.
    // Bruker laveste advancement-stage: vinneren rykker opp, taperen blir stående — etter oppgjøret
    // er de ikke lenger like. Kampens stage = NEXT[laveste av de to].
    if (!sameVMGroup(home, away)) {
      // Bronsefinalen mellom to lag som BEGGE allerede har en registrert sf-kamp er entydig —
      // et lag kan ikke spille sin egen ekte semifinale to ganger, uansett hva advancement-
      // tabellen sier akkurat nå (den kan allerede være oppdatert til 'bronze' fra en tidligere
      // — riktig — kjøring, så den må IKKE brukes som forutsetning her).
      if (sfPlayedTeams.has(home) && sfPlayedTeams.has(away)) {
        return 'bronze'
      }
      const homeAdv = currentAdvMap.get(home) ?? 'group'
      const awayAdv = currentAdvMap.get(away) ?? 'group'
      const NEXT: Record<string, string> = { group: 'r32', r32: 'r16', r16: 'qf', qf: 'sf' }
      const lowerAdv = STAGE_ORDER.indexOf(homeAdv) <= STAGE_ORDER.indexOf(awayAdv) ? homeAdv : awayAdv
      if (NEXT[lowerAdv]) return NEXT[lowerAdv]
    }
    return mapped ?? 'group'
  }

  // Rett opp lagernavn som ble lagret feil (f.eks. football-data.org bruker "Cape Verde Islands")
  const NAME_FIXES: [string, string][] = [
    ['Cape Verde Islands', 'Kapp Verde'],
    ['Cape Verde Island',  'Kapp Verde'],
  ]
  for (const [wrong, correct] of NAME_FIXES) {
    await Promise.all([
      supabase.from('match_results').update({ home_team: correct }).eq('home_team', wrong),
      supabase.from('match_results').update({ away_team: correct }).eq('away_team', wrong),
      supabase.from('match_goals').update({ home_team: correct }).eq('home_team', wrong),
      supabase.from('match_goals').update({ away_team: correct }).eq('away_team', wrong),
      supabase.from('match_goals').update({ team: correct }).eq('team', wrong),
    ])
  }

  const res = await fetch(`${FD_BASE}/competitions/WC/matches?status=FINISHED`, {
    headers: { 'X-Auth-Token': FD_API_KEY },
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: `football-data.org feil: ${res.status}`, detail: text }, { status: 502 })
  }

  const json = await res.json()
  const matches = json.matches ?? []

  // ── Kampresultater ──
  let inserted = 0
  let updated = 0
  let skipped = 0

  for (const m of matches) {
    // Kun mål scoret i ordinær tid (90 min) skal telle for poeng — mål i ekstraomganger
    // (med eller uten påfølgende straffekonk) skal IKKE gi poeng i dette spillet.
    // score.fullTime inkluderer ekstraomgangsmål, så bruk score.regularTime når kampen
    // gikk til ekstraomganger. Fallback: tell kun mål med minute <= 90 fra goals-arrayet.
    const wentToExtraTime =
      m.score?.penalties?.home != null ||
      m.score?.duration === 'EXTRA_TIME' ||
      m.score?.duration === 'PENALTY_SHOOTOUT' ||
      m.score?.extraTime?.home != null
    let homeGoals: number | null | undefined = m.score?.fullTime?.home
    let awayGoals: number | null | undefined = m.score?.fullTime?.away

    if (wentToExtraTime) {
      const regHome = m.score?.regularTime?.home
      const regAway = m.score?.regularTime?.away
      if (regHome != null && regAway != null) {
        homeGoals = regHome
        awayGoals = regAway
      } else {
        // Tell kun mål scoret innenfor de første 90 minuttene, ekskl. straffekonk
        const rawGoals: { type?: string; minute?: number; team?: { name?: string } }[] = m.goals ?? []
        const regularTimeGoals = rawGoals.filter((g) => g.type !== 'SHOOT_OUT' && (g.minute ?? 0) <= 90)
        const homeTeamRaw = m.homeTeam?.name ?? ''
        const awayTeamRaw = m.awayTeam?.name ?? ''
        const countedHome = regularTimeGoals.filter((g) => g.team?.name === homeTeamRaw).length
        const countedAway = regularTimeGoals.filter((g) => g.team?.name === awayTeamRaw).length
        // Only override if we actually found goals data (avoids 0-0 false positive)
        if (rawGoals.length > 0) {
          homeGoals = countedHome
          awayGoals = countedAway
        }
      }
    }

    if (homeGoals === null || homeGoals === undefined || awayGoals === null || awayGoals === undefined) {
      skipped++
      continue
    }

    const homeName = mapTeamName(m.homeTeam?.name ?? '')
    const awayName = mapTeamName(m.awayTeam?.name ?? '')
    const stage = inferMatchStage(homeName, awayName, m.stage)
    const playedAt = m.utcDate ?? null

    // Lagre faktisk vinner (inkl. straffesparkfallback) — kan ikke utledes fra
    // home_goals/away_goals alene siden disse kun reflekterer ordinær tid og derfor
    // kan stå likt selv om kampen ble avgjort i ekstraomganger/på straffer.
    const winnerCode = resolveWinner(m)
    const winnerName = winnerCode === 'HOME_TEAM' ? homeName : winnerCode === 'AWAY_TEAM' ? awayName : null

    const { data: existing } = await supabase
      .from('match_results')
      .select('id, home_goals, away_goals, stage, winner')
      .eq('home_team', homeName)
      .eq('away_team', awayName)
      .single()

    if (existing) {
      // Bronsefinalen og finalen er låst mot videre synk: football-data.org har gitt ufullstendige
      // mål-/fase-data for begge (manglende ekstraomgangs-info, manglende goals-array), som gjentatte
      // ganger rullet tilbake manuelle rettinger av nøyaktig disse to kampene. Siden VM er ferdigspilt
      // finnes det uansett ingen ny, legitim data å synke inn for dem.
      if (existing.stage === 'bronze' || existing.stage === 'final') {
        skipped++
        continue
      }
      const goalsChanged = existing.home_goals !== homeGoals || existing.away_goals !== awayGoals
      const stageChanged = existing.stage !== stage
      const winnerChanged = (existing.winner ?? null) !== winnerName
      if (goalsChanged || stageChanged || winnerChanged) {
        await supabase.from('match_results').update({ home_goals: homeGoals, away_goals: awayGoals, stage, winner: winnerName }).eq('id', existing.id)
        updated++
      } else {
        skipped++
      }
    } else {
      await supabase.from('match_results').insert({ home_team: homeName, away_team: awayName, home_goals: homeGoals, away_goals: awayGoals, stage, winner: winnerName, played_at: playedAt })
      inserted++
    }
  }

  // ── Avansement (utledes automatisk fra knockout-kamper) ──
  const advancementMap: Record<string, string> = {}

  // «Videre fra gruppe» (+5): ethvert lag i en R32-kamp har avansert fra gruppa
  for (const m of matches) {
    const home = mapTeamName(m.homeTeam?.name ?? '')
    const away = mapTeamName(m.awayTeam?.name ?? '')
    const inferredStage = inferMatchStage(home, away, m.stage)
    if (inferredStage !== 'r32') continue
    if (home) advancementMap[home] = higherStage(advancementMap[home], 'group')
    if (away) advancementMap[away] = higherStage(advancementMap[away], 'group')
  }

  // Vinner/taper-avansement for alle sluttspillkamper
  for (const m of matches) {
    const home = mapTeamName(m.homeTeam?.name ?? '')
    const away = mapTeamName(m.awayTeam?.name ?? '')
    const inferredStage = inferMatchStage(home, away, m.stage)
    const winner = resolveWinner(m)

    if (inferredStage === 'group' || !winner || winner === 'DRAW') continue

    const winnerReach = WINNER_REACHES[inferredStage]
    const loserReach = LOSER_REACHES[inferredStage]
    if (!winnerReach) continue

    if (winner === 'HOME_TEAM') {
      advancementMap[home] = higherStage(advancementMap[home], winnerReach)
      if (loserReach) advancementMap[away] = higherStage(advancementMap[away], loserReach)
    } else {
      advancementMap[away] = higherStage(advancementMap[away], winnerReach)
      if (loserReach) advancementMap[home] = higherStage(advancementMap[home], loserReach)
    }
  }

  // ── Avansement fra ferdigspilte grupper ──
  const { data: dbResults } = await supabase
    .from('match_results')
    .select('home_team, away_team, home_goals, away_goals, stage')
  if (dbResults) {
    const mr = dbResults as MatchResult[]
    const confirmedPos = getConfirmedPositions(mr)
    const confirmed3rd = getConfirmed3rdPlaces(mr)
    for (const [, standings] of confirmedPos) {
      for (let i = 0; i < 2 && i < standings.length; i++) {
        const team = standings[i].team
        if (team) advancementMap[team] = higherStage(advancementMap[team], 'group')
      }
    }
    for (const team of confirmed3rd.values()) {
      if (team) advancementMap[team] = higherStage(advancementMap[team], 'group')
    }
  }

  // Skriv kun hvis nytt avansement er høyere enn det som allerede står i DB — en feilinferert
  // stage i denne kjøringen skal aldri kunne rulle tilbake et allerede korrekt/manuelt rettet
  // avansement (higherStage over var kun trygg innad i denne batchen, ikke mot eksisterende DB-rad).
  let advInserted = 0
  for (const [team, stage] of Object.entries(advancementMap)) {
    const finalStage = higherStage(currentAdvMap.get(team), stage)
    if (finalStage === currentAdvMap.get(team)) continue
    const { error } = await supabase
      .from('advancement')
      .upsert({ team_name: team, stage_reached: finalStage }, { onConflict: 'team_name' })
    if (!error) advInserted++
  }

  // ── Målscorere ──
  let goalsUpdated = 0
  for (const m of matches) {
    const goals: { minute: number; type: string; team: { name: string }; scorer: { name: string } }[] = m.goals ?? []
    if (!goals.length) continue

    const homeName = mapTeamName(m.homeTeam?.name ?? '')
    const awayName = mapTeamName(m.awayTeam?.name ?? '')
    if (!homeName || !awayName) continue

    const { count } = await supabase
      .from('match_goals')
      .select('*', { count: 'exact', head: true })
      .eq('home_team', homeName)
      .eq('away_team', awayName)

    if (count === goals.length) continue

    await supabase.from('match_goals').delete().eq('home_team', homeName).eq('away_team', awayName)
    await supabase.from('match_goals').insert(
      goals.map(g => ({
        home_team: homeName,
        away_team: awayName,
        scorer: g.scorer?.name ?? 'Ukjent',
        minute: g.minute,
        team: mapTeamName(g.team?.name ?? ''),
        goal_type: g.type ?? 'REGULAR',
      }))
    )
    goalsUpdated++
  }

  if (inserted > 0 || updated > 0 || advInserted > 0) {
    revalidatePath('/', 'layout')
  }

  return NextResponse.json({ ok: true, matches: { inserted, updated, skipped, total: matches.length }, advancement: { upserted: advInserted }, goals: { matchesUpdated: goalsUpdated } })
}
