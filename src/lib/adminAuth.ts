import { NextRequest, NextResponse } from 'next/server'

export function checkAdminAuth(req: NextRequest): NextResponse | null {
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) return NextResponse.json({ error: 'Ingen tilgang' }, { status: 401 })

  const cookieSecret = req.cookies.get('admin_session')?.value
  const headerSecret = req.headers.get('x-admin-secret')

  if (cookieSecret !== adminSecret && headerSecret !== adminSecret) {
    return NextResponse.json({ error: 'Ingen tilgang' }, { status: 401 })
  }
  return null
}
