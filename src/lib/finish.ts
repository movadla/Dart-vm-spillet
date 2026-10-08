import { STAGE_ORDER } from '@/config/scoring'
import type { PlayersDict } from '@/i18n/dictionaries/no/players'
import type { Dictionary } from '@/i18n/dictionaries'

/**
 * Visningstekst for et «nivå» (se src/lib/prize.ts): null = ikke spilt ennå,
 * stadiets navn («Gruppespill», «Siste 16» …), eller turneringsvinner.
 */
export function finishLabel(level: number, players: PlayersDict): string | null {
  if (level <= 0) return null
  if (level > STAGE_ORDER.length) return players.champion
  return players.stages[STAGE_ORDER[level - 1]]
}

/** Kort form til tabeller/rader («Kvart», «Mester», «–» for ikke spilt). */
export function finishShortLabel(level: number, dict: Dictionary): string {
  if (level <= 0) return dict.common.rankList.notPlayed
  if (level > STAGE_ORDER.length) return dict.common.rankList.champion
  return dict.deltaker.playerDetailPanel.shortStage[STAGE_ORDER[level - 1]]
}
