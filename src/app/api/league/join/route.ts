import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const supabase = getSupabaseAdmin()

const KICKOFF = new Date('2026-12-11T19:00:00Z')

export async function POST(req: NextRequest) {
  if (new Date() >= KICKOFF) {
    return NextResponse.json({ error: 'Ligaer er låst etter at VM har startet.' }, { status: 403 })
  }

  // Identitet KUN fra verifisert vm_auth-cookie — se league/create/route.ts og
  // tipp/update/route.ts for samme fiks og begrunnelse.
  const { inviteCode } = await req.json()
  const participantId = (await cookies()).get('vm_auth')?.value

  if (!participantId) return NextResponse.json({ error: 'Ikke innlogget — be om en ny innloggingslenke' }, { status: 401 })
  if (!inviteCode?.trim()) {
    return NextResponse.json({ error: 'Mangler data' }, { status: 400 })
  }

  const { data: participant } = await supabase
    .from('participants').select('id').eq('id', participantId).single()
  if (!participant) return NextResponse.json({ error: 'Fant ikke deltaker' }, { status: 404 })

  const { data: league } = await supabase
    .from('leagues').select('id, name').eq('invite_code', inviteCode.trim().toUpperCase()).maybeSingle()
  if (!league) return NextResponse.json({ error: 'Ugyldig ligakode' }, { status: 404 })

  // Idempotent insert — ignore if already member
  await supabase
    .from('league_members')
    .upsert({ league_id: league.id, participant_id: participantId }, { onConflict: 'league_id,participant_id' })

  return NextResponse.json({ inviteCode: inviteCode.trim().toUpperCase(), leagueName: league.name })
}
