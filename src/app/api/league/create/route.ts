import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { KICKOFF } from '@/config/tournament'

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST(req: NextRequest) {
  // Klienten lages per kall — manglende Supabase-konfigurasjon skal gi et
  // forståelig svar fra handleren, ikke crash ved import av ruten.
  const supabase = getSupabaseAdmin()
  if (new Date() >= KICKOFF) {
    return NextResponse.json({ error: 'Ligaer er låst etter at VM har startet.' }, { status: 403 })
  }

  // Identitet KUN fra verifisert vm_auth-cookie — tidligere godtok endepunktet
  // participantId rett fra request body (`bodyId ?? cookieId`, body vant alltid),
  // så hvem som helst kunne opprette en liga "som" en hvilken som helst kjent
  // deltaker-id med ett rått API-kall. Se tipp/update/route.ts for samme fiks.
  const { name } = await req.json()
  const participantId = (await cookies()).get('vm_auth')?.value

  if (!participantId) return NextResponse.json({ error: 'Ikke innlogget — be om en ny innloggingslenke' }, { status: 401 })
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Mangler data' }, { status: 400 })
  }

  const { data: participant } = await supabase
    .from('participants').select('id').eq('id', participantId).maybeSingle()
  if (!participant) return NextResponse.json({ error: 'Fant ikke deltaker' }, { status: 404 })

  // Generate unique invite code
  let inviteCode = generateCode()
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await supabase
      .from('leagues').select('id').eq('invite_code', inviteCode).maybeSingle()
    if (!existing) break
    inviteCode = generateCode()
  }

  const { data: league, error } = await supabase
    .from('leagues')
    .insert({ name: name.trim(), invite_code: inviteCode, created_by: participantId })
    .select('id, invite_code')
    .single()

  if (error || !league) return NextResponse.json({ error: 'Kunne ikke opprette liga' }, { status: 500 })

  await supabase.from('league_members').insert({ league_id: league.id, participant_id: participantId })

  return NextResponse.json({ inviteCode: league.invite_code, leagueId: league.id })
}
