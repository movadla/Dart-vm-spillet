// Ren, testbar valideringslogikk for admin sitt "Legg inn kampresultat"-skjema —
// skilt ut fra API-routen slik at reglene (uavgjort, spiller mot seg selv, o.l.)
// faktisk kan enhetstestes uten å mocke Next.js/Supabase.

export interface ValidMatchInput {
  player1: string
  player2: string
  sets1: number
  sets2: number
  stage: string
  winner: string
}

export type MatchResultValidation =
  | { ok: true; value: ValidMatchInput }
  | { ok: false; error: string }

export function validateMatchResultInput(
  body: { player1?: unknown; player2?: unknown; sets1?: unknown; sets2?: unknown; stage?: unknown },
  validStages: readonly string[],
): MatchResultValidation {
  const { player1, player2, sets1, sets2, stage } = body

  if (!player1 || !player2 || sets1 === undefined || sets2 === undefined) {
    return { ok: false, error: 'Mangler data' }
  }
  if (typeof player1 !== 'string' || typeof player2 !== 'string') {
    return { ok: false, error: 'Spillernavn må være tekst' }
  }
  if (typeof sets1 !== 'number' || typeof sets2 !== 'number') {
    return { ok: false, error: 'Sett må være tall' }
  }
  if (player1 === player2) {
    return { ok: false, error: 'Spiller 1 og spiller 2 kan ikke være samme spiller' }
  }
  if (sets1 === sets2) {
    return { ok: false, error: 'Uavgjort er ikke gyldig — én spiller må ha flere sett enn den andre' }
  }

  const matchStage = typeof stage === 'string' && validStages.includes(stage) ? stage : 'r1'
  const winner = sets1 > sets2 ? player1 : player2

  return { ok: true, value: { player1, player2, sets1, sets2, stage: matchStage, winner } }
}
