import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email || typeof email !== 'string') return NextResponse.json({ error: 'Mangler e-post' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  await supabase.from('newsletter_signups').upsert({ email: email.trim().toLowerCase() })

  return NextResponse.json({ ok: true })
}
