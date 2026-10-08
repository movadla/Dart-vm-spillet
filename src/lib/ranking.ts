// Rene rangeringsberegninger (ingen I/O) — delt av Min side, leaderboard,
// liga og demo-verdenen, og enhetstestet i ranking.test.ts. Datahenting
// ligger i participantData.ts.

import { POTS } from '@/data/pots'
import { STAGE_ORDER } from '@/config/scoring'
import { isPlayerEliminated, isPlayerChampion, furthestStageReached, type MatchResult, type PickWithPot } from '@/lib/scoring'
import { bestFinishLevel } from '@/lib/prize'
import type { RankEntry } from '@/components/RankList'

export interface PickRow extends PickWithPot { participant_id: string }

// ── Felles beregninger ─────────────────────────────────────────────────────

export function groupPicks(rows: PickRow[]): Map<string, PickWithPot[]> {
  const by = new Map<string, PickWithPot[]>()
  for (const r of rows) {
    if (!by.has(r.participant_id)) by.set(r.participant_id, [])
    by.get(r.participant_id)!.push({ pot_number: r.pot_number, player_name: r.player_name })
  }
  return by
}

export function rankAmong(myPoints: number, byParticipant: Map<string, PickWithPot[]>, matches: MatchResult[]): number {
  let above = 0
  for (const picks of byParticipant.values()) if (bestFinishLevel(picks, matches) > myPoints) above++
  return above + 1
}

/** Bygger sorterte leaderboard-rader (samme logikk for hoved-leaderboard og liga). */
export function buildRankRows(
  participants: { id: string; name: string; created_at: string }[],
  picks: PickRow[],
  matches: MatchResult[],
  baseline: Record<string, number>,
  vmStarted: boolean,
): RankEntry[] {
  const by = groupPicks(picks)
  const scored = participants
    .map((p) => {
      const playerPicks = (by.get(p.id) ?? []).slice().sort((a, b) => a.pot_number - b.pot_number)
      const points = bestFinishLevel(playerPicks, matches)
      // Spillere som fortsatt er med — sorteringsnøkkel INNENFOR samme nivå.
      // Påvirker IKKE premien (alle med samme nivå deler), bare rekkefølgen.
      const alive = playerPicks.filter((pk) => !isPlayerEliminated(pk.player_name, matches)).length
      return { p, playerPicks, points, alive }
    })
    // Først nivå, så flest spillere igjen, til slutt den som meldte seg på
    // først (stabil rekkefølge når alt annet er likt).
    .sort((a, b) => b.points - a.points || b.alive - a.alive || a.p.created_at.localeCompare(b.p.created_at))

  return scored.map(({ p, playerPicks, points }, i) => ({
    id: p.id,
    name: p.name,
    points,
    rankDelta: vmStarted && baseline[p.id] != null ? baseline[p.id] - (i + 1) : undefined,
    flags: playerPicks.map((pk) => {
      const pot = POTS.find((pt) => pt.potNumber === pk.pot_number)
      const iso2 = pot?.players.find((pl) => pl.name === pk.player_name)?.iso2 ?? ''
      const stageReached = furthestStageReached(pk.player_name, matches, STAGE_ORDER)
      const champion = isPlayerChampion(pk.player_name, matches)
      const medal = champion ? 'gold' : stageReached === 'final' ? 'silver' : undefined
      return { iso2, eliminated: isPlayerEliminated(pk.player_name, matches), medal, playerName: pk.player_name, potNumber: pk.pot_number }
    }),
  }))
}
