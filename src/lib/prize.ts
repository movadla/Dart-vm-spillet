// Premiemodellen for Grand Slam-formatet («4 valg, vinneren deler potten») —
// rene funksjoner uten I/O, enhetstestet i prize.test.ts.
//
// Regel (avgjort 2026-10-08): hver deltaker har 4 spillere. Den som har
// turneringsvinneren deler premien med alle andre som har samme spiller. Har
// INGEN vinneren, går premien til dem som har spilleren som kom lengst:
// først finalisten, så semifinalistene, så kvartfinalistene osv.
//
// «Nivå» er hele modellen: et tall per spiller som sier hvor langt de kom.
//   0                    = har ikke spilt noen kamp ennå
//   1 … stageOrder.length = siste runde de har spilt kamp i (indeks + 1)
//   stageOrder.length + 1 = vant finalen (turneringsvinner)
// En deltakers nivå er det HØYESTE nivået blant hans/hennes valg. Alle
// deltakere som deler det høyeste nivået i hele feltet deler premien.

import type { MatchResult, PickWithPot } from '@/lib/scoring'

/** Nivået til én spiller, utledet av de registrerte kampene. */
export function playerFinishLevel(
  playerName: string,
  matches: MatchResult[],
  stageOrder: readonly string[],
): number {
  let level = 0
  for (const m of matches) {
    if (m.player1 !== playerName && m.player2 !== playerName) continue
    const idx = m.stage ? stageOrder.indexOf(m.stage) : -1
    if (idx === -1) continue
    if (idx + 1 > level) level = idx + 1
    // Vant finalen = ett nivå over siste runde. Finalen er alltid siste
    // element i stageOrder.
    if (idx === stageOrder.length - 1 && m.winner === playerName) level = stageOrder.length + 1
  }
  return level
}

/** Deltakerens beste nivå blant sine valg (0 hvis ingen valg/ingen kamper). */
export function participantLevel(
  picks: PickWithPot[],
  matches: MatchResult[],
  stageOrder: readonly string[],
): number {
  let best = 0
  for (const pick of picks) {
    best = Math.max(best, playerFinishLevel(pick.player_name, matches, stageOrder))
  }
  return best
}

export interface PrizeStanding {
  /** Det høyeste nivået noen deltaker har. */
  topLevel: number
  /** Deltaker-id-er som deler premien akkurat nå (høyeste nivå). */
  sharers: string[]
  /**
   * true = ingen har en spiller som har kommet videre fra gruppespillet
   * (nivå ≤ gruppenivå), så det finnes ingen meningsfull vinner — premien
   * går til neste turnering (VM i desember). Avgjort 2026-10-08 som
   * «overføres», men NÅR dette teller som «ingen vinner» er min tolkning.
   */
  rollover: boolean
  /** true når finalen er spilt, dvs. stillingen er endelig. */
  final: boolean
}

export function computePrizeStanding(
  picksByParticipant: Map<string, PickWithPot[]>,
  matches: MatchResult[],
  stageOrder: readonly string[],
): PrizeStanding {
  const finalStage = stageOrder[stageOrder.length - 1]
  const final = matches.some((m) => m.stage === finalStage && m.winner != null)

  let topLevel = 0
  const levels = new Map<string, number>()
  for (const [id, picks] of picksByParticipant) {
    const level = participantLevel(picks, matches, stageOrder)
    levels.set(id, level)
    if (level > topLevel) topLevel = level
  }
  const sharers = topLevel === 0
    ? []
    : [...levels].filter(([, level]) => level === topLevel).map(([id]) => id)
  // Nivå 1 = gruppespillet (første element i stageOrder). Over det = en
  // spiller har faktisk spilt i sluttspillet.
  const rollover = topLevel <= 1
  return { topLevel, sharers, rollover, final }
}
