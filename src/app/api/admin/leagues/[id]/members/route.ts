import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { checkAdminAuth } from '@/lib/adminAuth'
import { calcParticipantPoints, AdvancementRow } from '@/lib/scoring'

interface Pick { participant_id: string; pot_number: number; player_name: string }

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const { id } = await params
  const supabase = getSupabaseAdmin()

  const { data: members } = await supabase
    .from('league_members')
    .select('participant:participants(id, name, email)')
    .eq('league_id', id)

  if (!members?.length) return NextResponse.json({ members: [] })

  const participantIds = members
    .map((m) => (m.participant as unknown as { id: string; name: string; email: string } | null)?.id)
    .filter(Boolean) as string[]

  const [{ data: picks }, { data: advancement }] = await Promise.all([
    supabase.from('picks').select('participant_id, pot_number, player_name').in('participant_id', participantIds),
    supabase.from('advancement').select('player_name, stage_reached'),
  ])

  const rows = members
    .map((m) => {
      const p = m.participant as unknown as { id: string; name: string; email: string } | null
      if (!p) return null
      const playerPicks = ((picks as Pick[]) ?? []).filter((pk) => pk.participant_id === p.id)
      const points = calcParticipantPoints(playerPicks, (advancement as AdvancementRow[]) ?? [])
      return { id: p.id, name: p.name, email: p.email, points }
    })
    .filter(Boolean)
    .sort((a, b) => b!.points - a!.points)

  return NextResponse.json({ members: rows })
}
