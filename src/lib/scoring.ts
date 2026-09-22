import { SCORING, STAGE_ORDER, type Stage } from '@/config/scoring'

export interface MatchResult {
  player1: string
  player2: string
  sets1: number
  sets2: number
  stage?: string
  winner?: string | null
}

export interface PickWithPot {
  player_name: string
  pot_number: number
}

export interface AdvancementRow {
  player_name: string
  stage_reached: string | null
}

/** Kumulativ poengsum for runden en spiller har nådd (poeng for alle tidligere runder inkludert). */
export function calcAdvancementBonus(stageReached: string | null): number {
  if (!stageReached) return 0
  const idx = STAGE_ORDER.indexOf(stageReached as Stage)
  if (idx === -1) return 0
  return STAGE_ORDER.slice(0, idx + 1).reduce((sum, s) => sum + SCORING.advancement[s], 0)
}

export function calcPlayerPoints(
  pick: PickWithPot,
  advancement: AdvancementRow[],
): { advPts: number; multiplier: number; total: number } {
  const advRow = advancement.find((a) => a.player_name === pick.player_name)
  const advPts = calcAdvancementBonus(advRow?.stage_reached ?? null)
  const multiplier = SCORING.underdogMultiplier[pick.pot_number] ?? 1
  return { advPts, multiplier, total: advPts * multiplier }
}

export function calcParticipantPoints(
  picks: PickWithPot[],
  advancement: AdvancementRow[],
): number {
  return picks.reduce((sum, pick) => sum + calcPlayerPoints(pick, advancement).total, 0)
}

/** Slått ut = det finnes en registrert kamp der spilleren deltok, men ikke vant. */
export function isPlayerEliminated(
  playerName: string,
  matchResults: MatchResult[],
): boolean {
  return matchResults.some(
    (m) =>
      (m.player1 === playerName || m.player2 === playerName) &&
      m.winner != null &&
      m.winner !== playerName,
  )
}
