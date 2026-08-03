import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const supabase = getSupabaseAdmin()
import { POTS, getIso2 } from '@/data/pots'
import { GROUP_SCHEDULE } from '@/data/schedule'
import { fetchUpcomingSchedule, buildTeamScheduleMap } from '@/lib/knockout-schedule'
import { notFound } from 'next/navigation'
import { calcTeamPoints, calcParticipantPoints, MatchResult, AdvancementRow } from '@/lib/scoring'
import { EnrichedPick } from './PicksClient'
import { getKnockoutOpponent } from '@/lib/bracket'
import { getConfirmedPositions, getConfirmed3rdPlaces, R32_DRAW, findTeamR32Slot, resolvePos } from '@/data/bracket-draw'
import CountUp from './CountUp'
import MinSideAccordions, { UpcomingMatch } from './MinSideAccordions'
import DeadlineCountdown from './DeadlineCountdown'
import PicksClient from './PicksClient'
import UpcomingMatchCard from './UpcomingMatchCard'
import PointsDelta from './PointsDelta'
import LiveMatchesBar from '@/components/LiveMatchesBar'
import LogoutButton from './LogoutButton'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

const POT_COLORS = [
  '#f59e0b', '#3b82f6', '#22c55e', '#f97316',
  '#8b5cf6', '#06b6d4', '#ef4444', '#ec4899',
]

interface Pick { pot_number: number; team_name: string }
interface Participant { id: string; name: string; email: string; created_at: string }

const DEADLINE = new Date('2026-06-11T19:00:00Z')

// Korte labels for inline-merket (lik bredde → aligner). Medaljer eksakt for fargelegging.
const SHORT_STAGE: Record<string, string> = {
  group: 'Videre → 1/16',
  r32: 'Videre → 1/8',
  r16: 'Videre → QF',
  qf: 'Videre → SF',
  sf: 'I finalen',
  bronze: 'Bronsemedalje',
  silver: 'Sølvmedalje',
  gold: 'Gullmedalje',
}

const KNOCKOUT_UPCOMING: Record<string, string> = {
  r32: '1/16-finale',
  r16: '1/8-finale',
  qf: 'Kvartfinale',
  sf: 'Semifinale',
  final: 'Finale',
}

const STAGE_SEQUENCE = ['group', 'r32', 'r16', 'qf', 'sf', 'final']

const VM_STAGE_ORDER: Record<string, number> = { group: 0, r32: 1, r16: 2, qf: 3, sf: 4, final: 5 }
const VM_STAGE_LABEL: Record<string, string> = {
  group: 'Gruppespill', r32: '1/16-finaler', r16: '1/8-finaler',
  qf: 'Kvartfinaler', sf: 'Semifinaler', final: 'Finale',
}

const PLAYED_STAGE_ORDER: Record<string, number> = {
  group: 0, r32: 1, r16: 2, qf: 3, sf: 4, bronze: 5, final: 6,
}

const KNOCKOUT_ROUND_DATES: Record<string, string> = {
  '1/16-finale':  '2026-06-28',
  '1/8-finale':   '2026-07-04',
  'Kvartfinale':  '2026-07-10',
  'Semifinale':   '2026-07-14',
  'Bronsefinale': '2026-07-18',
  'Finale':       '2026-07-19',
}

const allTeams = POTS.flatMap(p => p.teams)

export const revalidate = 30

