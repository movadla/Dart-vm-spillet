import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const supabase = getSupabaseAdmin()
import { checkAdminAuth } from '@/lib/adminAuth'

const VALID_STAGES = ['group', 'r32', 'r16', 'qf', 'sf', 'bronze', 'silver', 'gold']

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError
  const { team, stage } = await req.json()

  if (!team || !stage || !VALID_STAGES.includes(stage)) {
    return NextResponse.json({ error: 'Ugyldig data' }, { status: 400 })
  }

  const { error } = await supabase
    .from('advancement')
    .upsert({ team_name: team.trim(), stage_reached: stage }, { onConflict: 'team_name' })

  if (error) {
    return NextResponse.json({ error: 'Kunne ikke lagre avansement' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError
  const { team } = await req.json()

  if (!team) {
    return NextResponse.json({ error: 'Mangler lagnavn' }, { status: 400 })
  }

  const { error } = await supabase
    .from('advancement')
    .delete()
    .eq('team_name', team.trim())

  if (error) {
    return NextResponse.json({ error: 'Kunne ikke slette avansement' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
