import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { checkAdminAuth } from '@/lib/adminAuth'

export async function DELETE(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Mangler id' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  // Slett relaterte rader først for å unngå foreign key-brudd. Alle disse
  // FK-ene har nå "on delete cascade" (picks, magic_links, rank_snapshot,
  // league_members, leagues.created_by — se supabase/*.sql), så dette er i
  // praksis defensivt/dobbelt opp, ikke den eneste sikringen lenger. Beholdt
  // eksplisitt likevel — fungerer korrekt selv om en migrasjon skulle mangle.

  // 1. Magic links og picks
  await supabase.from('magic_links').delete().eq('participant_id', id)
  await supabase.from('picks').delete().eq('participant_id', id)

  // 1b. Rate-limit-logg (rate_limit_hits, bucket "tipp-update" er nøkkelet på
  // participant_id, ingen FK/cascade siden "key"-kolonnen er delt med
  // IP-baserte buckets som "finn") — rydd eksplisitt for fullstendig sletting.
  await supabase.from('rate_limit_hits').delete().eq('bucket', 'tipp-update').eq('key', id)

  // 2. Fjern deltaker fra ligaer de er med i
  await supabase.from('league_members').delete().eq('participant_id', id)

  // 3. Finn ligaer deltakeren har opprettet
  const { data: ownedLeagues } = await supabase
    .from('leagues').select('id').eq('created_by', id)
  if (ownedLeagues?.length) {
    const leagueIds = ownedLeagues.map((l) => l.id)
    // Slett alle medlemmer fra disse ligaene, deretter ligaene selv
    await supabase.from('league_members').delete().in('league_id', leagueIds)
    await supabase.from('leagues').delete().in('id', leagueIds)
  }

  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
