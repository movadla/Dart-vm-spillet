import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/adminAuth'
import { POTS } from '@/data/pots'
import { buildWelcomeHtml } from '@/lib/email-welcome'
import { buildDailyEmail } from '@/lib/email-daily'
import { buildBroadcastHtml } from '@/lib/email-broadcast'

const DEMO_PICKS = POTS.map(pot => ({
  team: pot.players[0].name,
  flag: '',
  iso2: pot.players[0].iso2,
}))

export async function GET(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const type = req.nextUrl.searchParams.get('type') ?? 'welcome'
  const name = req.nextUrl.searchParams.get('name') ?? 'Ola Nordmann'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://vmspillet.com'

  let html: string

  if (type === 'daily') {
    html = buildDailyEmail({
      name,
      userId: 'demo',
      points: 47,
      pointsDelta: 8,
      vmDay: 5,
      unsubscribeToken: 'demo-token',
      baseUrl,
      overallRank: 7,
      overallTotal: 45,
      leagues: [
        { name: 'Ståle Solbakken Fan Club', code: '4B86F9', rank: 3, total: 24 },
        { name: 'Kontorligaen', code: 'WOLF42', rank: 1, total: 8 },
      ],
      recentResults: [
        { player1: 'Luke Littler', player2: 'Gary Anderson', sets1: 4, sets2: 1 },
        { player1: 'Michael van Gerwen', player2: 'Rob Cross', sets1: 4, sets2: 3 },
      ],
    })
  } else if (type === 'broadcast') {
    const subject = req.nextUrl.searchParams.get('subject') ?? '24 timer igjen til å endre valg!'
    const body = req.nextUrl.searchParams.get('body') ?? 'VM starter i morgen kveld, og fristen for å endre lagvalgene dine er klokken 21:00.\n\nHar du meldt deg inn i en liga? Del ligakoden din med venner og kollegaer før det er for sent.\n\nLykke til!'
    html = buildBroadcastHtml(name, subject, body, `${baseUrl}/deltaker/demo`)
  } else {
    const ctaUrl = `${baseUrl}/deltaker/demo`
    html = buildWelcomeHtml(name, ctaUrl, DEMO_PICKS)
  }

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
