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

  return NextResponse.next()
}

// Fjernet 2026-09-23: en "claim-once" participant_id-cookie som ble satt til
// hvem som helst som FØRST åpnet /deltaker/<id> — uten noen verifisering av at
// besøkende faktisk eide den id-en. Denne cookien ble deretter brukt (i
// league/create og league/join) til å opprette/bli med i liga "som" den
// deltakeren. Siden /deltaker/<id>-lenker er ment å deles (resultatsiden din),
// kunne den FØRSTE som åpnet en delt lenke på en annen enhet kapre identiteten
// i 30 dager. All skriving går nå i stedet via den verifiserte vm_auth-cookien
// (satt kun ved påmelding eller bekreftet magic link) — se
// api/tipp/update, api/league/create, api/league/join.
export const config = {
  matcher: ['/admin/:path*'],
}
