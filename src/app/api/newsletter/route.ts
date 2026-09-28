import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { clientIp, tryRecordRateLimitHit } from '@/lib/rateLimit'
import { getLocale } from '@/lib/i18n/getLocale'
import { getDictionary } from '@/i18n/dictionaries'

// Åpent endepunkt → begrenses per IP så det ikke kan brukes til å fylle
// tabellen med søppel-adresser.
const LIMIT = 10
const WINDOW_MS = 60 * 60 * 1000

export async function POST(req: NextRequest) {
  const { newsletter: dict } = getDictionary(await getLocale()).errors
  const { email } = await req.json()
  if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 254) {
    return NextResponse.json({ error: dict.invalidEmail }, { status: 400 })
  }

  let supabase: ReturnType<typeof getSupabaseAdmin>
  try { supabase = getSupabaseAdmin() } catch { return NextResponse.json({ error: dict.dbNotSetUp }, { status: 503 }) }

  const ip = clientIp(req)
  if (!(await tryRecordRateLimitHit(supabase, 'newsletter', ip, LIMIT, WINDOW_MS))) {
    return NextResponse.json({ error: dict.tooManyAttempts }, { status: 429 })
  }

  await supabase.from('newsletter_signups').upsert({ email: email.trim().toLowerCase() })

  return NextResponse.json({ ok: true })
}
