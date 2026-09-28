import { NextRequest } from 'next/server'
import type { getSupabaseAdmin } from './supabaseAdmin'

// Generisk rate-limiting delt på tvers av endepunkter (tidligere fantes dette
// KUN for admin-login, som sitt eget dedikerte mønster — /api/finn og
// /api/tipp/update hadde ingen begrensning i det hele tatt). Én tabell,
// skilt med "bucket" per bruksområde, i stedet for én ny tabell per
// endepunkt. Se supabase/add_rate_limits.sql.
type Supabase = ReturnType<typeof getSupabaseAdmin>

export function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

export async function isRateLimited(
  supabase: Supabase,
  bucket: string,
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMs).toISOString()
  const { count } = await supabase
    .from('rate_limit_hits')
    .select('*', { count: 'exact', head: true })
    .eq('bucket', bucket)
    .eq('key', key)
    .gte('created_at', windowStart)
  return (count ?? 0) >= limit
}

export async function recordRateLimitHit(supabase: Supabase, bucket: string, key: string): Promise<void> {
  await supabase.from('rate_limit_hits').insert({ bucket, key })
}

/**
 * Sjekk og registrer i ÉN atomisk operasjon (Postgres-funksjonen
 * `check_rate_limit` i supabase/schema.sql, som tar et advisory lock per
 * bucket+key) — bruk denne fremfor separate isRateLimited()+
 * recordRateLimitHit()-kall der de to uansett skjer rett etter hverandre.
 * Å kalle dem separat har et kappløp: to samtidige forespørsler kan begge
 * lese "under grensen" før noen av dem har satt inn sin rad, og dermed
 * slippe én for mange gjennom.
 *
 * Bruk IKKE denne der registreringen bevisst skal skje et annet sted enn
 * sjekken (se `src/app/api/tipp/route.ts`, som først teller et forsøk når
 * en påmelding faktisk lagres, ikke ved valideringsfeil) — behold de to
 * separate funksjonene der.
 *
 * @returns true = innenfor grensen (et nytt hit ble registrert). false = blokkert (ingenting registrert).
 */
export async function tryRecordRateLimitHit(
  supabase: Supabase,
  bucket: string,
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_bucket: bucket,
    p_key: key,
    p_limit: limit,
    p_window_ms: windowMs,
  })
  if (error) throw error
  return data === true
}
