import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  const participantId = req.cookies.get('vm_auth')?.value
  if (!participantId) return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  const [{ data: pData }, { data: pkData }] = await Promise.all([
    supabase.from('participants').select('name, email').eq('id', participantId).single(),
    supabase.from('picks').select('pot_number, player_name').eq('participant_id', participantId),
  ])

  if (!pData) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
  return NextResponse.json({ participant: pData, picks: pkData ?? [] })
}
