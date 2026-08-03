import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { checkAdminAuth } from '@/lib/adminAuth'
import { POTS } from '@/data/pots'

const NAMES = [
  'Ole Hansen', 'Kari Olsen', 'Erik Johansen', 'Ingrid Andersen',
  'Lars Nilsen', 'Astrid Petersen', 'Per Christensen', 'Hilde Larsen',
  'Nils Berg', 'Silje Haugen', 'Tor Eriksen', 'Marit Holm',
  'Jens Dahl', 'Bente Solberg', 'Rune Moen', 'Lise Strand',
  'Hans Lund', 'Eva Bakke', 'Arne Lie', 'Tone Viken',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const supabase = getSupabaseAdmin()

  try {
    // Clear in FK-safe order
    await supabase.from('picks').delete().neq('participant_id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('league_members').delete().neq('league_id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('leagues').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('advancement').delete().neq('team_name', '')
    await supabase.from('match_results').delete().neq('home_team', '')
    await supabase.from('participants').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Create 20 participants
    const participantRows = NAMES.map((name, i) => ({
      name,
      email: `sim${i + 1}@vm-sim.local`,
      vipps_confirmed: true,
      pin: '1234',
    }))

    const { data: participants, error: pErr } = await supabase
      .from('participants')
      .insert(participantRows)
      .select('id')

    if (pErr || !participants?.length) {
      console.error('Participant insert error:', pErr)
      return NextResponse.json({ error: 'Kunne ikke opprette deltakere' }, { status: 500 })
    }

    // Create picks: one random team per pot per participant
    const pickRows = participants.flatMap((p) =>
      POTS.map((pot) => ({
        participant_id: p.id,
        pot_number: pot.potNumber,
        team_name: pick(pot.teams).name,
      }))
    )

    const { error: picksErr } = await supabase.from('picks').insert(pickRows)
    if (picksErr) {
      console.error('Picks insert error:', picksErr)
      return NextResponse.json({ error: 'Kunne ikke opprette picks' }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: participants.length })
  } catch (e) {
    console.error('reset-sim error:', e)
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
  }
}
