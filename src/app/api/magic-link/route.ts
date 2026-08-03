import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { randomBytes } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  return `${local[0]}****@${domain}`
}

export async function POST(req: NextRequest) {
  const { participantId, email } = await req.json()
  if (!participantId) return NextResponse.json({ error: 'Mangler participantId' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  const { data: participant } = await supabase
    .from('participants')
    .select('name, email')
    .eq('id', participantId)
    .maybeSingle()

  if (!participant) return NextResponse.json({ error: 'Deltaker ikke funnet' }, { status: 404 })

  if (email && email.trim().toLowerCase() !== participant.email.toLowerCase()) {
    return NextResponse.json({ error: 'E-postadressen stemmer ikke' }, { status: 403 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'E-postutsending er ikke konfigurert' }, { status: 503 })
  }

  // Maks 3 lenker per time
  const windowStart = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('magic_links')
    .select('*', { count: 'exact', head: true })
    .eq('participant_id', participantId)
    .gte('expires_at', windowStart)

  if ((count ?? 0) >= 3) {
    return NextResponse.json({ error: 'For mange forsøk. Vent en time og prøv igjen.' }, { status: 429 })
  }

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

  await supabase.from('magic_links').insert({ token, participant_id: participantId, expires_at: expiresAt })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://vmspillet.com'
  const link = `${baseUrl}/tipp?edit=${participantId}&token=${token}`

  const resend = new Resend(process.env.RESEND_API_KEY)
  const domain = process.env.EMAIL_DOMAIN ?? 'resend.dev'

  const { error: sendError } = await resend.emails.send({
    from: `VM-Spillet 2026 <oppdatering@${domain}>`,
    to: participant.email,
    subject: 'Endre VM-Spillet-valgene dine',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 20px;background:#fff">
        <h2 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#dc2626">VM-Spillet 2026</h2>
        <p style="color:#555;margin:0 0 24px;font-size:15px">Hei ${participant.name},</p>
        <p style="color:#555;margin:0 0 28px;font-size:15px">Klikk knappen under for å endre VM-valgene dine. Lenken er gyldig i 1 time.</p>
        <a href="${link}" style="display:inline-block;padding:16px 32px;background:#dc2626;color:#fff;font-weight:900;font-size:16px;text-decoration:none;border-radius:12px;letter-spacing:0.04em">
          Endre mine valg →
        </a>
        <p style="color:#aaa;font-size:12px;margin:28px 0 0;line-height:1.5">
          Del ikke denne lenken med andre. Den utløper om 1 time.<br>
          Hvis du ikke ba om dette, kan du ignorere e-posten.
        </p>
      </div>
    `,
  })

  if (sendError) return NextResponse.json({ error: 'Kunne ikke sende e-post. Prøv igjen.' }, { status: 500 })

  return NextResponse.json({ maskedEmail: maskEmail(participant.email) })
}
