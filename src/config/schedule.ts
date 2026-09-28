import type { Stage } from './scoring'
import type { Locale } from './i18n'

// Kampplan per runde. PDC har IKKE publisert den offisielle kampplanen ennå
// (ventes medio november sammen med selve trekningen — se README →
// «Trekning»), så alt står som «ikke satt» inntil videre. Fyll inn ekte
// datoer/klokkeslett her etter hvert som PDC kunngjør dem — se TODO.md.
//
// Tre tilstander en runde kan være i, akkurat slik PDC selv kunngjør det:
//  1. Ingenting bestemt ennå         → date: null           (dato: «ikke satt»)
//  2. Dagen er satt, men ikke rekkefølgen på kampene den dagen (avgjør
//     klokkeslettet — PDC bestemmer typisk hvilke kamper som spilles først/
//     sist nærmere selve dagen)   → date: 'YYYY-MM-DD', time: null
//  3. Både dag og klokkeslett kunngjort → date: 'YYYY-MM-DD', time: 'HH:MM'
export interface StageSchedule {
  /** ISO-dato (YYYY-MM-DD), eller null hvis ikke kunngjort ennå. */
  date: string | null
  /** Klokkeslett («19:00», norsk tid), eller null hvis dagen er satt men ikke rekkefølgen på kampene ennå. */
  time: string | null
}

// MIDLERTIDIG (2026-09-27): World Grand Prix 2026 varer 28. sep–4. okt.
// Kun 1. runde-DATOEN er bekreftet i kildene research fant (spilles over to
// kvelder, 28.–29. sep) — IKKE noe klokkeslett per enkeltkamp. 21:00 er kun
// turneringens generelle åpningstidspunkt (KICKOFF i tournament.ts), ikke et
// bekreftet starttidspunkt for hver av de 16 runde 1-kampene — PDC bestemmer
// typisk rekkefølgen/klokkeslettene per kamp nærmere selve dagen (jf.
// tilstand 2 i kommentaren over). IKKE sett time her igjen uten en ekte kilde
// per kamp. Resten av kampplanen (runde 2/kvart/semi/finale-datoer) sto
// heller ikke i kildene, derfor «ikke satt». Fyll inn etter hvert som
// PDC/Sky Sports bekrefter dem.
export const STAGE_SCHEDULE: Record<Stage, StageSchedule> = {
  r1: { date: '2026-09-28', time: null },
  r2: { date: null, time: null },
  qf: { date: null, time: null },
  sf: { date: null, time: null },
  final: { date: null, time: null },
}

