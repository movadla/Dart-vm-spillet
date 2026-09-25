import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { checkAdminAuth } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('admin_audit_log')
    .select('id, action, detail, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  // Feiler stille med tom liste hvis migrasjonen (add_admin_audit_log.sql) ikke
  // er kjørt ennå på denne databasen — "relation does not exist"-feil skal ikke
  // knekke Verktøy-fanen, kun vise loggen som tom.
  if (error) return NextResponse.json({ entries: [] })

  return NextResponse.json({ entries: data ?? [] })
}
