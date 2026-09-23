import type { SupabaseClient } from '@supabase/supabase-js'
import type { ValidMatchInput } from './matchResultValidation'

/**
 * Lagrer ett kampresultat — oppdaterer eksisterende rad (uansett hvilken rekkefølge
 * spiller 1/2 ble lagret i første gang) eller setter inn en ny. Delt mellom
 * enkelt-registrering og bulk-import slik at oppførselen er identisk.
 */
export async function upsertMatchResult(
  // any, any, any: schema-agnostisk — getSupabaseAdmin() er nå typet mot "dart_vm", ikke default "public"
  supabase: SupabaseClient<any, any, any>,
  match: ValidMatchInput,
): Promise<{ error: string | null }> {
  const { player1, player2, sets1, sets2, stage, winner } = match

  const { data: existing } = await supabase
    .from('match_results')
    .select('id, player1, player2')
    .or(`and(player1.eq.${player1},player2.eq.${player2}),and(player1.eq.${player2},player2.eq.${player1})`)
    .maybeSingle()

  let rowSets1 = sets1
  let rowSets2 = sets2
  if (existing && existing.player1 !== player1) {
    rowSets1 = sets2
    rowSets2 = sets1
  }

  const { error } = existing
    ? await supabase.from('match_results').update({ sets1: rowSets1, sets2: rowSets2, stage, winner }).eq('id', existing.id)
    : await supabase.from('match_results').insert({ player1, player2, sets1, sets2, stage, winner })

  return { error: error?.message ?? null }
}
