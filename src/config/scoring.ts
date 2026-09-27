// MIDLERTIDIG (2026-09-27): rekkefølgen følger PDC World Grand Prix sitt
// format (32-spillerfelt → 5 runder, double-in/double-out) i stedet for det
// vanlige 128-spiller/7-runde World Championship-formatet, som en
// generalprøve mot en ekte turnering. Bytt tilbake til
// ['r1','r2','r3','r4','qf','sf','final'] når det nærmer seg VM i desember —
// se src/config/tournament.ts.
export const STAGE_ORDER = ['r1', 'r2', 'qf', 'sf', 'final'] as const
export type Stage = typeof STAGE_ORDER[number]

export const STAGE_LABELS: Record<Stage, string> = {
  r1: '1. runde',
  r2: '2. runde',
  qf: 'Kvartfinale',
  sf: 'Semifinale',
  final: 'Finale',
}

// «Turneringsvinner» er bevisst IKKE med i STAGE_ORDER/Stage — det er ikke en runde noen
// spiller en kamp i, bare en avledet status (isPlayerChampion() i src/lib/scoring.ts) for
// den som vant finalen. Brukes som visningstekst der en kamp-fase ikke er relevant.
// (Var «VM-vinner» — nøytralisert mens appen midlertidig peker mot World Grand Prix.)
export const CHAMPION_LABEL = 'Turneringsvinner'

// Enkel poengmodell: 1p per vunnet sett, 2p per kampseier (avansement), 5p bonus for å vinne
// hele turneringen — multiplisert med pott-multiplikatoren. Validert med
// scripts/simulate-scoring-suspense.ts (1000 simulerte turneringer).
export const SCORING = {
  perSetWon: 1,
  perAdvancement: 2,
  tournamentWinner: 5,
  underdogMultiplier: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 4 } as Record<number, number>,
}
