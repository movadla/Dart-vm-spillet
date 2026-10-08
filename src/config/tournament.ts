import type { Locale } from './i18n'

// Én kilde for turneringsdatoen. Første kamp = påmeldingsfrist = «turneringen
// starter». Tidligere lå denne datoen hardkodet i 14 filer — endre KUN her.
//
// MIDLERTIDIG (2026-10-08): Grand Slam of Darts 2026 (14.–22. november,
// Aldersley Leisure Village, Wolverhampton) som andre generalprøve før det
// ekte VM i desember — se WGP_PIVOT_REVERT.md for veien tilbake.
//
// FRISTEN ER BEVISST KONSERVATIV: 00:00 norsk tid lørdag 2026-11-14, dvs.
// starten på første turneringsdag. Klokkeslettet til første gruppekamp er
// IKKE verifisert mot en primærkilde (et søkeresultat nevnte 13:00, men det
// kunne ikke spores til PDC) — oppdater når PDC har publisert programmet,
// og IKKE gjett.
//
// VIKTIG — Z-suffikset under er UTC, IKKE norsk tid: klokkeslettet man
// faktisk vil ha må regnes om for hånd til UTC FØR man skriver det inn her.
// 2026-11-14 er vintertid (CET, UTC+1), så 00:00 norsk tid = 23:00Z dagen
// før. (Sommertid, CEST, UTC+2 var feilen som ga en 2 timer feil nedtelling
// under World Grand Prix, se LESSONS_LEARNED_WGP.md.) Sjekk alltid med:
//   node -e "console.log(new Date('<ISO>Z').toLocaleString('nb-NO', {timeZone:'Europe/Oslo', dateStyle:'full', timeStyle:'short'}))"
export const KICKOFF = new Date('2026-11-13T23:00:00Z')

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
