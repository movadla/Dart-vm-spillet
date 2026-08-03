import { SCORING } from '@/config/scoring'

export interface MatchResult {
  home_team: string
  away_team: string
  home_goals: number
  away_goals: number
  stage?: string
  winner?: string | null
}

export interface PickWithPot {
  team_name: string
  pot_number: number
}

export interface AdvancementRow {
  team_name: string
  stage_reached: string | null
}

// Knockout stages with cumulative bonuses
const STAGE_ORDER = ['group', 'r32', 'r16', 'qf', 'sf']
const STAGE_POINTS: Record<string, number> = {
  group: SCORING.advancement.group,   // 5
  r32: SCORING.advancement.r32,       // 10
  r16: SCORING.advancement.r16,       // 15
  qf: SCORING.advancement.qf,         // 20
  sf: 0,                              // in final — medals handle the bonus
}

// Medal bonuses stack on top of the SF cumulative (50p)
const MEDAL_BONUS: Record<string, number> = {
  bronze: SCORING.medal.bronze,   // +15 → 65p total
  silver: SCORING.medal.silver,   // +20 → 70p total
  gold: SCORING.medal.gold,       // +40 → 90p total
}

export function calcAdvancementBonus(stageReached: string | null): number {
  if (!stageReached) return 0
  if (stageReached in MEDAL_BONUS) {
    const sfTotal = STAGE_ORDER.reduce((sum, s) => sum + (STAGE_POINTS[s] ?? 0), 0)
    return sfTotal + MEDAL_BONUS[stageReached]
  }
  const idx = STAGE_ORDER.indexOf(stageReached)
  if (idx === -1) return 0
  return STAGE_ORDER.slice(0, idx + 1).reduce((sum, s) => sum + (STAGE_POINTS[s] ?? 0), 0)
}

export function calcTeamMatchPoints(teamName: string, matches: MatchResult[]): number {
  let points = 0
  for (const m of matches) {
    const isHome = m.home_team === teamName
    const isAway = m.away_team === teamName
    if (!isHome && !isAway) continue
    const scored = isHome ? m.home_goals : m.away_goals
    const conceded = isHome ? m.away_goals : m.home_goals
    points += scored * SCORING.match.goal
    const isGroup = !m.stage || m.stage === 'group'
    if (isGroup) {
      if (scored > conceded) points += SCORING.match.win
      else if (scored === conceded) points += SCORING.match.draw
    }
  }
  return points
}

export function calcTeamPoints(
  pick: PickWithPot,
  matches: MatchResult[],
  advancement: AdvancementRow[],
): { matchPts: number; advPts: number; multiplier: number; total: number } {
  const matchPts = calcTeamMatchPoints(pick.team_name, matches)
  const advRow = advancement.find((a) => a.team_name === pick.team_name)
  const advPts = calcAdvancementBonus(advRow?.stage_reached ?? null)
  const multiplier = SCORING.underdogMultiplier[pick.pot_number] ?? 1
  return { matchPts, advPts, multiplier, total: (matchPts + advPts) * multiplier }
}

export function calcParticipantPoints(
  picks: PickWithPot[],
  matches: MatchResult[],
  advancement: AdvancementRow[],
): number {
  return picks.reduce((sum, pick) => sum + calcTeamPoints(pick, matches, advancement).total, 0)
}

export function isTeamEliminated(
  teamName: string,
  advRows: AdvancementRow[],
  matchResults: MatchResult[],
  vmStarted: boolean,
): boolean {
  if (!vmStarted) return false
  const allGroupsDone = matchResults.filter(m => !m.stage || m.stage === 'group').length >= 72
  const advRow = advRows.find(a => a.team_name === teamName)
  const advStage = advRow?.stage_reached ?? null
  const inStage = (s: string) => matchResults.some(
    m => (m.home_team === teamName || m.away_team === teamName) && m.stage === s
  )
  if (!advRow && allGroupsDone) return true
  if (advStage === 'group' && inStage('r32')) return true
  if (advStage === 'r32'   && inStage('r16')) return true
  if (advStage === 'r16'   && inStage('qf'))  return true
  if (advStage === 'qf'    && inStage('sf') && inStage('bronze')) return true
  return false
}
