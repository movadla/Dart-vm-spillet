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
