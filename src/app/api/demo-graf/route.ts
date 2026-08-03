import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { calcTeamMatchPoints, calcAdvancementBonus } from '@/lib/scoring'
import { SCORING } from '@/config/scoring'

interface MatchRow {
  home_team: string
  away_team: string
  home_goals: number
  away_goals: number
  stage: string
  played_at: string
}

interface PickRow {
  participant_id: string
  pot_number: number
  team_name: string
}

function inferStageReached(teamName: string, matches: MatchRow[]): string | null {
  const inStage = (s: string) =>
    matches.some(m => (m.home_team === teamName || m.away_team === teamName) && m.stage === s)

  if (inStage('final')) {
    const m = matches.find(
      x => x.stage === 'final' && (x.home_team === teamName || x.away_team === teamName)
    )
    if (m) {
      const isHome = m.home_team === teamName
      return (isHome ? m.home_goals > m.away_goals : m.away_goals > m.home_goals) ? 'gold' : 'silver'
    }
    return 'sf'
  }
  if (inStage('bronze')) return 'bronze'
  if (inStage('sf')) return 'qf'
  if (inStage('qf')) return 'r16'
  if (inStage('r16')) return 'r32'
  if (inStage('r32')) return 'group'
  return null
}

function calcPointsAtDate(picks: PickRow[], matches: MatchRow[]): number {
  let total = 0
  for (const pick of picks) {
    const matchPts = calcTeamMatchPoints(pick.team_name, matches)
    const advPts = calcAdvancementBonus(inferStageReached(pick.team_name, matches))
    const multiplier = SCORING.underdogMultiplier[pick.pot_number] ?? 1
    total += (matchPts + advPts) * multiplier
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
      .select('home_team, away_team, home_goals, away_goals, stage, played_at')
      .order('played_at'),
    supabase.from('picks').select('participant_id, pot_number, team_name'),
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
