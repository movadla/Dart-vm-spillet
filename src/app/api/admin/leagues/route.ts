import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { checkAdminAuth } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const supabase = getSupabaseAdmin()

  const { data: leagues, error } = await supabase
    .from('leagues')
    .select('id, name, invite_code, created_at, created_by, hidden_until_kickoff')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Feil ved henting av ligaer' }, { status: 500 })
  if (!leagues || leagues.length === 0) return NextResponse.json({ leagues: [] })

  const leaguesWithCounts = await Promise.all(
    leagues.map(async (league) => {
      const { count } = await supabase
        .from('league_members')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', league.id)
      return { ...league, member_count: count ?? 0 }
    })
  )

  return NextResponse.json({ leagues: leaguesWithCounts })
}
