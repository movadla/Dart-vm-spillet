import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { checkAdminAuth } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const supabase = getSupabaseAdmin()
  const leagueId = req.nextUrl.searchParams.get('leagueId')

  let participantIds: string[] | null = null

  if (leagueId) {
    const { data: members, error } = await supabase
      .from('league_members')
      .select('participant_id')
      .eq('league_id', leagueId)

    if (error) return NextResponse.json({ error: 'Feil ved henting av ligamedlemmer' }, { status: 500 })

    participantIds = (members ?? []).map((m: { participant_id: string }) => m.participant_id)

    if (participantIds.length === 0) {
      return NextResponse.json({ byPot: {}, totalPicks: 0, participantCount: 0 })
    }
  }

  let query = supabase.from('picks').select('participant_id, pot_number, player_name')
  if (participantIds) query = query.in('participant_id', participantIds)

  const { data: picks, error } = await query

  if (error) return NextResponse.json({ error: 'Feil ved henting av picks' }, { status: 500 })
  if (!picks?.length) return NextResponse.json({ byPot: {}, totalPicks: 0, participantCount: 0 })

  const byPot: Record<number, Record<string, number>> = {}
  for (const pick of picks) {
    if (!byPot[pick.pot_number]) byPot[pick.pot_number] = {}
    byPot[pick.pot_number][pick.player_name] = (byPot[pick.pot_number][pick.player_name] ?? 0) + 1
  }

  const sorted: Record<number, { team: string; count: number }[]> = {}
  for (const [pot, counts] of Object.entries(byPot)) {
    sorted[Number(pot)] = Object.entries(counts)
      .map(([team, count]) => ({ team, count }))
      .sort((a, b) => b.count - a.count)
  }

  const participantCount = new Set(picks.map((p) => p.participant_id)).size

  return NextResponse.json({ byPot: sorted, totalPicks: picks.length, participantCount })
}