export default async function DeltakerPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ from?: string }> }) {
  const { id } = await params
  const { from } = await searchParams

  // Kontekst-bevisst tilbake-lenke: kom man fra en liga/leaderboard, gå dit — ellers startside.
  const back = from?.startsWith('liga-')
    ? { href: `/liga/${from.slice(5)}`, label: '← Tilbake til ligaen' }
    : from === 'leaderboard'
      ? { href: '/leaderboard', label: '← Leaderboard' }
      : { href: '/', label: '← Startside' }

  const [
    { data: participant },
    { data: picksData },
    { data: matches },
    { data: advancement },
    { data: allPicksData },
    upcomingSchedule,
  ] = await Promise.all([
    supabase.from('participants').select('id, name, email, created_at').eq('id', id).single(),
    supabase.from('picks').select('pot_number, team_name').eq('participant_id', id).order('pot_number'),
    supabase.from('match_results').select('home_team, away_team, home_goals, away_goals, stage, winner'),
    supabase.from('advancement').select('team_name, stage_reached'),
    supabase.from('picks').select('participant_id, pot_number, team_name'),
    fetchUpcomingSchedule(),
  ])

  const koScheduleMap = buildTeamScheduleMap(upcomingSchedule)

  if (!participant) notFound()

  const p = participant as Participant
  const picks = (picksData as Pick[]) ?? []
  const matchResults = (matches as MatchResult[]) ?? []
  const advRows = (advancement as AdvancementRow[]) ?? []
  const confirmedPos = getConfirmedPositions(matchResults)
  const confirmed3rd = getConfirmed3rdPlaces(matchResults)

  const totalPoints = calcParticipantPoints(picks, matchResults, advRows)
  const editable = new Date() < DEADLINE
  const vmStarted = new Date() >= DEADLINE
  const fetchedAt = new Date().toISOString()

  const displayStage = (() => {
    const count = (s: string) => matchResults.filter(m => (m.stage ?? 'group') === s).length
    if (count('final') > 0)  return 'final'
    if (count('sf') >= 2)    return 'final'
    if (count('sf') > 0)     return 'sf'
    if (count('qf') >= 4)    return 'sf'
    if (count('qf') > 0)     return 'qf'
    if (count('r16') >= 8)   return 'qf'
    if (count('r16') > 0)    return 'r16'
    if (count('r32') >= 16)  return 'r16'
    if (count('r32') > 0)    return 'r32'
    if (advRows.length > 0)  return 'r32'
    if (count('group') > 0)  return 'group'
    return null
  })()

  // Rank calculation
  const allPicksList = (allPicksData as { participant_id: string; pot_number: number; team_name: string }[]) ?? []
  const byParticipant = new Map<string, Pick[]>()
  for (const pick of allPicksList) {
    if (!byParticipant.has(pick.participant_id)) byParticipant.set(pick.participant_id, [])
    byParticipant.get(pick.participant_id)!.push({ pot_number: pick.pot_number, team_name: pick.team_name })
  }
  const totalParticipants = byParticipant.size
  const rank = Array.from(byParticipant.values())
    .filter(pp => calcParticipantPoints(pp, matchResults, advRows) > totalPoints)
    .length + 1

  // % av deltakere som valgte hvert lag
  const pickCountByTeam = new Map<string, number>()
  for (const pick of allPicksList) {
    pickCountByTeam.set(pick.team_name, (pickCountByTeam.get(pick.team_name) ?? 0) + 1)
  }
  const pickPercent = (teamName: string) =>
    totalParticipants > 0
      ? Math.round((pickCountByTeam.get(teamName) ?? 0) / totalParticipants * 100)
      : 0

  const today = new Date().toISOString().slice(0, 10)
  const teamNames = picks.map(p => p.team_name)
  // Bidireksjonalt sett — fungerer uavhengig av hjemme/borte-rekkefølge i DB
  const playedPairs = new Set<string>()
  for (const m of matchResults) {
    playedPairs.add(`${m.home_team}|${m.away_team}`)
    playedPairs.add(`${m.away_team}|${m.home_team}`)
  }

  const upcomingAll: UpcomingMatch[] = GROUP_SCHEDULE
    .filter(m =>
      (teamNames.includes(m.home) || teamNames.includes(m.away)) &&
      m.date >= today &&
      !playedPairs.has(`${m.home}|${m.away}`)
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 8)
    .map(m => ({
      id: m.id,
      date: m.date,
      time: m.time,
      home: m.home,
      homeIso2: allTeams.find(t => t.name === m.home)?.iso2 ?? '',
      away: m.away,
      awayIso2: allTeams.find(t => t.name === m.away)?.iso2 ?? '',
      isHome: teamNames.includes(m.home),
      channel: m.channel,
    }))

  const enrichedPicks: EnrichedPick[] = picks.map((pick) => {
    const pot = POTS.find(p => p.potNumber === pick.pot_number)
    const team = pot?.teams.find(t => t.name === pick.team_name)
    const { matchPts, advPts, multiplier, total } = calcTeamPoints(pick, matchResults, advRows)
    const advRow = advRows.find(a => a.team_name === pick.team_name)
    const stageLabel = advRow?.stage_reached ? (SHORT_STAGE[advRow.stage_reached] ?? null) : null

    const played = matchResults
      .filter(m => m.home_team === pick.team_name || m.away_team === pick.team_name)
      .map(m => {
        const s = GROUP_SCHEDULE.find(sc =>
          (sc.home === m.home_team && sc.away === m.away_team) ||
          (sc.home === m.away_team && sc.away === m.home_team)
        )
        return {
          home: m.home_team, homeGoals: m.home_goals,
          away: m.away_team, awayGoals: m.away_goals,
          date: s?.date ?? '9999-99-99',
          time: s?.time ?? '',
          group: s?.group ?? '',
          stage: m.stage ?? 'group',
        }
      })
      .sort((a, b) => {
        const sd = (PLAYED_STAGE_ORDER[a.stage] ?? 0) - (PLAYED_STAGE_ORDER[b.stage] ?? 0)
        return sd !== 0 ? sd : a.date.localeCompare(b.date)
      })

    const upcoming = GROUP_SCHEDULE
      .filter(m =>
        (m.home === pick.team_name || m.away === pick.team_name) &&
        !playedPairs.has(`${m.home}|${m.away}`)
      )
      .map(m => ({
        date: m.date,
        time: m.time,
        home: m.home,
        homeIso2: allTeams.find(t => t.name === m.home)?.iso2 ?? '',
        away: m.away,
        awayIso2: allTeams.find(t => t.name === m.away)?.iso2 ?? '',
        venue: m.venue,
        group: m.group,
      }))

    const advStage = advRow?.stage_reached ?? null

    // Fallback: sjekk om R32-motstanderen har avansert, selv uten match_results-rad (football-data.org-forsinkelse)
    const r32OpponentName = advStage === 'group' ? (() => {
      const slot = findTeamR32Slot(pick.team_name, confirmedPos, confirmed3rd)
      if (!slot) return null
      const draw = R32_DRAW.find(d => d.home === slot || d.away === slot)
      if (!draw) return null
      const oppSlot = draw.home === slot ? draw.away : draw.home
      return resolvePos(oppSlot, confirmedPos, confirmed3rd)
    })() : null
    const r32OppAdv = r32OpponentName ? advRows.find(a => a.team_name === r32OpponentName) : null
    const lostR32ByAdv = !!r32OppAdv && (PLAYED_STAGE_ORDER[r32OppAdv.stage_reached ?? ''] ?? 0) > 0

    const playedSF = played.some(m => m.stage === 'sf')
    const playedBronze = played.some(m => m.stage === 'bronze')
    // SF-taper uten bronse-resultat ennå → har bronsefinale igjen
    const isSFLoser = advStage === 'qf' && playedSF && !playedBronze

    const allGroupsDone = matchResults.filter(m => !m.stage || m.stage === 'group').length >= 72
    const isEliminated = vmStarted && (
      (!advRow && allGroupsDone) ||
      (advStage === 'group' && (played.some(m => m.stage === 'r32') || lostR32ByAdv)) ||
      (advStage === 'r32'   && played.some(m => m.stage === 'r16')) ||
      (advStage === 'r16'   && played.some(m => m.stage === 'qf'))  ||
      (advStage === 'qf'    && playedSF && playedBronze)
    )

    let knockoutUpcoming: string | null = null
    if (isEliminated) {
      // already out — no upcoming match
    } else if (isSFLoser) {
      knockoutUpcoming = 'Bronsefinale'
    } else if (advStage && STAGE_SEQUENCE.includes(advStage)) {
      const nextStage = STAGE_SEQUENCE[STAGE_SEQUENCE.indexOf(advStage) + 1]
      if (nextStage && KNOCKOUT_UPCOMING[nextStage]) {
        const hasNextMatch = matchResults.some(m =>
          (m.home_team === pick.team_name || m.away_team === pick.team_name) &&
          m.stage === nextStage
        )
        if (!hasNextMatch) knockoutUpcoming = KNOCKOUT_UPCOMING[nextStage]
      }
    }

    let knockoutOpponent = null
    if (knockoutUpcoming) {
      if (isSFLoser) {
        // Motstanderen er den andre SF-taperen
        const otherSFLoser = matchResults
          .filter(m => m.stage === 'sf')
          .map(m => m.home_goals < m.away_goals ? m.home_team : m.away_team)
          .find(t => t !== pick.team_name) ?? null
        if (otherSFLoser) {
          const t = allTeams.find(t => t.name === otherSFLoser)
          knockoutOpponent = { name: otherSFLoser, flag: t?.flag ?? '🏳' }
        }
      } else {
        knockoutOpponent = getKnockoutOpponent(pick.team_name, advStage, matchResults, allTeams)
      }
    }

    return {
      potNumber: pick.pot_number,
      teamName: pick.team_name,
      flag: team?.flag ?? '🏳',
      odds: team?.odds ?? '–',
      pickPct: pickPercent(pick.team_name),
      fifaRanking: team?.fifaRanking ?? 0,

      vmGroup: team?.vmGroup ?? '–',
      color: POT_COLORS[pick.pot_number - 1],
      matchPts,
      advPts,
      multiplier,
      total,
      stageLabel: isEliminated ? null : stageLabel,
      advStage: advRow?.stage_reached ?? null,
      played,
      upcoming,
      knockoutUpcoming,
      knockoutOpponent,
      knockoutDate: koScheduleMap[pick.team_name]?.date ?? koScheduleMap[knockoutOpponent?.name ?? '']?.date,
      knockoutTime: koScheduleMap[pick.team_name]?.time ?? koScheduleMap[knockoutOpponent?.name ?? '']?.time,
      knockoutChannel: koScheduleMap[pick.team_name]?.channel ?? koScheduleMap[knockoutOpponent?.name ?? '']?.channel,
      isEliminated,
    }
  })

  const seenTeamsInUpcoming = new Set<string>()
  const knockoutUpcomingMatches: UpcomingMatch[] = enrichedPicks
    .filter(pick => !pick.isEliminated && pick.knockoutOpponent !== null)
    .reduce<UpcomingMatch[]>((acc, pick) => {
      const opponentName = pick.knockoutOpponent!.name
      if (seenTeamsInUpcoming.has(pick.teamName) || seenTeamsInUpcoming.has(opponentName)) return acc
      seenTeamsInUpcoming.add(pick.teamName)
      seenTeamsInUpcoming.add(opponentName)
      const schedEntry = koScheduleMap[pick.teamName] ?? koScheduleMap[opponentName] ?? null
      const roundDate = schedEntry?.date ?? KNOCKOUT_ROUND_DATES[pick.knockoutUpcoming ?? ''] ?? '2026-06-28'
      const roundTime = schedEntry?.time ?? '00:00'
      acc.push({
        id: `ko-${pick.teamName}`,
        date: roundDate,
        time: roundTime,
        home: pick.teamName,
        homeIso2: getIso2(pick.teamName),
        away: opponentName,
        awayIso2: getIso2(pick.knockoutOpponent!.name),
        isHome: true,
        channel: schedEntry?.channel,
      })
      return acc
    }, [])

  const allUpcoming = [...upcomingAll, ...knockoutUpcomingMatches]
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  return (
    <div className="page-bg" style={{ minHeight: '100vh', color: '#fff', padding: '32px 16px 56px', position: 'relative' }}>
      <img src="/snåsamannen.png" alt="" style={{ position: 'absolute', right: -10, top: 0, width: 260, opacity: 0.32, pointerEvents: 'none', zIndex: 0, filter: 'brightness(1.0) saturate(0.7) contrast(1.05)', maskImage: 'radial-gradient(ellipse 62% 58% at 56% 34%, black 0%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 62% 58% at 56% 34%, black 0%, transparent 100%)' }} />

      {/* Brand banner — nav + VM-SPILLET */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 60, zIndex: 1 }}>
        <Link href={back.href} className="back-btn">{back.label}</Link>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', lineHeight: 1.3, paddingTop: 4, whiteSpace: 'nowrap', background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)' }}>
            — Snåsamannen 2026 —
          </div>
          <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: 32, letterSpacing: '-0.5px', lineHeight: 1, whiteSpace: 'nowrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.38)' }}>VM-</span>
            <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
          </div>
        </div>
        <Link href="/vm-info?fra=minside" className="back-btn">Info →</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18))' }} />
        <div style={{ fontFamily: SPORT, fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.3, paddingTop: 4, background: 'linear-gradient(180deg, #ffffff 0%, #86efac 55%, rgba(34,197,94,0.8) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap', textShadow: '0 0 20px rgba(34,197,94,0.2), 0 0 6px rgba(34,197,94,0.25)' }}>{p.name}</div>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.18))' }} />
      </div>

      {vmStarted && <LiveMatchesBar expandable />}

      {vmStarted ? (
        <>
          {/* ── TOTALPOENG + MINE LAG ── */}
          <div style={{ marginTop: 24, marginBottom: 12 }}>
            {/* Totalpoeng-boks øverst */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', marginBottom: 20, background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', flexShrink: 0 }}>Totalpoeng</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <PointsDelta participantId={p.id} totalPoints={totalPoints} />
                <div style={{ width: 64, textAlign: 'right', flexShrink: 0 }}><CountUp value={totalPoints} /></div>
              </div>
            </div>
            {/* Mine lag under */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)', flexShrink: 0 }}>Mine lag</div>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1))' }} />
            </div>
            <PicksClient picks={enrichedPicks} totalPoints={totalPoints} vmStarted={vmStarted} pointsAccent="green" pointsColWidth={64} alignPointsTop stageBadgeInline stageBadgeColor="#4ade80" hideTotal />
          </div>

          {/* ── LIGAER (under) ── */}
          <div style={{ marginTop: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', flexShrink: 0 }}>Ligaer</div>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1))' }} />
            </div>
            <MinSideAccordions participantId={p.id} overallRank={rank} overallTotal={totalParticipants} actionsHidden />
          </div>

          {/* ── NESTE KAMPER ── */}
          {allUpcoming.length > 0 && (
            <div style={{ marginTop: 36, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)', flexShrink: 0 }}>Dine neste kamper</div>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1))' }} />
              </div>
              <UpcomingMatchCard matches={allUpcoming} />
            </div>
          )}

          {/* ── VM-STATUS ── */}
          {displayStage && (
            <Link href={displayStage === 'group' ? '/vm-info?tab=kamper' : '/vm-info?tab=sluttspill'} className="guide-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', marginBottom: 10, marginTop: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, textDecoration: 'none' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                VM er i <span style={{ color: '#fff', fontWeight: 700 }}>{VM_STAGE_LABEL[displayStage ?? '']}</span>-fasen
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Se bracket →</span>
            </Link>
          )}
        </>
      ) : (
        <>
          {/* ── LIGAER (før VM) ── */}
          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)', flexShrink: 0 }}>Ligaer</div>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1))' }} />
            </div>
            <MinSideAccordions participantId={p.id} overallRank={rank} overallTotal={totalParticipants} />
          </div>

          {/* ── NESTE KAMPER ── */}
          {allUpcoming.length > 0 && (
            <div style={{ marginBottom: 8, marginTop: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)', flexShrink: 0 }}>Dine neste kamper</div>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1))' }} />
              </div>
              <UpcomingMatchCard matches={allUpcoming} />
            </div>
          )}

          {/* ── MINE LAG ── */}
          <div style={{ marginTop: 44, marginBottom: 12 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)', flexShrink: 0 }}>Mine lag</div>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1))' }} />
              {editable && (
                <Link href={`/tipp?edit=${id}`} className="text-link" style={{ position: 'absolute', right: 0, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', letterSpacing: '0.04em' }}>
                  ✏️ Endre
                </Link>
              )}
            </div>
            <PicksClient picks={enrichedPicks} totalPoints={totalPoints} vmStarted={vmStarted} pointsAccent="green" pointsColWidth={48} alignPointsTop stageBadgeInline stageBadgeColor="#4ade80" />
          </div>
        </>
      )}

      {/* ── INFO OG VM-GUIDE ── */}
      <Link
        href="/vm-info"
        className="guide-btn"
        style={{
          display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 28,
          padding: '16px 22px', textAlign: 'center',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.05) 100%)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 14,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 12px rgba(0,0,0,0.3)',
          color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: SPORT, textDecoration: 'none',
        }}
      >
        VM-guide og Info →
      </Link>

      <LogoutButton />

    </div>
  )
}
