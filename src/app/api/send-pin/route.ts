import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const supabase = getSupabaseAdmin()

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  return `${local[0]}****@${domain}`
}

const RATE_LIMIT = 3        // maks forsøk
const WINDOW_MS = 60 * 60 * 1000  // per time

export async function POST(req: NextRequest) {
  const { participantId } = await req.json()
  if (!participantId) return NextResponse.json({ error: 'Mangler participantId' }, { status: 400 })

  // Rate limiting: tell forsøk siste time fra pin_send_log
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString()
  const { count } = await supabase
    .from('pin_send_log')
    .select('*', { count: 'exact', head: true })
    .eq('participant_id', participantId)
    .gte('created_at', windowStart)

  if ((count ?? 0) >= RATE_LIMIT) {
    return NextResponse.json({ error: 'For mange forsøk. Vent en time og prøv igjen.' }, { status: 429 })
  }

  const { data: participant } = await supabase
    .from('participants')
    .select('name, email, pin')
    .eq('id', participantId)
    .single()

  if (!participant) return NextResponse.json({ error: 'Deltaker ikke funnet' }, { status: 404 })
  if (!participant.pin) return NextResponse.json({ error: 'Ingen PIN registrert' }, { status: 400 })

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'E-postutsending er ikke konfigurert ennå' }, { status: 503 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const domain = process.env.EMAIL_DOMAIN ?? 'resend.dev'

  const { error: sendError } = await resend.emails.send({
    from: `Dart-VM-spillet <oppdatering@${domain}>`,
    to: participant.email,
    subject: 'Din Dart-VM-spillet PIN-kode',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 20px;background:#fff">
        <h2 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#dc2626">Dart-VM 2026 · Draft</h2>
        <p style="color:#555;margin:0 0 24px;font-size:15px">Hei ${participant.name},</p>
        <p style="color:#555;margin:0 0 16px;font-size:15px">Her er PIN-koden din:</p>
        <div style="font-size:52px;font-weight:900;letter-spacing:14px;color:#111;background:#f5f5f5;border-radius:12px;padding:24px 20px;text-align:center;margin:0 0 24px">${participant.pin}</div>
        <p style="color:#888;font-size:13px;margin:0">Del ikke denne med andre. PIN-en brukes til å endre valgene dine.</p>
      </div>
    `,
  })

  if (sendError) {
    return NextResponse.json({ error: 'Kunne ikke sende e-post. Prøv igjen.' }, { status: 500 })
  }

  await supabase.from('pin_send_log').insert({ participant_id: participantId })

  return NextResponse.json({ maskedEmail: maskEmail(participant.email) })
}
