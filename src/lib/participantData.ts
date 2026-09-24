// Server-side datalag for Min side, leaderboard og liga-sidene. Én inngang per
// side som enten leser fra Supabase (`dart_vm`-skjemaet) eller — for demo-
// deltakeren/-ligaene — fra den innebygde demo-verdenen i src/lib/demo.ts.
// Sidene selv trenger ikke vite hvilken kilde dataene kom fra; de får samme
// form uansett, pluss et `demo`-felt (fasen) når det er demo.

import { cache } from 'react'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { POTS } from '@/data/pots'
import { STAGE_ORDER } from '@/config/scoring'
import { calcParticipantPoints, isPlayerEliminated, isPlayerChampion, furthestStageReached, type MatchResult, type PickWithPot } from '@/lib/scoring'
import { getRankBaseline, RANK_ARROW_LEAGUES } from '@/lib/rankSnapshot'
import type { RankEntry } from '@/components/RankList'
import {
  DEMO_COOKIE, DEMO_LEAGUES, DEMO_PARTICIPANTS, type DemoPhase,
  getDemoLeague, getDemoMatches, getDemoParticipant, isDemoId, isDemoLeagueCode, parseDemoPhase,
} from '@/lib/demo'
import { KICKOFF } from '@/config/tournament'
export { KICKOFF }

export interface ParticipantRow { id: string; name: string; email: string; created_at: string }
export interface PickRow extends PickWithPot { participant_id: string }

export interface ParticipantPageData {
  participant: ParticipantRow
  picks: PickWithPot[]
  matchResults: MatchResult[]
  totalPoints: number
  rank: number
  totalParticipants: number
  vmStarted: boolean
  /** Satt når dette er demo-deltakeren — fasen som vises */
  demo: DemoPhase | null
}

export interface BoardData {
  rows: RankEntry[]
  matchResults: MatchResult[]
  vmStarted: boolean
  demo: DemoPhase | null
}

export interface LeagueData extends BoardData {
  league: { id: string; name: string; invite_code: string; created_by: string; hidden_until_kickoff: boolean | null }
}

// ── Demo-fase ──────────────────────────────────────────────────────────────

/** Fase fra ?fase=… (vinner) eller demo-cookien. null = ingen demo aktiv. */
export async function readDemoPhase(fromQuery?: string | null): Promise<DemoPhase | null> {
  const q = parseDemoPhase(fromQuery)
  if (q) return q
  try {
    return parseDemoPhase((await cookies()).get(DEMO_COOKIE)?.value)
  } catch {
    return null
  }
}

// ── Felles beregninger ─────────────────────────────────────────────────────

function groupPicks(rows: PickRow[]): Map<string, PickWithPot[]> {
  const by = new Map<string, PickWithPot[]>()
  for (const r of rows) {
    if (!by.has(r.participant_id)) by.set(r.participant_id, [])
    by.get(r.participant_id)!.push({ pot_number: r.pot_number, player_name: r.player_name })
  }
  return by
}

function rankAmong(myPoints: number, byParticipant: Map<string, PickWithPot[]>, matches: MatchResult[]): number {
  let above = 0
  for (const picks of byParticipant.values()) if (calcParticipantPoints(picks, matches) > myPoints) above++
  return above + 1
}

/** Bygger sorterte leaderboard-rader (samme logikk for hoved-leaderboard og liga). */
export function buildRankRows(
  participants: { id: string; name: string; created_at: string }[],
  picks: PickRow[],
  matches: MatchResult[],
  baseline: Record<string, number>,
  vmStarted: boolean,
): RankEntry[] {
  const by = groupPicks(picks)
  const scored = participants
    .map((p) => {
      const playerPicks = (by.get(p.id) ?? []).slice().sort((a, b) => a.pot_number - b.pot_number)
      const points = calcParticipantPoints(playerPicks, matches)
      return { p, playerPicks, points }
    })
    // Tie-breaker: den som meldte seg på først vinner uavgjort — enkel å
    // forklare, krever ingen ekstra data.
    .sort((a, b) => b.points - a.points || a.p.created_at.localeCompare(b.p.created_at))

  return scored.map(({ p, playerPicks, points }, i) => ({
    id: p.id,
    name: p.name,
    points,
    rankDelta: vmStarted && baseline[p.id] != null ? baseline[p.id] - (i + 1) : undefined,
    flags: playerPicks.map((pk) => {
      const pot = POTS.find((pt) => pt.potNumber === pk.pot_number)
      const iso2 = pot?.players.find((pl) => pl.name === pk.player_name)?.iso2 ?? ''
      const stageReached = furthestStageReached(pk.player_name, matches, STAGE_ORDER)
      const champion = isPlayerChampion(pk.player_name, matches)
      const medal = champion ? 'gold' : stageReached === 'final' ? 'silver' : undefined
      return { iso2, eliminated: isPlayerEliminated(pk.player_name, matches), medal }
    }),
  }))
}

