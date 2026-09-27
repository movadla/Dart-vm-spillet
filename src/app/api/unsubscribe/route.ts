import { NextRequest } from 'next/server'
import { createHmac } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

function verifyToken(userId: string, token: string): boolean {
  const expected = createHmac('sha256', process.env.CRON_SECRET ?? '').update(userId).digest('hex')
  return token === expected
}

export async function GET(request: NextRequest) {
  // Klienten lages per kall — manglende Supabase-konfigurasjon skal gi et
  // forståelig svar fra handleren, ikke crash ved import av ruten.
  const supabase = getSupabaseAdmin()
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('id')
  const token = searchParams.get('token')

  if (!userId || !token || !verifyToken(userId, token)) {
    return new Response(page('Ugyldig lenke', '✕', 'Avmeldingslenken er ugyldig eller utløpt.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  await supabase.from('participants').update({ email_opt_out: true }).eq('id', userId)

  return new Response(page('Avmeldt', '✓', 'Du vil ikke lenger motta daglige oppdateringer fra World Grand Prix-Spillet.'), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function page(title: string, icon: string, message: string): string {
  return `<!DOCTYPE html><html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — World Grand Prix-Spillet</title><style>*{box-sizing:border-box}body{background:#0d1117;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px}.box{text-align:center;max-width:400px}.icon{font-size:48px;margin-bottom:20px;opacity:.9}.title{font-size:22px;font-weight:700;margin-bottom:10px}.msg{font-size:14px;color:rgba(255,255,255,.4);line-height:1.6}</style></head><body><div class="box"><div class="icon">${icon}</div><div class="title">${title}</div><div class="msg">${message}</div></div></body></html>`
}
