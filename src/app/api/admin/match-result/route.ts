import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { checkAdminAuth } from '@/lib/adminAuth'
import { STAGE_ORDER } from '@/config/scoring'

const supabase = getSupabaseAdmin()

const VALID_STAGES: readonly string[] = STAGE_ORDER

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError
  try {
    const body = await req.json()
    const { player1, player2, sets1, sets2, stage } = body

    if (!player1 || !player2 || sets1 === undefined || sets2 === undefined) {
      return NextResponse.json({ error: 'Mangler data' }, { status: 400 })
    }

    if (typeof sets1 !== 'number' || typeof sets2 !== 'number') {
      return NextResponse.json({ error: 'Sett må være tall' }, { status: 400 })
    }

    const matchStage = VALID_STAGES.includes(stage) ? stage : 'r1'
    const winner = sets1 > sets2 ? player1 : sets2 > sets1 ? player2 : null

    // Upsert: oppdater hvis kampen allerede finnes
    const { data: existing } = await supabase
      .from('match_results')
      .select('id')
      .eq('player1', player1)
      .eq('player2', player2)
      .single()

    const { error } = existing
      ? await supabase.from('match_results').update({ sets1, sets2, stage: matchStage, winner }).eq('id', existing.id)
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
