// Rekkefølge følger PDC World Darts Championship sitt faktiske format:
// rent utslagsspill, ingen gruppespill, ingen bronsefinale.
export const STAGE_ORDER = ['r1', 'r2', 'r3', 'r4', 'qf', 'sf', 'final', 'winner'] as const
export type Stage = typeof STAGE_ORDER[number]

export const STAGE_LABELS: Record<Stage, string> = {
  r1: '1. runde',
  r2: '2. runde',
  r3: '3. runde',
  r4: '4. runde',
  qf: 'Kvartfinale',
  sf: 'Semifinale',
  final: 'Finale',
  winner: 'VM-vinner',
}

export const SCORING = {
  advancement: {
    r1: 5,
    r2: 5,
    r3: 10,
    r4: 10,
    qf: 15,
    sf: 20,
    final: 25,
    winner: 35,
  } as Record<Stage, number>,
  underdogMultiplier: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 4 } as Record<number, number>,
}
