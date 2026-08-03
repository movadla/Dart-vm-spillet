import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const supabase = getSupabaseAdmin()
import { checkAdminAuth } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError
  try {
    const body = await req.json()
    const { participantId } = body

    if (!participantId || typeof participantId !== 'string') {
      return NextResponse.json({ error: 'Mangler participantId' }, { status: 400 })
    }

    const { error } = await supabase
      .from('participants')
      .update({ vipps_confirmed: true })
      .eq('id', participantId)

    if (error) {
      console.error('Confirm vipps error:', error)
      return NextResponse.json({ error: 'Kunne ikke bekrefte Vipps' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Confirm vipps route error:', e)
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
  }
}
