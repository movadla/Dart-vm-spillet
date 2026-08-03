import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const supabase = getSupabaseAdmin()

const KICKOFF = new Date('2026-06-11T19:00:00Z')

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST(req: NextRequest) {
  if (new Date() >= KICKOFF) {
    return NextResponse.json({ error: 'Ligaer er låst etter at VM har startet.' }, { status: 403 })
  }

  const { name, participantId: bodyId } = await req.json()
  const cookieId = (await cookies()).get('participant_id')?.value
  const participantId = bodyId ?? cookieId

  if (!participantId) return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
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
