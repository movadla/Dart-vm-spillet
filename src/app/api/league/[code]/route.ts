import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

import { calcParticipantPoints, MatchResult } from '@/lib/scoring'

interface Pick { participant_id: string; pot_number: number; player_name: string }

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  // Klienten lages per kall — manglende Supabase-konfigurasjon skal gi et
  // forståelig svar fra handleren, ikke crash ved import av ruten.
  const supabase = getSupabaseAdmin()
  const { code } = await params

  const { data: league } = await supabase
    .from('leagues')
    .select('id, name, invite_code, created_by, created_at')
    .eq('invite_code', code.toUpperCase())
    .maybeSingle()

  if (!league) return NextResponse.json({ error: 'Liga ikke funnet' }, { status: 404 })

  const { data: members } = await supabase
    .from('league_members')
    .select('participant:participants(id, name)')
    .eq('league_id', league.id)

  if (!members?.length) {
    return NextResponse.json({ league, rows: [] })
  }

  const participantIds = members
    .map((m) => (m.participant as unknown as { id: string; name: string } | null)?.id)
    .filter(Boolean) as string[]

  const [{ data: picks }, { data: matches }] = await Promise.all([
    supabase.from('picks').select('participant_id, pot_number, player_name').in('participant_id', participantIds),
    supabase.from('match_results').select('player1, player2, sets1, sets2, stage, winner'),
  ])

  const rows = members
    .map((m) => {
      const p = m.participant as unknown as { id: string; name: string } | null
      if (!p) return null
      const playerPicks = ((picks as Pick[]) ?? []).filter((pk) => pk.participant_id === p.id)
      const points = calcParticipantPoints(playerPicks, (matches as MatchResult[]) ?? [])
      return { id: p.id, name: p.name, points, picks: playerPicks.sort((a, b) => a.pot_number - b.pot_number) }
    })
    .filter(Boolean)
    .sort((a, b) => b!.points - a!.points)

  return NextResponse.json({ league, rows })
}
