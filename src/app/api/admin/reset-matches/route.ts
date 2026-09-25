import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { checkAdminAuth } from '@/lib/adminAuth'
import { logAdminAction } from '@/lib/adminAudit'

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const supabase = getSupabaseAdmin()

  const { error } = await supabase.from('match_results').delete().neq('player1', '')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction('match-results.reset_all')
  return NextResponse.json({ success: true })
}
