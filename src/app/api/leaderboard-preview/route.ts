import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { calcParticipantPoints, AdvancementRow } from '@/lib/scoring'

const supabase = getSupabaseAdmin()

export const revalidate = 30

export async function GET() {
  const [{ data: participants }, { data: advancement }] = await Promise.all([
    supabase.from('participants').select('id, name').order('created_at'),
    supabase.from('advancement').select('player_name, stage_reached'),
  ])

  const advRows = (advancement as AdvancementRow[]) ?? []

  if (!participants?.length) return NextResponse.json({ rows: [], total: 0 })

  const ids = participants.map((p) => p.id)
  const { data: picks } = await supabase
    .from('picks')
    .select('participant_id, pot_number, player_name')
    .in('participant_id', ids)

  const rows = participants
    .map((p) => {
      const pp = (picks ?? []).filter((pk) => pk.participant_id === p.id)
      return { id: p.id, name: p.name, points: calcParticipantPoints(pp, advRows) }
    })
    .sort((a, b) => b.points - a.points)

  return NextResponse.json(
    { rows: rows.slice(0, 3), total: rows.length },
    { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' } }
  )
}