// Bekreftet dato+klokkeslett for ENKELTKAMPER i runde 1 — STAGE_SCHEDULE
// over dekker kun étt dato+klokkeslett PER RUNDE, men runde 1 spilles over
// to KVELDER (28. og 29. sep, bekreftet i ESPN/Sky Sports/Scotsman sin
// dekning av trekningen, kryssjekket 2026-09-28 — én enkelt dato for hele
// runde 1 var derfor feil for halvparten av kampene). Denne tabellen er et
// per-spiller-oppslag (én av de to i hver kamp holder, se
// getScheduleLabel()) som overstyrer BÅDE dato og klokkeslett fra
// STAGE_SCHEDULE når den finnes.
//
// Kveld 1 (28. sep): klokkeslett bekreftet fra en livescore-side samme
// kveld (19:10–22:40, 30 min mellomrom per kamp).
// Kveld 2 (29. sep): DATOEN er bekreftet (samme kilder som over), men
// ESPN/Sky Sports/Scotsman oppgir kun at kveldsøkten starter kl. 19:00
// norsk tid (18:00 BST) — IKKE et eksakt klokkeslett per enkeltkamp slik vi
// har for kveld 1. IKKE gjett/ekstrapoler dette (f.eks. anta samme 30-
// minutters mønster som kveld 1) — sett time: null til en ekte kilde med
// per-kamp-klokkeslett for 29. sep er funnet.
const R1_MATCH_SCHEDULE: Record<string, { date: string; time: string | null }> = {
  'Danny Noppert': { date: '2026-09-28', time: '19:10' }, 'Niko Springer': { date: '2026-09-28', time: '19:10' },
  'Ross Smith': { date: '2026-09-28', time: '19:40' }, 'Cameron Menzies': { date: '2026-09-28', time: '19:40' },
  'Nathan Aspinall': { date: '2026-09-28', time: '20:10' }, 'Kevin Doets': { date: '2026-09-28', time: '20:10' },
  'Jonny Clayton': { date: '2026-09-28', time: '20:40' }, 'Krzysztof Ratajski': { date: '2026-09-28', time: '20:40' },
  'Gerwyn Price': { date: '2026-09-28', time: '21:10' }, 'Sebastian Białecki': { date: '2026-09-28', time: '21:10' },
  'Michael van Gerwen': { date: '2026-09-28', time: '21:40' }, 'Ryan Joyce': { date: '2026-09-28', time: '21:40' },
  'Luke Littler': { date: '2026-09-28', time: '22:10' }, 'Luke Woodhouse': { date: '2026-09-28', time: '22:10' },
  'Wessel Nijman': { date: '2026-09-28', time: '22:40' }, 'Rob Cross': { date: '2026-09-28', time: '22:40' },
  'Chris Dobey': { date: '2026-09-29', time: null }, 'Jermaine Wattimena': { date: '2026-09-29', time: null },
  'Ryan Searle': { date: '2026-09-29', time: null }, "William O'Connor": { date: '2026-09-29', time: null },
  'Josh Rock': { date: '2026-09-29', time: null }, 'Niels Zonneveld': { date: '2026-09-29', time: null },
  'James Wade': { date: '2026-09-29', time: null }, 'Joe Cullen': { date: '2026-09-29', time: null },
  'Gary Anderson': { date: '2026-09-29', time: null }, 'Damon Heta': { date: '2026-09-29', time: null },
  'Gian van Veen': { date: '2026-09-29', time: null }, 'Dirk van Duijvenbode': { date: '2026-09-29', time: null },
  'Luke Humphries': { date: '2026-09-29', time: null }, 'Dave Chisnall': { date: '2026-09-29', time: null },
  'Stephen Bunting': { date: '2026-09-29', time: null }, 'Andrew Gilding': { date: '2026-09-29', time: null },
}

export interface ScheduleLabel {
  dateLabel: string
  timeLabel: string
  dateKnown: boolean
  timeKnown: boolean
}

const NOT_SET: Record<Locale, string> = { no: 'Ikke satt', en: 'Not set' }
const INTL_LOCALE: Record<Locale, string> = { no: 'nb-NO', en: 'en-US' }

/**
 * Dato/klokkeslett-tekst for en runde, med riktig «ikke satt»-fallback i alle
 * tre tilstander. `playerName` (én av de to spillerne i kampen) slår opp et
 * eventuelt PER KAMP-oppslag i R1_MATCH_SCHEDULE, som overstyrer BÅDE dato
 * og klokkeslett fra STAGE_SCHEDULE når det finnes (kun relevant for runde 1
 * så langt, siden det er den eneste runden som spilles over flere dager).
 */
export function getScheduleLabel(stage: Stage, locale: Locale = 'no', playerName?: string): ScheduleLabel {
  const s = STAGE_SCHEDULE[stage]
  const notSet = NOT_SET[locale]
  const override = playerName ? R1_MATCH_SCHEDULE[playerName] : undefined
  const date = override?.date ?? s.date
  if (!date) return { dateLabel: notSet, timeLabel: notSet, dateKnown: false, timeKnown: false }
  const d = new Date(`${date}T00:00:00Z`)
  const dateLabel = d.toLocaleDateString(INTL_LOCALE[locale], { day: 'numeric', month: 'short', timeZone: 'UTC' })
  const time = override ? override.time : s.time
  return { dateLabel, timeLabel: time ?? notSet, dateKnown: true, timeKnown: !!time }
}
