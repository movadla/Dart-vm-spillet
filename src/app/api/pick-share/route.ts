import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

// «% valgt» på spillerkortene i tippe-flyten: hvor mange deltakere som har
// hver spiller i laget sitt. Kun aggregerte tall (ingen deltaker-data) —
// offentlig endepunkt. Cachet i 60 s; ved ~10 000 deltakere er dette 60 000
// picks-rader per oppfriskning, som er greit så lenge det er cachet, men bør
// flyttes til en DB-view/RPC med group by før det (se TODO.md).
//
// Gjeninnført 2026-09-28 (var fjernet 2026-09-25 som del av en opprydding).
export const revalidate = 60

const EMPTY = { total: 0, counts: {} as Record<string, number> }

export async function GET() {
  let supabase: ReturnType<typeof getSupabaseAdmin>
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json(EMPTY)
  }

  const [{ count, error: countError }, { data: picks, error: picksError }] = await Promise.all([
    supabase.from('participants').select('id', { count: 'exact', head: true }),
    supabase.from('picks').select('player_name'),
  ])
  if (countError || picksError) return NextResponse.json(EMPTY)

  const counts: Record<string, number> = {}
  for (const row of picks ?? []) {
    counts[row.player_name] = (counts[row.player_name] ?? 0) + 1
  }

  return NextResponse.json(
    { total: count ?? 0, counts },
    { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } },
  )
}
