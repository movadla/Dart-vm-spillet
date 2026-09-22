import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

/** Konstant-tid strengsammenligning — unngår timing-angrep mot hemmeligheten. */
export function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export function checkAdminAuth(req: NextRequest): NextResponse | null {
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) return NextResponse.json({ error: 'Ingen tilgang' }, { status: 401 })

  const cookieSecret = req.cookies.get('admin_session')?.value
  const headerSecret = req.headers.get('x-admin-secret')

  const cookieOk = !!cookieSecret && secureCompare(cookieSecret, adminSecret)
  const headerOk = !!headerSecret && secureCompare(headerSecret, adminSecret)

  if (!cookieOk && !headerOk) {
    return NextResponse.json({ error: 'Ingen tilgang' }, { status: 401 })
  }
  return null
}
