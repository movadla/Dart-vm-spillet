import type { MatchResult } from '@/lib/scoring'
import { R32_DRAW, R16_TO_QF_PAIRS, QF_TO_SF_PAIRS, getConfirmedPositions, getConfirmed3rdPlaces, resolvePos, getR32DrawIndex } from '@/data/bracket-draw'

export interface BracketTeam {
  name: string
  flag: string
}

export interface BracketMatch {
  home: BracketTeam | null
  away: BracketTeam | null
  homeGoals: number | null
  awayGoals: number | null
  winner: BracketTeam | null
}

function winnerOf(m: MatchResult): string {
  return m.winner ?? (m.home_goals > m.away_goals ? m.home_team : m.away_team)
}

function toTeam(
  name: string | null | undefined,
  allTeams: { name: string; flag: string }[]
): BracketTeam | null {
  if (!name) return null
  return { name, flag: allTeams.find(t => t.name === name)?.flag ?? '🏳' }
}

function toMatch(m: MatchResult, allTeams: { name: string; flag: string }[]): BracketMatch {
  return {
    home: toTeam(m.home_team, allTeams),
    away: toTeam(m.away_team, allTeams),
    homeGoals: m.home_goals,
    awayGoals: m.away_goals,
    winner: toTeam(winnerOf(m), allTeams),
  }
}

export interface KnockoutBracket {
  r32: BracketMatch[]
  r16: BracketMatch[]
  qf: BracketMatch[]
  sf: BracketMatch[]
  bronze: BracketMatch[]
  final: BracketMatch[]
}

function allHaveWinners(matches: BracketMatch[]): boolean {
  return matches.length > 0 && matches.every(m => m.winner !== null)
}

// Build pending slots for winners not yet scheduled in the next round.
// Pairs them alphabetically among themselves (deterministic, consistent with getKnockoutOpponent).
function pendingSlots(prevRound: BracketMatch[], nextRoundActual: BracketMatch[]): BracketMatch[] {
  const inNext = new Set(
    nextRoundActual.flatMap(m => [m.home?.name, m.away?.name]).filter(Boolean) as string[]
  )
  const waiting = prevRound
    .filter(m => m.winner && !inNext.has(m.winner.name))
    .map(m => m.winner!)
    .sort((a, b) => a.name.localeCompare(b.name))

  const slots: BracketMatch[] = []
  for (let i = 0; i + 1 < waiting.length; i += 2) {
    slots.push({ home: waiting[i], away: waiting[i + 1], homeGoals: null, awayGoals: null, winner: null })
  }
  return slots
}

