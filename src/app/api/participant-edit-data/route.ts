import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getLocale } from '@/lib/i18n/getLocale'
import { getDictionary } from '@/i18n/dictionaries'

export async function GET(req: NextRequest) {
  const { participantEditData: dict } = getDictionary(await getLocale()).errors
  const participantId = req.cookies.get('vm_auth')?.value
  if (!participantId) return NextResponse.json({ error: dict.notAuthenticated }, { status: 401 })

  const supabase = getSupabaseAdmin()
  const [{ data: pData }, { data: pkData }] = await Promise.all([
    supabase.from('participants').select('name, email').eq('id', participantId).single(),
    supabase.from('picks').select('pot_number, player_name').eq('participant_id', participantId),
  ])

  if (!pData) return NextResponse.json({ error: dict.notFound }, { status: 404 })
  return NextResponse.json({ participant: pData, picks: pkData ?? [] })
}
