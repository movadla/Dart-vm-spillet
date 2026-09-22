import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { calcAdvancementBonus } from '@/lib/scoring'
import { SCORING, STAGE_ORDER, type Stage } from '@/config/scoring'

interface MatchRow {
  player1: string
  player2: string
  stage: string
  winner: string | null
  played_at: string
}

interface PickRow {
  participant_id: string
  pot_number: number
  player_name: string
}

// Utleder hvilken runde en spiller hadde nådd basert på registrerte kamper frem til dette punktet:
// den siste (høyeste) runden de spilte i, uavhengig av om de vant eller tapte den.
function inferStageReached(playerName: string, matches: MatchRow[]): string | null {
  let furthest: Stage | null = null
  for (const m of matches) {
    if (m.player1 !== playerName && m.player2 !== playerName) continue
    const stage = m.stage as Stage
    const idx = STAGE_ORDER.indexOf(stage)
    if (idx === -1) continue
    if (!furthest || idx > STAGE_ORDER.indexOf(furthest)) furthest = stage
  }
  return furthest
}

function calcPointsAtDate(picks: PickRow[], matches: MatchRow[]): number {
  let total = 0
  for (const pick of picks) {
    const advPts = calcAdvancementBonus(inferStageReached(pick.player_name, matches))
    const multiplier = SCORING.underdogMultiplier[pick.pot_number] ?? 1
    total += advPts * multiplier
  }
  return total
}

export async function GET() {
  try {
  const supabase = getSupabaseAdmin()

  const [{ data: participants }, { data: allMatches }, { data: allPicks }] = await Promise.all([
    supabase.from('participants').select('id, name').order('created_at'),
    supabase
      .from('match_results')
      .select('player1, player2, stage, winner, played_at')
      .order('played_at'),
    supabase.from('picks').select('participant_id, pot_number, player_name'),
  ])

  const matches = (allMatches ?? []) as MatchRow[]
  const picks = (allPicks ?? []) as PickRow[]

  const picksByParticipant = new Map<string, PickRow[]>()
  for (const pick of picks) {
    if (!picksByParticipant.has(pick.participant_id))
      picksByParticipant.set(pick.participant_id, [])
    picksByParticipant.get(pick.participant_id)!.push(pick)
  }

  const matchesByDate = new Map<string, MatchRow[]>()
  for (const m of matches) {
    const date = m.played_at.slice(0, 10)
    if (!matchesByDate.has(date)) matchesByDate.set(date, [])
    matchesByDate.get(date)!.push(m)
  }
  const sortedDates = [...matchesByDate.keys()].sort()

  const activeParticipants = ((participants ?? []) as { id: string; name: string }[]).filter(p =>
    picksByParticipant.has(p.id)
  )

  type DataPoint = Record<string, number | string>
  const series: DataPoint[] = []
  let cumulative: MatchRow[] = []

  for (const date of sortedDates) {
    cumulative = cumulative.concat(matchesByDate.get(date)!)
    const point: DataPoint = { date }
    for (const p of activeParticipants) {
      point[p.id] = calcPointsAtDate(picksByParticipant.get(p.id) ?? [], cumulative)
    }
    series.push(point)
  }

  const last = series[series.length - 1] ?? {}
  const rankedParticipants = activeParticipants
    .map(p => ({ id: p.id, name: p.name, points: (last[p.id] ?? 0) as number }))
    .sort((a, b) => b.points - a.points)

  return NextResponse.json({ series, participants: rankedParticipants })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
