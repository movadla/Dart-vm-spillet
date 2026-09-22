import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { POTS } from '@/data/pots'

const KICKOFF = new Date('2026-12-11T19:00:00Z')

// Bygg et oppslag: potNumber → Set<playerName> for rask validering
const VALID_PLAYERS: Record<number, Set<string>> = {}
for (const pot of POTS) {
  VALID_PLAYERS[pot.potNumber] = new Set(pot.players.map((p) => p.name))
}

export async function POST(req: NextRequest) {
  // VM i gang — picks er låst
  if (new Date() >= KICKOFF) {
    return NextResponse.json({ error: 'VM er i gang — picks er låst' }, { status: 403 })
  }

  const supabase = getSupabaseAdmin()
  const { participantId, picks } = await req.json()

  if (!participantId || !picks || typeof picks !== 'object' || Array.isArray(picks)) {
    return NextResponse.json({ error: 'Mangler data' }, { status: 400 })
  }

  // Valider picks: maks POTS.length, gyldige potnummer og spillernavn
  const entries = Object.entries(picks as Record<string, string>)
  if (entries.length > POTS.length) {
    return NextResponse.json({ error: 'For mange picks' }, { status: 400 })
  }
  for (const [potStr, player] of entries) {
    const potNum = parseInt(potStr)
    if (!Number.isInteger(potNum) || potNum < 1 || potNum > POTS.length) {
      return NextResponse.json({ error: `Ugyldig pot: ${potStr}` }, { status: 400 })
    }
    if (!VALID_PLAYERS[potNum]?.has(player)) {
      return NextResponse.json({ error: `Ugyldig spiller for pot ${potNum}: ${player}` }, { status: 400 })
    }
  }

  // Verifiser at deltaker finnes
  const { data: participant } = await supabase
    .from('participants')
    .select('id')
    .eq('id', participantId)
    .maybeSingle()

  if (!participant) {
    return NextResponse.json({ error: 'Fant ikke deltaker' }, { status: 404 })
  }

  // Slett gamle picks og sett inn nye
  const { error: deleteError } = await supabase
    .from('picks')
    .delete()
    .eq('participant_id', participantId)

  if (deleteError) {
    return NextResponse.json({ error: 'Kunne ikke slette gamle picks' }, { status: 500 })
  }

  const rows = entries.map(([pot, player]) => ({
    participant_id: participantId,
    pot_number: parseInt(pot),
    player_name: player,
  }))

  if (rows.length > 0) {
    const { error: insertError } = await supabase.from('picks').insert(rows)
    if (insertError) {
      return NextResponse.json({ error: 'Kunne ikke lagre picks' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
