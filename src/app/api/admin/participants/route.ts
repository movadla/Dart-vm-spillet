import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const supabase = getSupabaseAdmin()
import { checkAdminAuth } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError
  const { data, error } = await supabase
    .from('participants')
    .select('id, name, email, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Feil ved henting av deltakere' }, { status: 500 })
  }

  return NextResponse.json({ participants: data ?? [] })
}
