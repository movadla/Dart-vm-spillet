// Én kilde for turneringsdatoen. Første kamp i PDC World Darts Championship
// 2026/27 = påmeldingsfrist = «VM starter». Tidligere lå denne datoen
// hardkodet i 14 filer — endre KUN her.
export const KICKOFF = new Date('2026-12-11T19:00:00Z')

/** «11. desember» — til løpende tekst. */
export const KICKOFF_DATE_LABEL = '11. desember'
/** «11. desember kl. 20:00» (norsk tid) — til frister. */
export const KICKOFF_TIME_LABEL = '11. desember kl. 20:00'

/** Har VM startet (påmelding stengt, poeng telles)? Evalueres ved kall, ikke ved import. */
export function isVmStarted(now: Date = new Date()): boolean {
  return now >= KICKOFF
}
