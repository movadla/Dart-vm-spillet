import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  const { email } = await req.json()
  if (!email || !email.includes('@') || email.split('@')[1]?.length === 0) {
    return NextResponse.json({ error: 'Ugyldig e-post' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('participants')
    .select('id, name')
    .ilike('email', email.trim())
    .order('created_at', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) {
    return NextResponse.json({ error: 'Fant ingen deltaker med den e-posten' }, { status: 404 })
  }

  return NextResponse.json({ id: data[0].id, name: data[0].name })
}
