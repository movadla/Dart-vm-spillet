import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { checkAdminAuth } from '@/lib/adminAuth'
import { STAGE_ORDER } from '@/config/scoring'
import { validateMatchResultInput } from '@/lib/matchResultValidation'
import { upsertMatchResult } from '@/lib/upsertMatchResult'

export async function POST(req: NextRequest) {
  // Klienten lages per kall — manglende Supabase-konfigurasjon skal gi et
  // forståelig svar fra handleren, ikke crash ved import av ruten.
  const supabase = getSupabaseAdmin()
  const authError = checkAdminAuth(req)
  if (authError) return authError
  try {
    const body = await req.json()
    const validation = validateMatchResultInput(body, STAGE_ORDER)
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { error } = await upsertMatchResult(supabase, validation.value)
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
