import { GROUP_STAGE, STAGE_ORDER } from '@/config/scoring'

const STAGE_INDEX: Record<string, number> = Object.fromEntries(STAGE_ORDER.map((s, i) => [s, i]))

export interface MatchResult {
  player1: string
  player2: string
  // Felt-navnene er historiske (sett i World Grand Prix) — for Grand Slam
  // holder de antall LEGS. Kun brukt til visning av resultatet.
  sets1: number
  sets2: number
  stage?: string
  winner?: string | null
}

export interface PickWithPot {
  player_name: string
  pot_number: number
}

/**
 * Slått ut. I gruppespillet (round robin) taper man ikke ut av én tapt kamp,
 * og vi har ikke oppsettet for sluttspillet (hvem som gikk videre) — bare de
 * spilte resultatene. Derfor:
 *  - har spilleren spilt sluttspill, er hen ute når hen taper en sluttspillkamp;
 *  - har hen IKKE spilt sluttspill, regnes hen først som ute når første runde
 *    ETTER åpningsrunden i sluttspillet (kvartfinalene) er i gang — da er alle
 *    som gikk videre fra gruppene garantert registrert med en sluttspillkamp.
 *    Før det kan en gruppevinner fortsatt vente på sin første sluttspillkamp.
 */
export function isPlayerEliminated(playerName: string, matches: MatchResult[]): boolean {
  const idx = (m: MatchResult) => (m.stage ? STAGE_INDEX[m.stage] ?? -1 : -1)
  const knockoutMine = matches.filter((m) => idx(m) > 0 && (m.player1 === playerName || m.player2 === playerName))
  if (knockoutMine.length > 0) return knockoutMine.some((m) => m.winner != null && m.winner !== playerName)
  return matches.some((m) => idx(m) >= 2)
}

/** Vant finalen. */
export function isPlayerChampion(playerName: string, matches: MatchResult[]): boolean {
  return matches.some((m) => m.stage === STAGE_ORDER[STAGE_ORDER.length - 1] && m.winner === playerName)
}

/**
 * Alle kamper spilleren har deltatt i, sortert kronologisk (tidligste runde
 * først) — samme filter+sortering trengtes uavhengig tre steder (Min sides
 * «Mitt lag», «Tidligere kamper» i spillerpanelet); én kilde her i stedet.
 */
export function getPlayerMatches(playerName: string, matches: MatchResult[]): MatchResult[] {
  return matches
    .filter((m) => m.player1 === playerName || m.player2 === playerName)
    .sort((a, b) => STAGE_INDEX[a.stage ?? GROUP_STAGE] - STAGE_INDEX[b.stage ?? GROUP_STAGE])
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
