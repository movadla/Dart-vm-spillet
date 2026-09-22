import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { calcParticipantPoints, type MatchResult, type PickWithPot } from '@/lib/scoring'

interface MatchRow extends MatchResult {
  played_at: string
}

export async function GET() {
  try {
  const supabase = getSupabaseAdmin()

  const [{ data: participants }, { data: allMatches }, { data: allPicks }] = await Promise.all([
    supabase.from('participants').select('id, name').order('created_at'),
    supabase
      .from('match_results')
      .select('player1, player2, sets1, sets2, stage, winner, played_at')
      .order('played_at'),
    supabase.from('picks').select('participant_id, pot_number, player_name'),
  ])

  const matches = (allMatches ?? []) as MatchRow[]
  const picks = (allPicks ?? []) as (PickWithPot & { participant_id: string })[]

  const picksByParticipant = new Map<string, PickWithPot[]>()
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
      point[p.id] = calcParticipantPoints(picksByParticipant.get(p.id) ?? [], cumulative)
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
