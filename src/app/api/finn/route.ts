import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { clientIp, isRateLimited, recordRateLimitHit } from '@/lib/rateLimit'

// Uten dette var endepunktet ubegrenset scriptbart for e-post-enumerering
// (200 = e-posten finnes, 404 = den gjør ikke det) og for å finne enhver
// deltakers id (som deretter kunne vært brukt til å se "min side" for den
// personen). 20/time er romslig for en legitim bruker som roter med
// stavemåten, men stanser masseforsøk.
const LIMIT = 20
const WINDOW_MS = 60 * 60 * 1000

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  const ip = clientIp(req)

  if (await isRateLimited(supabase, 'finn', ip, LIMIT, WINDOW_MS)) {
    return NextResponse.json({ error: 'For mange forsøk. Vent en time og prøv igjen.' }, { status: 429 })
  }
  await recordRateLimitHit(supabase, 'finn', ip)

  const { email } = await req.json()
  if (!email || !email.includes('@') || email.split('@')[1]?.length === 0) {
    return NextResponse.json({ error: 'Ugyldig e-post' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('participants')
    .select('id, name')
    .ilike('email', email.trim())
    .order('created_at', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) {
    return NextResponse.json({ error: 'Fant ingen deltaker med den e-posten' }, { status: 404 })
  }

  return NextResponse.json({ id: data[0].id, name: data[0].name })
}
