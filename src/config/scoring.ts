// MIDLERTIDIG (2026-10-08): Grand Slam of Darts 2026 — gruppespill, deretter
// sluttspill. Rekkefølgen under er FORELØPIG: 'r16' forutsetter at 16 spillere
// går videre fra de 16 gruppene (dartrankings.co.uk utleder det fra
// premiepengene — IKKE bekreftet av PDC). Oppdater når PDC har publisert
// programmet, og se WGP_PIVOT_REVERT.md for veien tilbake til VM i desember
// (['r1','r2','r3','r4','qf','sf','final']).
//
// Rekkefølgen er hele grunnlaget for «nivå»-modellen i src/lib/prize.ts: en
// spillers nivå er indeksen til siste runde hen har spilt i (+1), og vinneren
// av siste stadium får ett nivå til.
export const STAGE_ORDER = ['group', 'r16', 'qf', 'sf', 'final'] as const
export type Stage = typeof STAGE_ORDER[number]

/** Gruppespillet — der ingen er «slått ut» av å tape én kamp (round robin). */
export const GROUP_STAGE: Stage = STAGE_ORDER[0]

export const STAGE_LABELS: Record<Stage, string> = {
  group: 'Gruppespill',
  r16: 'Siste 16',
  qf: 'Kvartfinale',
  sf: 'Semifinale',
  final: 'Finale',
}

// «Turneringsvinner» er bevisst IKKE med i STAGE_ORDER/Stage — det er ikke en runde noen
// spiller en kamp i, bare en avledet status (isPlayerChampion() i src/lib/scoring.ts) for
// den som vant finalen. Brukes som visningstekst der en kamp-fase ikke er relevant.
export const CHAMPION_LABEL = 'Turneringsvinner'
