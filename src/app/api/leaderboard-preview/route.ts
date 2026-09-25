import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { calcParticipantPoints, MatchResult } from '@/lib/scoring'

export const revalidate = 30

export async function GET() {
  // Klienten lages per kall — manglende Supabase-konfigurasjon skal gi et
  // forståelig svar fra handleren, ikke crash ved import av ruten.
  const supabase = getSupabaseAdmin()
  const [{ data: participants }, { data: matches }] = await Promise.all([
    supabase.from('participants').select('id, name').order('created_at'),
    supabase.from('match_results').select('player1, player2, sets1, sets2, stage, winner'),
  ])

  const matchResults = (matches as MatchResult[]) ?? []

  if (!participants?.length) return NextResponse.json({ rows: [], total: 0 })

  const ids = participants.map((p) => p.id)
  const { data: picks } = await supabase
    .from('picks')
    .select('participant_id, pot_number, player_name')
    .in('participant_id', ids)

  const rows = participants
    .map((p) => {
      const pp = (picks ?? []).filter((pk) => pk.participant_id === p.id)
      return { id: p.id, name: p.name, points: calcParticipantPoints(pp, matchResults) }
    })
    .sort((a, b) => b.points - a.points)

  return NextResponse.json(
    { rows: rows.slice(0, 3), total: rows.length },
    { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' } }
  )
}
