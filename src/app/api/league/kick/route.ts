import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const { leagueId, kickId, adminId } = await req.json()
  if (!leagueId || !kickId || !adminId) return NextResponse.json({ error: 'Mangler data' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  const { data: league } = await supabase
    .from('leagues')
    .select('created_by')
    .eq('id', leagueId)
    .single()

  if (!league) return NextResponse.json({ error: 'Liga ikke funnet' }, { status: 404 })
  if (league.created_by !== adminId) return NextResponse.json({ error: 'Ikke tillatt' }, { status: 403 })
  if (kickId === adminId) return NextResponse.json({ error: 'Kan ikke kicke deg selv' }, { status: 400 })

  await supabase
    .from('league_members')
    .delete()
    .eq('league_id', leagueId)
    .eq('participant_id', kickId)

  return NextResponse.json({ ok: true })
}
