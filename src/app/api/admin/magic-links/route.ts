import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { checkAdminAuth } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('magic_links')
    .select('token, participant_id, expires_at, used_at, participants(name, email)')
    .order('expires_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: 'Feil ved henting av magic links' }, { status: 500 })

  return NextResponse.json({ links: data ?? [] })
}
