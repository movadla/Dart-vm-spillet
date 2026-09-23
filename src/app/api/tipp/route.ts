import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { POTS } from '@/data/pots'
import { Resend } from 'resend'
import { buildWelcomeHtml, buildWelcomeText, iso2For } from '@/lib/email-welcome'

const VALID_PICKS: Record<number, Set<string>> = Object.fromEntries(
  POTS.map(p => [p.potNumber, new Set(p.players.map(pl => pl.name))])
)

const KICKOFF = new Date('2026-12-11T19:00:00Z')

export async function POST(req: NextRequest) {
  if (new Date() > KICKOFF) {
    return NextResponse.json({ error: 'Påmelding er stengt' }, { status: 403 })
  }

  const supabase = getSupabaseAdmin()

  try {
    const body = await req.json()
    const { name, email, picks, phone } = body

    // Validate
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Ugyldig navn' }, { status: 400 })
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Ugyldig e-post' }, { status: 400 })
    }
    if (!picks || typeof picks !== 'object') {
      return NextResponse.json({ error: 'Mangler picks' }, { status: 400 })
    }

    const pickEntries = Object.entries(picks as Record<string, string>)
    if (pickEntries.length !== POTS.length) {
      return NextResponse.json({ error: `Du må velge én spiller fra alle ${POTS.length} potter` }, { status: 400 })
    }
    for (let pot = 1; pot <= POTS.length; pot++) {
      if (!picks[pot] || typeof picks[pot] !== 'string') {
        return NextResponse.json({ error: `Mangler valg fra pot ${pot}` }, { status: 400 })
      }
      if (!VALID_PICKS[pot]?.has(picks[pot])) {
        return NextResponse.json({ error: `Ugyldig spiller i pot ${pot}` }, { status: 400 })
      }
    }

    // Participant cap — sikkerhetsventil, se .env.example for begrunnelse
    // (default 10000 om variabelen mangler, ikke en ambisjonsgrense).
    const maxParticipants = parseInt(process.env.MAX_PARTICIPANTS ?? '10000')
    const { count } = await supabase.from('participants').select('*', { count: 'exact', head: true })
    if ((count ?? 0) >= maxParticipants) {
      return NextResponse.json({ error: 'Påmeldingen er dessverre full' }, { status: 503 })
    }

    // Insert participant
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .insert({ name: name.trim(), email: email.trim().toLowerCase(), ...(phone && typeof phone === 'string' ? { phone: phone.trim() } : {}) })
      .select('id')
      .single()

    if (participantError || !participant) {
      console.error('Participant insert error:', participantError)
      if (participantError?.code === '23505') {
        return NextResponse.json({ error: 'E-postadressen er allerede registrert', duplicate: true }, { status: 409 })
      }
      return NextResponse.json({ error: 'Kunne ikke lagre deltaker' }, { status: 500 })
    }

    // Insert picks
    const pickRows = Object.entries(picks as Record<string, string>).map(
      ([potNumber, playerName]) => ({
        participant_id: participant.id,
        pot_number: parseInt(potNumber, 10),
        player_name: playerName,
      })
    )

    const { error: picksError } = await supabase.from('picks').insert(pickRows)

    if (picksError) {
      console.error('Picks insert error:', picksError)
      // Clean up participant if picks failed
      await supabase.from('participants').delete().eq('id', participant.id)
      return NextResponse.json({ error: 'Kunne ikke lagre picks' }, { status: 500 })
    }

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3001'
    sendWelcomeEmail({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      userId: participant.id,
      picks: picks as Record<string, string>,
      baseUrl: BASE_URL,
    }).catch(e => console.error('Welcome email failed:', e))

    const response = NextResponse.json({ success: true, participantId: participant.id })
    // Samme vm_auth-cookie som magic-link/verify setter — brukeren skrev nettopp
    // inn denne e-posten selv i DENNE sesjonen, så det er rimelig å regne dem som
    // innlogget med det samme (uten en ekstra e-post-runde) for å kunne opprette/
    // bli med i liga rett etter påmelding. Kortere levetid enn magic-link (2t) er
    // ikke nødvendig — samme varighet, samme sikkerhetsmodell.
    response.cookies.set('vm_auth', participant.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2,
      path: '/',
    })
    return response
  } catch (e) {
    console.error('Tipp route error:', e)
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
  }
}

// ─────────────────────────────────────────────────────────────────────────────

async function sendWelcomeEmail(p: {
  name: string
  email: string
  userId: string
  picks: Record<string, string>
  baseUrl: string
}) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const ctaUrl = `${p.baseUrl}/deltaker/${p.userId}`

  const sortedPicks = Object.entries(p.picks)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, team]) => ({ team, iso2: iso2For(team) }))

  await resend.emails.send({
    from: `Dart-VM-spillet <oppdatering@${process.env.EMAIL_DOMAIN ?? 'resend.dev'}>`,
    to: p.email,
    subject: 'Du er påmeldt — Dart-VM-spillet',
    html: buildWelcomeHtml(p.name, ctaUrl, sortedPicks),
    text: buildWelcomeText(p.name, ctaUrl, sortedPicks),
  })
}

