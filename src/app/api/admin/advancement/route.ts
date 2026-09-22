import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const supabase = getSupabaseAdmin()
import { checkAdminAuth } from '@/lib/adminAuth'
import { STAGE_ORDER } from '@/config/scoring'

const VALID_STAGES = STAGE_ORDER

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError
  const { player_name, stage } = await req.json()

  if (!player_name || !stage || !VALID_STAGES.includes(stage)) {
    return NextResponse.json({ error: 'Ugyldig data' }, { status: 400 })
  }

  const { error } = await supabase
    .from('advancement')
    .upsert({ player_name: player_name.trim(), stage_reached: stage }, { onConflict: 'player_name' })

  if (error) {
    return NextResponse.json({ error: 'Kunne ikke lagre avansement' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError
  const { player_name } = await req.json()

  if (!player_name) {
    return NextResponse.json({ error: 'Mangler spillernavn' }, { status: 400 })
  }

  const { error } = await supabase
    .from('advancement')
    .delete()
    .eq('player_name', player_name.trim())

  if (error) {
    return NextResponse.json({ error: 'Kunne ikke slette avansement' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
