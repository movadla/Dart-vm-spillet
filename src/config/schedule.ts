import type { Stage } from './scoring'

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

export const STAGE_SCHEDULE: Record<Stage, StageSchedule> = {
  r1: { date: null, time: null },
  r2: { date: null, time: null },
  r3: { date: null, time: null },
  r4: { date: null, time: null },
  qf: { date: null, time: null },
  sf: { date: null, time: null },
  final: { date: null, time: null },
}

export interface ScheduleLabel {
  dateLabel: string
  timeLabel: string
  dateKnown: boolean
  timeKnown: boolean
}

const NOT_SET = 'Ikke satt'

/** Dato/klokkeslett-tekst for en runde, med riktig «ikke satt»-fallback i alle tre tilstander. */
export function getScheduleLabel(stage: Stage): ScheduleLabel {
  const s = STAGE_SCHEDULE[stage]
  if (!s.date) return { dateLabel: NOT_SET, timeLabel: NOT_SET, dateKnown: false, timeKnown: false }
  const d = new Date(`${s.date}T00:00:00Z`)
  const dateLabel = d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', timeZone: 'UTC' })
  return { dateLabel, timeLabel: s.time ?? NOT_SET, dateKnown: true, timeKnown: !!s.time }
}
