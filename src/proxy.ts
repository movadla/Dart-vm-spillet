import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from '@/config/i18n'

// Konstant-tid sammenligning uten Node-crypto (proxyen kjører i edge-runtime,
// der `timingSafeEqual` fra src/lib/adminAuth.ts ikke er tilgjengelig).
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// Kun to språk å skille mellom — en full Accept-Language-forhandler
// (negotiator/@formatjs/intl-localematcher, som Next sin egen i18n-guide
// bruker) er overkill her. Ser kun på FØRSTE foretrukne språk-tag: alt som
// starter med "no"/"nb"/"nn" (bokmål/nynorsk/generisk norsk) gir norsk,
// alt annet (inkl. ingen header) gir engelsk siden det er det mest sannsynlige
// fellesspråket for en besøkende som ikke har norsk øverst i listen.
function detectLocale(acceptLanguage: string | null): Locale {
  const first = acceptLanguage?.split(',')[0]?.trim().toLowerCase()
  if (first?.startsWith('no') || first?.startsWith('nb') || first?.startsWith('nn')) return DEFAULT_LOCALE
  return 'en'
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Admin auth
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()
    const cookie = req.cookies.get('admin_session')?.value
    const secret = process.env.ADMIN_SECRET
    if (!secret || !cookie || !safeEqual(cookie, secret)) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return NextResponse.next()
  }

  const res = NextResponse.next()

  // Språk-auto-deteksjon ved første besøk — kun når brukeren ikke allerede
  // har gjort et eget valg (LocaleProvider setter samme cookie ved bytte).
  if (!req.cookies.get(LOCALE_COOKIE)) {
    res.cookies.set(LOCALE_COOKIE, detectLocale(req.headers.get('accept-language')), {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  }

  return res
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
  // Ett mønster dekker begge formål — funksjonen over grener selv på
  // pathname. Ekskluderer _next-interne filer, favicon, API-ruter (egen
  // auth-håndtering per rute, trenger ikke språk-cookien) og filer med
  // extension (bilder, manifest.json osv.) — samme standardmønster som
  // Next sin egen i18n-guide bruker, utvidet med "api".
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)'],
}
