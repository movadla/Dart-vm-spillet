import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { checkAdminAuth } from '@/lib/adminAuth'
import { logAdminAction } from '@/lib/adminAudit'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const { id } = await params
  const supabase = getSupabaseAdmin()

  await supabase.from('league_members').delete().eq('league_id', id)
  const { error } = await supabase.from('leagues').delete().eq('id', id)

  if (error) return NextResponse.json({ error: 'Feil ved sletting' }, { status: 500 })
  await logAdminAction('league.delete', { id })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const { id } = await params
  const { hidden_until_kickoff } = await req.json()

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('leagues')
    .update({ hidden_until_kickoff })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Feil ved oppdatering' }, { status: 500 })
  await logAdminAction('league.update', { id, hidden_until_kickoff })
  return NextResponse.json({ ok: true })
}
