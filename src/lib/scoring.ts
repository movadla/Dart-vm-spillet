import { SCORING } from '@/config/scoring'

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

export function calcPlayerPoints(
  pick: PickWithPot,
  matches: MatchResult[],
): { setPts: number; advPts: number; winnerBonus: number; multiplier: number; total: number } {
  let setPts = 0
  let wins = 0
  let wonFinal = false
  for (const m of matches) {
    const isP1 = m.player1 === pick.player_name
    const isP2 = m.player2 === pick.player_name
    if (!isP1 && !isP2) continue
    setPts += (isP1 ? m.sets1 : m.sets2) * SCORING.perSetWon
    if (m.winner === pick.player_name) {
      wins++
      if (m.stage === 'final') wonFinal = true
    }
  }
  const advPts = wins * SCORING.perAdvancement
  const winnerBonus = wonFinal ? SCORING.tournamentWinner : 0
  const multiplier = SCORING.underdogMultiplier[pick.pot_number] ?? 1
  return { setPts, advPts, winnerBonus, multiplier, total: (setPts + advPts + winnerBonus) * multiplier }
}

export function calcParticipantPoints(picks: PickWithPot[], matches: MatchResult[]): number {
  return picks.reduce((sum, pick) => sum + calcPlayerPoints(pick, matches).total, 0)
}

/** Slått ut = det finnes en registrert kamp der spilleren deltok, men ikke vant. */
export function isPlayerEliminated(playerName: string, matches: MatchResult[]): boolean {
  return matches.some(
    (m) =>
      (m.player1 === playerName || m.player2 === playerName) &&
      m.winner != null &&
      m.winner !== playerName,
  )
}

/** Vant finalen. */
export function isPlayerChampion(playerName: string, matches: MatchResult[]): boolean {
  return matches.some((m) => m.stage === 'final' && m.winner === playerName)
}

/** Siste (høyeste) runde spilleren har deltatt i, basert på registrerte kamper — eller null om ingen ennå. */
export function furthestStageReached(
  playerName: string,
  matches: MatchResult[],
  stageOrder: readonly string[],
): string | null {
  let furthest: string | null = null
  for (const m of matches) {
    if (m.player1 !== playerName && m.player2 !== playerName) continue
    if (!m.stage) continue
    const idx = stageOrder.indexOf(m.stage)
    if (idx === -1) continue
    if (!furthest || idx > stageOrder.indexOf(furthest)) furthest = m.stage
  }
  return furthest
}
