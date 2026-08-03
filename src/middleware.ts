import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Admin auth
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()
    const cookie = req.cookies.get('admin_session')?.value
    if (!process.env.ADMIN_SECRET || cookie !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return NextResponse.next()
  }

  // Deltaker identity — claim-once: sett cookie kun hvis den ikke finnes fra før
  if (pathname.startsWith('/deltaker/')) {
    const existing = req.cookies.get('participant_id')?.value
    if (!existing) {
      const id = pathname.split('/')[2]
      if (id) {
        const res = NextResponse.next()
        res.cookies.set('participant_id', id, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        })
        return res
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/deltaker/:path*'],
}
