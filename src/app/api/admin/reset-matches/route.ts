import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { checkAdminAuth } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const supabase = getSupabaseAdmin()

  const [matchRes, advRes] = await Promise.all([
    supabase.from('match_results').delete().neq('home_team', ''),
    supabase.from('advancement').delete().neq('team_name', ''),
  ])

  if (matchRes.error) return NextResponse.json({ error: matchRes.error.message }, { status: 500 })
  if (advRes.error)   return NextResponse.json({ error: advRes.error.message  }, { status: 500 })

  return NextResponse.json({ success: true })
}
