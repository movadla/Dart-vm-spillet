import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { isRateLimited, recordRateLimitHit } from '@/lib/rateLimit'
import { POTS } from '@/data/pots'

const KICKOFF = new Date('2026-12-11T19:00:00Z')
// Rate-limitet per deltaker (ikke IP) siden identiteten uansett er verifisert
// på dette tidspunktet — romslig nok for legitim omvalg-fikling, stanser
// scriptet misbruk av en kompromittert/lekket vm_auth-cookie.
const UPDATE_LIMIT = 30
const UPDATE_WINDOW_MS = 60 * 60 * 1000

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

  // Identitet kommer KUN fra den verifiserte vm_auth-cookien (satt av
  // /api/magic-link/verify), aldri fra request body. Før denne fiksen tok
  // endepunktet imot participantId direkte i body — hvem som helst som
  // kjente (eller fant via /api/finn) en annens deltaker-id kunne dermed
  // overskrive picks for den deltakeren med et rått API-kall, helt uavhengig
  // av at selve UI-flyten (tipp/page.tsx) riktig krevde en magic link først.
  // Se participant-edit-data/route.ts for samme, allerede riktige mønster.
  const participantId = req.cookies.get('vm_auth')?.value
  if (!participantId) {
    return NextResponse.json({ error: 'Ikke innlogget — be om en ny innloggingslenke' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  if (await isRateLimited(supabase, 'tipp-update', participantId, UPDATE_LIMIT, UPDATE_WINDOW_MS)) {
    return NextResponse.json({ error: 'For mange lagringer. Vent litt og prøv igjen.' }, { status: 429 })
  }
  await recordRateLimitHit(supabase, 'tipp-update', participantId)

  const { picks } = await req.json()

  if (!picks || typeof picks !== 'object' || Array.isArray(picks)) {
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

  const rows = entries.map(([pot, player]) => ({
    participant_id: participantId,
    pot_number: parseInt(pot),
    player_name: player,
  }))
  const keptPots = rows.map((r) => r.pot_number)

  // Upsert i stedet for slett-så-sett-inn: det gamle mønsteret hadde et
  // reelt vindu der ALLE picks for deltakeren var slettet før de nye var satt
  // inn — to samtidige lagringer (dobbeltklikk, ustabilt nett) kunne dermed gi
  // tapte picks. Krever den unike (participant_id, pot_number)-constrainten i
  // supabase/add_picks_constraints.sql. Sletter kun de potter som IKKE er med
  // i denne innsendingen (normalt ingen, siden UI alltid sender alle 6).
  if (rows.length > 0) {
    const { error: upsertError } = await supabase
      .from('picks')
      .upsert(rows, { onConflict: 'participant_id,pot_number' })
    if (upsertError) {
      return NextResponse.json({ error: 'Kunne ikke lagre picks' }, { status: 500 })
    }
  }

  let deleteQuery = supabase.from('picks').delete().eq('participant_id', participantId)
  deleteQuery = keptPots.length > 0 ? deleteQuery.not('pot_number', 'in', `(${keptPots.join(',')})`) : deleteQuery
  const { error: deleteError } = await deleteQuery
  if (deleteError) {
    return NextResponse.json({ error: 'Kunne ikke rydde opp gamle picks' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
