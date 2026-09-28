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

// Bekreftede klokkeslett for ENKELTKAMPER i runde 1, kveld 1 (28. sep) — sett
// inn 2026-09-28 fra en livescore-side (samme kveld som kampene faktisk
// spilles). STAGE_SCHEDULE over dekker kun ett dato+klokkeslett PER RUNDE,
// men runde 1 spilles over to kvelder med 8 forskjellige klokkeslett per
// kveld — denne tabellen er derfor et overstyrings-oppslag PER SPILLER (én
// av de to i hver kamp holder, se getScheduleLabel()), ikke en endring av
// selve STAGE_SCHEDULE-modellen. Kveld 2 (29. sep) sine klokkeslett er IKKE
// bekreftet ennå — spillerne derfra er bevisst utelatt, ikke glemt.
const R1_MATCH_TIMES: Record<string, string> = {
  'Danny Noppert': '19:10', 'Niko Springer': '19:10',
  'Ross Smith': '19:40', 'Cameron Menzies': '19:40',
  'Nathan Aspinall': '20:10', 'Kevin Doets': '20:10',
  'Jonny Clayton': '20:40', 'Krzysztof Ratajski': '20:40',
  'Gerwyn Price': '21:10', 'Sebastian Białecki': '21:10',
  'Michael van Gerwen': '21:40', 'Ryan Joyce': '21:40',
  'Luke Littler': '22:10', 'Luke Woodhouse': '22:10',
  'Wessel Nijman': '22:40', 'Rob Cross': '22:40',
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
 * eventuelt PER KAMP-klokkeslett i R1_MATCH_TIMES, som overstyrer det
 * generelle rundenivå-klokkeslettet (kun relevant for runde 1 så langt).
 */
export function getScheduleLabel(stage: Stage, locale: Locale = 'no', playerName?: string): ScheduleLabel {
  const s = STAGE_SCHEDULE[stage]
  const notSet = NOT_SET[locale]
  if (!s.date) return { dateLabel: notSet, timeLabel: notSet, dateKnown: false, timeKnown: false }
  const d = new Date(`${s.date}T00:00:00Z`)
  const dateLabel = d.toLocaleDateString(INTL_LOCALE[locale], { day: 'numeric', month: 'short', timeZone: 'UTC' })
  const time = (playerName && R1_MATCH_TIMES[playerName]) || s.time
  return { dateLabel, timeLabel: time ?? notSet, dateKnown: true, timeKnown: !!time }
}
