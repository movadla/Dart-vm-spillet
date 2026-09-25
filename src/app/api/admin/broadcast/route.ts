import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { checkAdminAuth } from '@/lib/adminAuth'
import { Resend } from 'resend'
import { buildBroadcastHtml, buildBroadcastText } from '@/lib/email-broadcast'
import { logAdminAction } from '@/lib/adminAudit'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const { subject, body, leagueIds, participantIds } = await req.json()
  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'Mangler emne eller innhold' }, { status: 400 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY ikke konfigurert' }, { status: 500 })
  }

  const supabase = getSupabaseAdmin()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3001'

  let participants: { id: string; email: string; name: string }[]

  if (Array.isArray(participantIds) && participantIds.length > 0) {
    const { data, error } = await supabase
      .from('participants')
      .select('id, email, name')
      .in('id', participantIds)

    if (error || !data?.length) {
      return NextResponse.json({ error: 'Ingen deltakere funnet' }, { status: 404 })
    }
    participants = data
  } else if (Array.isArray(leagueIds) && leagueIds.length > 0) {
    const { data: members, error: memberError } = await supabase
      .from('league_members')
      .select('participant_id')
      .in('league_id', leagueIds)

    if (memberError) {
      return NextResponse.json({ error: 'Feil ved henting av ligamedlemmer' }, { status: 500 })
    }

    const uniqueIds = [...new Set((members ?? []).map((m: { participant_id: string }) => m.participant_id))]

    if (uniqueIds.length === 0) {
      return NextResponse.json({ error: 'Ingen deltakere i valgte ligaer' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('participants')
      .select('id, email, name')
      .in('id', uniqueIds)
      .eq('email_opt_out', false)

    if (error || !data?.length) {
      return NextResponse.json({ error: 'Ingen deltakere funnet' }, { status: 404 })
    }
    participants = data
  } else {
    const { data, error } = await supabase
      .from('participants')
      .select('id, email, name')
      .eq('email_opt_out', false)

    if (error || !data?.length) {
      return NextResponse.json({ error: 'Ingen deltakere funnet' }, { status: 404 })
    }
    participants = data
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const domain = process.env.EMAIL_DOMAIN ?? 'resend.dev'

  const errors: string[] = []
  for (const p of participants) if (!p.email) errors.push(`${p.name}: mangler e-post`)

  const payloads = participants
    .filter(p => p.email)
    .map(p => ({
      from: `Dart-VM-spillet <oppdatering@${domain}>`,
      to: p.email,
      subject,
      headers: {
        'List-Unsubscribe': `<mailto:oppdatering@${domain}?subject=unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      html: buildBroadcastHtml(p.name, subject, body, `${baseUrl}/deltaker/${p.id}`),
      text: buildBroadcastText(p.name, subject, body, `${baseUrl}/deltaker/${p.id}`),
    }))

  // Send i batcher på 100 (Resend batch-API) — unngår rate-limit (2/sek) og funksjon-timeout.
  let sent = 0
  for (let i = 0; i < payloads.length; i += 100) {
    const chunk = payloads.slice(i, i + 100)
    try {
      const { error } = await resend.batch.send(chunk)
      if (error) errors.push(error.message ?? String(error))
      else sent += chunk.length
    } catch (e) {
      errors.push(String(e))
    }
  }

  if (sent === 0 && errors.length) {
    return NextResponse.json({ error: `Sending feilet: ${errors.join('; ')}` }, { status: 502 })
  }

  await logAdminAction('broadcast.send', { subject, sent, recipients: participants.length })
  return NextResponse.json({ sent, errors: errors.length ? errors : undefined })
}