// «I går» i demo-verdenen = stillingen før siste spilte runde, så rang-pilene
// får noe å vise.
function demoBaseline(phase: DemoPhase, ids: string[]): Record<string, number> {
  const matches = getDemoMatches(phase)
  if (matches.length === 0) return {}
  const lastStage = matches[matches.length - 1].stage
  const yesterday = matches.filter((m) => m.stage !== lastStage)
  const rows = buildRankRows(
    DEMO_PARTICIPANTS.filter((p) => ids.includes(p.id)),
    DEMO_PARTICIPANTS.flatMap((p) => p.picks.map((pk) => ({ ...pk, participant_id: p.id }))),
    yesterday, {}, false,
  )
  return Object.fromEntries(rows.map((r, i) => [r.id, i + 1]))
}

function demoPickRows(ids?: string[]): PickRow[] {
  return DEMO_PARTICIPANTS
    .filter((p) => !ids || ids.includes(p.id))
    .flatMap((p) => p.picks.map((pk) => ({ ...pk, participant_id: p.id })))
}

// ── Alle kamper (VM-guiden) ────────────────────────────────────────────────

export async function getMatches(phaseFromQuery?: string | null): Promise<MatchResult[]> {
  const phase = await readDemoPhase(phaseFromQuery)
  if (phase) return getDemoMatches(phase)
  let supabase: ReturnType<typeof getSupabaseAdmin>
  try { supabase = getSupabaseAdmin() } catch { return [] }
  const { data } = await supabase
    .from('match_results')
    .select('player1, player2, sets1, sets2, stage, winner')
    .order('played_at', { ascending: true })
  return (data as MatchResult[]) ?? []
}

// ── Min side ───────────────────────────────────────────────────────────────

// React cache(): siden OG generateMetadata() kaller denne med samme argumenter
// i samme request — dedupes så databasen bare spørres én gang.
export const getParticipantPageData = cache(async function getParticipantPageData(id: string, phaseFromQuery?: string | null): Promise<ParticipantPageData | null> {
  if (isDemoId(id)) {
    const p = getDemoParticipant(id)
    if (!p) return null
    const phase = (await readDemoPhase(phaseFromQuery)) ?? 'live'
    const matchResults = getDemoMatches(phase)
    const by = groupPicks(demoPickRows())
    const totalPoints = calcParticipantPoints(p.picks, matchResults)
    return {
      participant: { id: p.id, name: p.name, email: p.email, created_at: p.created_at },
      picks: p.picks,
      matchResults,
      totalPoints,
      rank: rankAmong(totalPoints, by, matchResults),
      totalParticipants: by.size,
      vmStarted: phase !== 'for',
      demo: phase,
    }
  }

  let supabase: ReturnType<typeof getSupabaseAdmin>
  try { supabase = getSupabaseAdmin() } catch { return null }

  const [{ data: participant }, { data: picksData }, { data: matches }, { data: allPicksData }] = await Promise.all([
    supabase.from('participants').select('id, name, email, created_at').eq('id', id).single(),
    supabase.from('picks').select('pot_number, player_name').eq('participant_id', id).order('pot_number'),
    supabase.from('match_results').select('player1, player2, sets1, sets2, stage, winner'),
    supabase.from('picks').select('participant_id, pot_number, player_name'),
  ])
  if (!participant) return null

  const picks = (picksData as PickWithPot[]) ?? []
  const matchResults = (matches as MatchResult[]) ?? []
  const by = groupPicks((allPicksData as PickRow[]) ?? [])
  const totalPoints = calcParticipantPoints(picks, matchResults)
  return {
    participant: participant as ParticipantRow,
    picks,
    matchResults,
    totalPoints,
    rank: rankAmong(totalPoints, by, matchResults),
    totalParticipants: by.size,
    vmStarted: new Date() >= KICKOFF,
    demo: null,
  }
})

// ── Leaderboard ────────────────────────────────────────────────────────────

