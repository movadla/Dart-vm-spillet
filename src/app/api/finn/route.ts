import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { clientIp, isRateLimited, recordRateLimitHit } from '@/lib/rateLimit'
import { DEMO_COOKIE, DEMO_EMAIL, DEMO_ID, DEMO_PARTICIPANTS } from '@/lib/demo'
import { getLocale } from '@/lib/i18n/getLocale'
import { getDictionary } from '@/i18n/dictionaries'

// Uten dette var endepunktet ubegrenset scriptbart for e-post-enumerering
// (200 = e-posten finnes, 404 = den gjør ikke det) og for å finne enhver
// deltakers id (som deretter kunne vært brukt til å se "min side" for den
// personen). 20/time er romslig for en legitim bruker som roter med
// stavemåten, men stanser masseforsøk.
const LIMIT = 20
const WINDOW_MS = 60 * 60 * 1000

export async function POST(req: NextRequest) {
  const { errors: dict } = getDictionary(await getLocale())
  const { email } = await req.json()
  if (!email || typeof email !== 'string' || !email.includes('@') || email.split('@')[1]?.length === 0) {
    return NextResponse.json({ error: dict.finn.invalidEmail }, { status: 400 })
  }

  // Demo-deltakeren finnes ikke i databasen — «innloggingen» er bare id-en
  // `demo` + demo-cookien (se src/lib/demo.ts). Sjekkes før Supabase så
  // demoen fungerer også uten database.
  if (email.trim().toLowerCase() === DEMO_EMAIL) {
    const demo = DEMO_PARTICIPANTS.find((p) => p.id === DEMO_ID)!
    const res = NextResponse.json({ id: demo.id, name: demo.name, demo: true })
    res.cookies.set(DEMO_COOKIE, 'live', { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' })
    return res
  }

  let supabase: ReturnType<typeof getSupabaseAdmin>
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: dict.finn.dbNotSetUp }, { status: 503 })
  }
  const ip = clientIp(req)

  if (await isRateLimited(supabase, 'finn', ip, LIMIT, WINDOW_MS)) {
    return NextResponse.json({ error: dict.finn.tooManyAttempts }, { status: 429 })
  }
  await recordRateLimitHit(supabase, 'finn', ip)

  const { data, error } = await supabase
    .from('participants')
    .select('id, name')
    .ilike('email', email.trim())
    .order('created_at', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) {
    return NextResponse.json({ error: dict.finn.notFound }, { status: 404 })
  }

  // Ekte innlogging → demo-verdenen skal ikke henge igjen på leaderboardet.
  const res = NextResponse.json({ id: data[0].id, name: data[0].name })
  res.cookies.set(DEMO_COOKIE, '', { path: '/', maxAge: 0 })
  return res
}
