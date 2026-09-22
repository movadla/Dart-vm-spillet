import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { secureCompare } from '@/lib/adminAuth'

const RATE_LIMIT = 5              // maks forsøk
const WINDOW_MS = 15 * 60 * 1000  // per 15 minutter

function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  const ip = clientIp(req)

  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString()
  const { count } = await supabase
    .from('admin_login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', windowStart)

  if ((count ?? 0) >= RATE_LIMIT) {
    return NextResponse.json({ error: 'For mange forsøk. Vent 15 minutter og prøv igjen.' }, { status: 429 })
  }

  const { secret } = await req.json()
  const adminSecret = process.env.ADMIN_SECRET

  if (!adminSecret || typeof secret !== 'string' || !secureCompare(secret, adminSecret)) {
    await supabase.from('admin_login_attempts').insert({ ip })
    return NextResponse.json({ error: 'Feil kode' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_session', adminSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 dager
    path: '/',
  })
  return res
}