export async function getLeaderboardData(phaseFromQuery?: string | null): Promise<BoardData> {
  const phase = await readDemoPhase(phaseFromQuery)
  if (phase) {
    const matchResults = getDemoMatches(phase)
    const vmStarted = phase !== 'for'
    const ids = DEMO_PARTICIPANTS.map((p) => p.id)
    const rows = buildRankRows(DEMO_PARTICIPANTS, demoPickRows(), matchResults, vmStarted ? demoBaseline(phase, ids) : {}, vmStarted)
    return { rows, matchResults, vmStarted, demo: phase }
  }

  const vmStarted = new Date() >= KICKOFF
  let supabase: ReturnType<typeof getSupabaseAdmin>
  try { supabase = getSupabaseAdmin() } catch { return { rows: [], matchResults: [], vmStarted, demo: null } }

  const [{ data: participants }, { data: matches }] = await Promise.all([
    supabase.from('participants').select('id, name, created_at').order('created_at'),
    supabase.from('match_results').select('player1, player2, sets1, sets2, stage, winner'),
  ])
  const matchResults = (matches as MatchResult[]) ?? []
  if (!participants?.length) return { rows: [], matchResults, vmStarted, demo: null }

  const ids = (participants as ParticipantRow[]).map((p) => p.id)
  const [{ data: picks }, baseline] = await Promise.all([
    supabase.from('picks').select('participant_id, pot_number, player_name').in('participant_id', ids),
    getRankBaseline('overall'),
  ])
  const rows = buildRankRows(participants as ParticipantRow[], (picks as PickRow[]) ?? [], matchResults, baseline, vmStarted)
  return { rows, matchResults, vmStarted, demo: null }
}

// ── Liga ───────────────────────────────────────────────────────────────────

export const getLeagueData = cache(async function getLeagueData(code: string, phaseFromQuery?: string | null): Promise<LeagueData | null> {
  if (isDemoLeagueCode(code)) {
    const league = getDemoLeague(code)
    if (!league) return null
    const phase = (await readDemoPhase(phaseFromQuery)) ?? 'live'
    const matchResults = getDemoMatches(phase)
    const vmStarted = phase !== 'for'
    const members = DEMO_PARTICIPANTS.filter((p) => league.members.includes(p.id))
    const rows = buildRankRows(members, demoPickRows(league.members), matchResults, vmStarted ? demoBaseline(phase, league.members) : {}, vmStarted)
    return {
      league: { id: league.id, name: league.name, invite_code: league.invite_code, created_by: league.created_by, hidden_until_kickoff: false },
      rows, matchResults, vmStarted, demo: phase,
    }
  }

  const vmStarted = new Date() >= KICKOFF
  let supabase: ReturnType<typeof getSupabaseAdmin>
  try { supabase = getSupabaseAdmin() } catch { return null }

  const { data: league } = await supabase
    .from('leagues')
    .select('id, name, invite_code, created_by, hidden_until_kickoff')
    .eq('invite_code', code.toUpperCase())
    .maybeSingle()
  if (!league) return null

  const { data: members } = await supabase
    .from('league_members')
    .select('participant:participants(id, name, created_at)')
    .eq('league_id', league.id)
  const participants = (members ?? [])
    .map((m) => m.participant as unknown as { id: string; name: string; created_at: string } | null)
    .filter((p): p is { id: string; name: string; created_at: string } => !!p)
  if (participants.length === 0) return { league, rows: [], matchResults: [], vmStarted, demo: null }

  const ids = participants.map((p) => p.id)
  const showArrows = RANK_ARROW_LEAGUES.includes(league.invite_code)
  const [{ data: picks }, { data: matches }, baseline] = await Promise.all([
    supabase.from('picks').select('participant_id, pot_number, player_name').in('participant_id', ids),
    supabase.from('match_results').select('player1, player2, sets1, sets2, stage, winner'),
    showArrows ? getRankBaseline(league.invite_code) : Promise.resolve({} as Record<string, number>),
  ])
  const matchResults = (matches as MatchResult[]) ?? []
  const rows = buildRankRows(participants, (picks as PickRow[]) ?? [], matchResults, baseline, vmStarted)
  return { league, rows, matchResults, vmStarted, demo: null }
})

// ── Ligaer for én deltaker (API: /api/league/mine) ─────────────────────────

export interface MyLeague { name: string; invite_code: string; rank: number; total: number }

export function getDemoLeaguesFor(participantId: string, phase: DemoPhase): MyLeague[] {
  const matches = getDemoMatches(phase)
  return DEMO_LEAGUES.filter((l) => l.members.includes(participantId)).map((l) => {
    const by = groupPicks(demoPickRows(l.members))
    const myPts = calcParticipantPoints(by.get(participantId) ?? [], matches)
    return { name: l.name, invite_code: l.invite_code, rank: rankAmong(myPts, by, matches), total: l.members.length }
  })
}
