import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { calcParticipantPoints, MatchResult } from '@/lib/scoring'

interface Pick { pot_number: number; player_name: string }
interface PickWithParticipant { participant_id: string; pot_number: number; player_name: string }

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const [
    { data: participant },
    { data: myPicksData },
    { data: allPicksData },
    { data: matches },
  ] = await Promise.all([
    supabase.from('participants').select('name').eq('id', id).single(),
    supabase.from('picks').select('pot_number, player_name').eq('participant_id', id),
    supabase.from('picks').select('participant_id, pot_number, player_name'),
    supabase.from('match_results').select('player1, player2, sets1, sets2, stage, winner'),
  ])

  if (!participant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const picks = (myPicksData as Pick[]) ?? []
  const matchResults = (matches as MatchResult[]) ?? []
  const myPoints = calcParticipantPoints(picks, matchResults)

  const allPicks = (allPicksData as PickWithParticipant[]) ?? []
  const byParticipant = new Map<string, Pick[]>()
  for (const pick of allPicks) {
    if (!byParticipant.has(pick.participant_id)) byParticipant.set(pick.participant_id, [])
    byParticipant.get(pick.participant_id)!.push({ pot_number: pick.pot_number, player_name: pick.player_name })
  }

  const rank = Array.from(byParticipant.values())
    .filter(pp => calcParticipantPoints(pp, matchResults) > myPoints)
    .length + 1

  return NextResponse.json({
    name: (participant as { name: string }).name,
    points: myPoints,
    rank,
    totalParticipants: byParticipant.size,
  })
}
