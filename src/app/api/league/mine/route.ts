import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const supabase = getSupabaseAdmin()
import { calcParticipantPoints, AdvancementRow } from '@/lib/scoring'

export async function GET(req: NextRequest) {
  const participantId = req.nextUrl.searchParams.get('participantId')
  if (!participantId) return NextResponse.json({ error: 'Mangler participantId' }, { status: 400 })

  const { data, error } = await supabase
    .from('league_members')
    .select('league:leagues(id, name, invite_code)')
    .eq('participant_id', participantId)

  if (error) return NextResponse.json({ leagues: [] })

  const rawLeagues = (data ?? [])
    .map((m) => m.league as unknown as { id: string; name: string; invite_code: string } | null)
    .filter(Boolean) as { id: string; name: string; invite_code: string }[]

  if (rawLeagues.length === 0) return NextResponse.json({ leagues: [] })

  const { data: advancement } = await supabase.from('advancement').select('player_name, stage_reached')
  const adv = (advancement as AdvancementRow[]) ?? []

  const leagues = await Promise.all(rawLeagues.map(async (league) => {
    const { data: members } = await supabase
      .from('league_members')
      .select('participant_id')
      .eq('league_id', league.id)

    const memberIds = (members ?? []).map((m) => m.participant_id as string)

    const { data: picks } = await supabase
      .from('picks')
      .select('participant_id, pot_number, player_name')
      .in('participant_id', memberIds)

    const allPicks = picks ?? []
    const myPts = calcParticipantPoints(allPicks.filter(p => p.participant_id === participantId), adv)
    const rank = memberIds.filter(id => {
      const pts = calcParticipantPoints(allPicks.filter(p => p.participant_id === id), adv)
      return pts > myPts
    }).length + 1

    return { name: league.name, invite_code: league.invite_code, rank, total: memberIds.length }
  }))

  return NextResponse.json({ leagues })
}
