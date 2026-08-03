import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { POTS } from '@/data/pots'

const KICKOFF = new Date('2026-06-11T19:00:00Z')

// Bygg et oppslag: potNumber → Set<teamName> for rask validering
const VALID_TEAMS: Record<number, Set<string>> = {}
for (const pot of POTS) {
  VALID_TEAMS[pot.potNumber] = new Set(pot.teams.map((t) => t.name))
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

  // Valider picks: maks 8, gyldige potnummer og lagnavn
  const entries = Object.entries(picks as Record<string, string>)
  if (entries.length > 8) {
    return NextResponse.json({ error: 'For mange picks' }, { status: 400 })
  }
  for (const [potStr, team] of entries) {
    const potNum = parseInt(potStr)
    if (!Number.isInteger(potNum) || potNum < 1 || potNum > 8) {
      return NextResponse.json({ error: `Ugyldig pot: ${potStr}` }, { status: 400 })
    }
    if (!VALID_TEAMS[potNum]?.has(team)) {
      return NextResponse.json({ error: `Ugyldig lag for pot ${potNum}: ${team}` }, { status: 400 })
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

  const rows = entries.map(([pot, team]) => ({
    participant_id: participantId,
    pot_number: parseInt(pot),
    team_name: team,
  }))

  if (rows.length > 0) {
    const { error: insertError } = await supabase.from('picks').insert(rows)
    if (insertError) {
      return NextResponse.json({ error: 'Kunne ikke lagre picks' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
