import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { checkAdminAuth } from '@/lib/adminAuth'
import { STAGE_ORDER } from '@/config/scoring'
import { validateMatchResultInput } from '@/lib/matchResultValidation'

const supabase = getSupabaseAdmin()

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError
  try {
    const body = await req.json()
    const validation = validateMatchResultInput(body, STAGE_ORDER)
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const { player1, player2, sets1, sets2, stage: matchStage, winner } = validation.value

    // Upsert: oppdater hvis kampen allerede finnes — uavhengig av hvilken rekkefølge
    // spiller 1/2 ble lagret i første gang.
    const { data: existing } = await supabase
      .from('match_results')
      .select('id, player1, player2')
      .or(`and(player1.eq.${player1},player2.eq.${player2}),and(player1.eq.${player2},player2.eq.${player1})`)
      .maybeSingle()

    let rowSets1 = sets1
    let rowSets2 = sets2
    if (existing && existing.player1 !== player1) {
      // Lagret rad har spillerne i motsatt rekkefølge av det som ble sendt inn nå.
      rowSets1 = sets2
      rowSets2 = sets1
    }

    const { error } = existing
      ? await supabase.from('match_results').update({ sets1: rowSets1, sets2: rowSets2, stage: matchStage, winner }).eq('id', existing.id)
      : await supabase.from('match_results').insert({ player1, player2, sets1, sets2, stage: matchStage, winner })

    if (error) {
      console.error('Match result insert error:', error)
      return NextResponse.json({ error: 'Kunne ikke lagre resultat' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Match result route error:', e)
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
  }
}
