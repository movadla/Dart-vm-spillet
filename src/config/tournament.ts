import type { Locale } from './i18n'

// Én kilde for turneringsdatoen. Første kamp = påmeldingsfrist = «turneringen
// starter». Tidligere lå denne datoen hardkodet i 14 filer — endre KUN her.
//
// MIDLERTIDIG (2026-09-27): satt om til PDC World Grand Prix 2026 (28. sep–
// 4. okt, Mattioli Arena, Leicester) som en generalprøve/test av appen mot en
// ekte, nært forestående turnering — IKKE det faktiske dart-VM i desember.
// Bytt tilbake til 2026-12-11T19:00:00Z (og se git-historikk for resten av
// VM-oppsettet: pots.ts, bracketProjection.ts, scoring.ts STAGE_ORDER m.fl.)
// når det nærmer seg VM-trekningen i november.
//
export const KICKOFF = new Date('2026-09-28T19:00:00Z')

const INTL_LOCALE: Record<Locale, string> = { no: 'nb-NO', en: 'en-US' }

/** «11. desember» / «December 11» — til løpende tekst. Europe/Oslo uansett
 * hvilken tidssone serveren kjører i, siden VM-tidspunktet er norsk tid. */
export function formatKickoffDate(locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: 'numeric', month: 'long', timeZone: 'Europe/Oslo' }).format(KICKOFF)
}

/** «11. desember 2026 kl. 20:00» / «December 11, 2026 at 08:00 PM» — til frister. */
export function formatKickoffDateTime(locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Oslo', hour12: locale === 'en',
  }).format(KICKOFF)
}

/** Har VM startet (påmelding stengt, poeng telles)? Evalueres ved kall, ikke ved import. */
export function isVmStarted(now: Date = new Date()): boolean {
  return now >= KICKOFF
}
