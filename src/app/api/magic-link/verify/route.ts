import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getLocale } from '@/lib/i18n/getLocale'
import { getDictionary } from '@/i18n/dictionaries'

export async function POST(req: NextRequest) {
  const { magicLinkVerify: dict } = getDictionary(await getLocale()).errors
  const { token, participantId } = await req.json()
  if (!token || !participantId) return NextResponse.json({ error: dict.missingData }, { status: 400 })

  const supabase = getSupabaseAdmin()

  const { data: link } = await supabase
    .from('magic_links')
    .select('participant_id, expires_at, used_at')
    .eq('token', token)
    .single()

  if (!link) return NextResponse.json({ error: dict.invalidLink }, { status: 401 })
  if (link.used_at) return NextResponse.json({ error: dict.alreadyUsed }, { status: 401 })
  if (new Date(link.expires_at) < new Date()) return NextResponse.json({ error: dict.expired }, { status: 401 })
  if (link.participant_id !== participantId) return NextResponse.json({ error: dict.invalidLink }, { status: 401 })

  await supabase.from('magic_links').update({ used_at: new Date().toISOString() }).eq('token', token)

  const response = NextResponse.json({ ok: true })
  response.cookies.set('vm_auth', participantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 2,
    path: '/',
  })
  return response
}