export function buildBracket(
  results: MatchResult[],
  allTeams: { name: string; flag: string }[]
): KnockoutBracket {
  const byStage = (stage: string) =>
    results.filter(m => m.stage === stage).sort((a, b) => a.home_team.localeCompare(b.home_team))

  const r32Raw    = byStage('r32').map(m => toMatch(m, allTeams))
  const r16Actual = byStage('r16').map(m => toMatch(m, allTeams))
  const qfActual  = byStage('qf').map(m => toMatch(m, allTeams))
  const sfActual  = byStage('sf').map(m => toMatch(m, allTeams))
  const finActual = results.find(m => m.stage === 'final')

  // Build R32 in draw order (0-15) so visual pairs match bracket chain (pairs feed same R16 match).
  // Played matches go at their official draw slot; pending pairs fill remaining slots.
  // Orphan teams (official partner already played elsewhere) are paired at end.
  const confirmedPos = getConfirmedPositions(results)
  const confirmed3rd = getConfirmed3rdPlaces(results)
  const playedInR32 = new Set<string>(
    r32Raw.flatMap(m => [m.home?.name, m.away?.name]).filter((n): n is string => !!n)
  )
  // Map played matches to their official draw slot
  const r32PlayedByIdx = new Map<number, BracketMatch>()
  const r32PlayedOrphans: BracketMatch[] = []
  for (const m of r32Raw) {
    const idx = getR32DrawIndex(m.home?.name ?? '', m.away?.name ?? '', confirmedPos, confirmed3rd)
    if (idx >= 0) r32PlayedByIdx.set(idx, m)
    else r32PlayedOrphans.push(m)
  }

  // Walk R32_DRAW building pending pairs for unoccupied slots
  const r32PendingByIdx = new Map<number, BracketMatch>()
  const orphaned: string[] = []
  const processedPending = new Set<string>()

  for (let di = 0; di < R32_DRAW.length; di++) {
    if (r32PlayedByIdx.has(di)) continue
    const draw = R32_DRAW[di]
    const homeName = resolvePos(draw.home, confirmedPos, confirmed3rd)
    const awayName = resolvePos(draw.away, confirmedPos, confirmed3rd)
    const homeUnplayed = !!homeName && !playedInR32.has(homeName) && !processedPending.has(homeName)
    const awayUnplayed = !!awayName && !playedInR32.has(awayName) && !processedPending.has(awayName)
    if (homeUnplayed && awayUnplayed) {
      r32PendingByIdx.set(di, { home: toTeam(homeName!, allTeams), away: toTeam(awayName!, allTeams), homeGoals: null, awayGoals: null, winner: null })
      processedPending.add(homeName!); processedPending.add(awayName!)
    } else {
      if (homeUnplayed) { orphaned.push(homeName!); processedPending.add(homeName!) }
      if (awayUnplayed) { orphaned.push(awayName!); processedPending.add(awayName!) }
    }
  }
  const orphanPending: BracketMatch[] = []
  for (let i = 0; i + 1 < orphaned.length; i += 2)
    orphanPending.push({ home: toTeam(orphaned[i], allTeams), away: toTeam(orphaned[i + 1], allTeams), homeGoals: null, awayGoals: null, winner: null })

  // Assemble r32 in draw order so adjacent pairs feed the same R16 match
  const r32: BracketMatch[] = []
  for (let di = 0; di < 16; di++) {
    const m = r32PlayedByIdx.get(di) ?? r32PendingByIdx.get(di)
    if (m) r32.push(m)
  }
  r32.push(...r32PlayedOrphans, ...orphanPending)

  // Group played R32 matches by their fixed pair-group (floor(drawIndex/2) — R32_DRAW
  // pairs (2i, 2i+1) feed R16 slot i). Grouping by this fixed key — instead of pairing
  // by array position after sorting — guarantees a match with an unresolvable draw
  // index (idx === -1, e.g. a 3rd-place slot that hasn't/couldn't be confirmed) is simply
  // left unpaired instead of shifting every subsequent match's partner by one position.
  const r32ByPairGroup = new Map<number, BracketMatch[]>()
  for (const m of r32Raw) {
    const idx = getR32DrawIndex(m.home?.name ?? '', m.away?.name ?? '', confirmedPos, confirmed3rd)
    if (idx === -1) continue
    const group = Math.floor(idx / 2)
    if (!r32ByPairGroup.has(group)) r32ByPairGroup.set(group, [])
    r32ByPairGroup.get(group)!.push(m)
  }
  const sortedPairGroups = [...r32ByPairGroup.entries()].sort((a, b) => a[0] - b[0])

  // Finn en faktisk kamp i `actual` som består av nettopp disse to lagene (i valgfri rekkefølge)
  function findActual(actual: BracketMatch[], a: BracketTeam, b: BracketTeam): BracketMatch | undefined {
    return actual.find(m =>
      (m.home?.name === a.name && m.away?.name === b.name) ||
      (m.home?.name === b.name && m.away?.name === a.name)
    )
  }

  // R16: én kamp per par-gruppe (0-7), bygget fra de to R32-vinnerne i den gruppen.
  // Bruker faktisk spilt R16-kamp hvis den finnes, ellers en "pending" placeholder.
  const r16ByPairGroup = new Map<number, BracketMatch>()
  for (const [groupIdx, ms] of sortedPairGroups) {
    if (ms.length !== 2) continue
    const [a, b] = ms
    if (!a.winner || !b.winner) continue
    const actual = findActual(r16Actual, a.winner, b.winner)
    r16ByPairGroup.set(groupIdx, actual ?? { home: a.winner, away: b.winner, homeGoals: null, awayGoals: null, winner: null })
  }
  const r16FromGroups = [...r16ByPairGroup.values()]
  const resolvedR16Names = new Set(r16FromGroups.flatMap(m => [m.home?.name, m.away?.name]))
  const r16Orphans = r16Actual.filter(m => !resolvedR16Names.has(m.home?.name) && !resolvedR16Names.has(m.away?.name))
  const r16Sorted = [...r16FromGroups, ...r16Orphans]

  // QF: FIFAs bekreftede bracket krysser par-gruppene i R16_TO_QF_PAIRS-rekkefølgen
  // (se kommentar i bracket-draw.ts) — IKKE enkel nabo-paring (0+1, 2+3, ...).
  const qfByIndex = new Map<number, BracketMatch>()
  R16_TO_QF_PAIRS.forEach(([gi, gj], qfIdx) => {
    const a = r16ByPairGroup.get(gi)
    const b = r16ByPairGroup.get(gj)
    if (!a?.winner || !b?.winner) return
    const actual = findActual(qfActual, a.winner, b.winner)
    qfByIndex.set(qfIdx, actual ?? { home: a.winner, away: b.winner, homeGoals: null, awayGoals: null, winner: null })
  })
  const qfFromGroups = [...qfByIndex.values()]
  const resolvedQfNames = new Set(qfFromGroups.flatMap(m => [m.home?.name, m.away?.name]))
  const qfOrphans = qfActual.filter(m => !resolvedQfNames.has(m.home?.name) && !resolvedQfNames.has(m.away?.name))
  const qfSorted = [...qfFromGroups, ...qfOrphans]

  // SF: QF_TO_SF_PAIRS indekserer inn i R16_TO_QF_PAIRS-rekkefølgen (QF1-4) over.
  const sfByIndex = new Map<number, BracketMatch>()
  QF_TO_SF_PAIRS.forEach(([qi, qj], sfIdx) => {
    const a = qfByIndex.get(qi)
    const b = qfByIndex.get(qj)
    if (!a?.winner || !b?.winner) return
    const actual = findActual(sfActual, a.winner, b.winner)
    sfByIndex.set(sfIdx, actual ?? { home: a.winner, away: b.winner, homeGoals: null, awayGoals: null, winner: null })
  })
  const sfFromGroups = [...sfByIndex.values()]
  const resolvedSfNames = new Set(sfFromGroups.flatMap(m => [m.home?.name, m.away?.name]))
  const sfOrphans = sfActual.filter(m => !resolvedSfNames.has(m.home?.name) && !resolvedSfNames.has(m.away?.name))
  const sf = [...sfFromGroups, ...sfOrphans]

  const sfWinners = sf.map(m => m.winner)

  // Bronze: actual result or pending (SF losers)
  const bronzeActual = results.find(m => m.stage === 'bronze')
  let bronze: BracketMatch[]
  if (bronzeActual) {
    bronze = [toMatch(bronzeActual, allTeams)]
  } else {
    const sfLosers = sfActual
      .filter(m => m.winner !== null)
      .map(m => m.home?.name === m.winner?.name ? m.away : m.home)
      .filter((t): t is BracketTeam => t !== null)
    bronze = sfLosers.length === 2
      ? [{ home: sfLosers[0], away: sfLosers[1], homeGoals: null, awayGoals: null, winner: null }]
      : []
  }

  return {
    r32,
    r16: r16Sorted,
    qf: qfSorted,
    sf,
    bronze,
    final: [{
      home: finActual ? toTeam(finActual.home_team, allTeams) : (sfWinners[0] ?? null),
      away: finActual ? toTeam(finActual.away_team, allTeams) : (sfWinners[1] ?? null),
      homeGoals: finActual?.home_goals ?? null,
      awayGoals: finActual?.away_goals ?? null,
      winner: finActual ? toTeam(winnerOf(finActual), allTeams) : null,
    }],
  }
}

export function getKnockoutOpponent(
  teamName: string,
  advStage: string | null,
  results: MatchResult[],
  allTeams: { name: string; flag: string }[]
): BracketTeam | null {
  if (!advStage) return null

  const nextStage: Record<string, 'r32' | 'r16' | 'qf' | 'sf' | 'final'> = {
    group: 'r32', r32: 'r16', r16: 'qf', qf: 'sf', sf: 'final',
  }
  const next = nextStage[advStage]
  if (!next) return null

  // Delegate to buildBracket, which already resolves pending slots using
  // fixed bracket-chain pairing (draw-index pairs, not position-in-filtered-list —
  // that used to cause mispairings once some matches in a round were unplayed).
  const bracket = buildBracket(results, allTeams)
  const match = bracket[next].find(m => m.home?.name === teamName || m.away?.name === teamName)
  if (!match) return null
  return match.home?.name === teamName ? match.away : match.home
}
