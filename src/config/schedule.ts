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
// Kveld 1 (28. sep) og kveld 2 (29. sep): klokkeslett bekreftet fra samme
// livescore-side, én kveld om gangen (kveld 1: 2026-09-28, kveld 2:
// 2026-09-29) — begge kvelder følger samme mønster, 19:10–22:40 med 30 min
// mellomrom per kamp.
const R1_MATCH_SCHEDULE: Record<string, { date: string; time: string | null }> = {
  'Danny Noppert': { date: '2026-09-28', time: '19:10' }, 'Niko Springer': { date: '2026-09-28', time: '19:10' },
  'Ross Smith': { date: '2026-09-28', time: '19:40' }, 'Cameron Menzies': { date: '2026-09-28', time: '19:40' },
  'Nathan Aspinall': { date: '2026-09-28', time: '20:10' }, 'Kevin Doets': { date: '2026-09-28', time: '20:10' },
  'Jonny Clayton': { date: '2026-09-28', time: '20:40' }, 'Krzysztof Ratajski': { date: '2026-09-28', time: '20:40' },
  'Gerwyn Price': { date: '2026-09-28', time: '21:10' }, 'Sebastian Białecki': { date: '2026-09-28', time: '21:10' },
  'Michael van Gerwen': { date: '2026-09-28', time: '21:40' }, 'Ryan Joyce': { date: '2026-09-28', time: '21:40' },
  'Luke Littler': { date: '2026-09-28', time: '22:10' }, 'Luke Woodhouse': { date: '2026-09-28', time: '22:10' },
  'Wessel Nijman': { date: '2026-09-28', time: '22:40' }, 'Rob Cross': { date: '2026-09-28', time: '22:40' },
  'Chris Dobey': { date: '2026-09-29', time: '19:10' }, 'Jermaine Wattimena': { date: '2026-09-29', time: '19:10' },
  'Ryan Searle': { date: '2026-09-29', time: '19:40' }, "William O'Connor": { date: '2026-09-29', time: '19:40' },
  'Josh Rock': { date: '2026-09-29', time: '20:10' }, 'Niels Zonneveld': { date: '2026-09-29', time: '20:10' },
  'James Wade': { date: '2026-09-29', time: '20:40' }, 'Joe Cullen': { date: '2026-09-29', time: '20:40' },
  'Gary Anderson': { date: '2026-09-29', time: '21:10' }, 'Damon Heta': { date: '2026-09-29', time: '21:10' },
  'Gian van Veen': { date: '2026-09-29', time: '21:40' }, 'Dirk van Duijvenbode': { date: '2026-09-29', time: '21:40' },
  'Luke Humphries': { date: '2026-09-29', time: '22:10' }, 'Dave Chisnall': { date: '2026-09-29', time: '22:10' },
  'Stephen Bunting': { date: '2026-09-29', time: '22:40' }, 'Andrew Gilding': { date: '2026-09-29', time: '22:40' },
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
/** Slår opp rå dato+klokkeslett (ikke tekst) — delt av getScheduleLabel() og getScheduleSortKey().
 * BUG FUNNET 2026-09-28 av brukeren: overstyringen gjaldt tidligere for ALLE
 * stadier, ikke bare runde 1 — en spiller som var ferdig med runde 1 (f.eks.
 * Noppert) og fikk vist en runde 2-PROJEKSJON, arvet da feilaktig runde 1
 * sitt eget bekreftede tidspunkt (28. sep) på runde 2-kampen, som ikke er
 * spilt og ikke er kjent ennå. R1_MATCH_SCHEDULE skal KUN slå inn når man
 * faktisk spør om runde 1 — `stage === 'r1'`-sjekken under er det som
 * garanterer det. */
function resolveSchedule(stage: Stage, playerName?: string): { date: string | null; time: string | null } {
  const s = STAGE_SCHEDULE[stage]
  const override = stage === 'r1' && playerName ? R1_MATCH_SCHEDULE[playerName] : undefined
  return { date: override?.date ?? s.date, time: override ? override.time : s.time }
}

export function getScheduleLabel(stage: Stage, locale: Locale = 'no', playerName?: string): ScheduleLabel {
  const notSet = NOT_SET[locale]
  const { date, time } = resolveSchedule(stage, playerName)
  if (!date) return { dateLabel: notSet, timeLabel: notSet, dateKnown: false, timeKnown: false }
  const d = new Date(`${date}T00:00:00Z`)
  const dateLabel = d.toLocaleDateString(INTL_LOCALE[locale], { day: 'numeric', month: 'short', timeZone: 'UTC' })
  return { dateLabel, timeLabel: time ?? notSet, dateKnown: true, timeKnown: !!time }
}

/**
 * Sorteringsnøkkel (epoch ms, tidligst = lavest) for «neste kamper»-lista.
 * Ukjent dato gir Infinity (sorteres sist). Kjent dato med ukjent
 * klokkeslett bruker 00:00 den dagen (kampen er i hvert fall DEN dagen,
 * selv om nøyaktig rekkefølge innad i dagen ikke er kjent ennå).
 */
export function getScheduleSortKey(stage: Stage, playerName?: string): number {
  const { date, time } = resolveSchedule(stage, playerName)
  if (!date) return Infinity
  return new Date(`${date}T${time ?? '00:00'}:00Z`).getTime()
}
