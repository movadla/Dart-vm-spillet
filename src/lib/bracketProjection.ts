import { POTS } from '@/data/pots'
import { furthestStageReached, isPlayerChampion, isPlayerEliminated, type MatchResult } from './scoring'

// MIDLERTIDIG (2026-09-27): PDC World Grand Prix 2026, ikke VM — se
// src/data/pots.ts og src/config/tournament.ts for kontekst.
//
// I motsetning til VM-oppsettet er HELE feltet her kjent og navngitt (32
// spillere, ingen plasseringsspillere) OG selve runde 1-trekningen er en
// ekte, bekreftet trekning (kryssjekket mot Wikipedia/dartsnews/ESPN/Yahoo
// 2026-09-27) — ikke et algoritmisk eksempel. `isFiller` finnes fortsatt i
// typene under (UI-et i resten av appen bruker det til å skille ekte
// motstandere fra plasseringsspillere), men er alltid `false` her siden alle
// 32 er ekte, navngitte spillere.
//
// Selve trekningen er offentliggjort seed-for-seed (seed N møter en navngitt
// kvalifisert spiller), men PDC/kildene oppga ikke det fysiske brakett-treet
// (hvilken «kvart» hver seed sitter i utover at topp-seedene holdes fra
// hverandre til finalen, som er standard praksis). Vi bruker derfor samme
// standard turneringsseeding som resten av appen (seedOrder — sprer de beste
// seedene maksimalt utover braketten) til å plassere seed 1–16, og setter
// inn den BEKREFTEDE runde 1-motstanderen i nabo-slotet — så runde 1 er 100 %
// ekte, mens runde 2+ er beste estimat inntil braketten faktisk spilles ut.

const BRACKET_SIZE = 32
const ALL_PLAYERS = POTS.flatMap((p) => p.players)

/** Standard turneringsseeding — sprer de beste rangeringene maksimalt utover braketten (1 og 2 møtes først i finalen). */
function seedOrder(n: number): number[] {
  if (n === 1) return [1]
  const prev = seedOrder(n / 2)
  const out: number[] = []
  for (const s of prev) {
    out.push(s)
    out.push(n + 1 - s)
  }
  return out
}

const SEED_NAME_BY_NUMBER = new Map(ALL_PLAYERS.filter((p) => p.seedNumber != null).map((p) => [p.seedNumber as number, p.name]))

// Bekreftet runde 1-trekning (seed → navngitt kvalifisert motstander).
const R1_OPPONENT_BY_SEED: Record<number, string> = {
  1: 'Luke Woodhouse',
  2: 'Dave Chisnall',
  3: 'Dirk van Duijvenbode',
  4: 'Sebastian Białecki',
  5: 'Krzysztof Ratajski',
  6: 'Joe Cullen',
  7: 'Niels Zonneveld',
  8: 'Niko Springer',
  9: 'Ryan Joyce',
  10: 'Damon Heta',
  11: 'Andrew Gilding',
  12: 'Rob Cross',
  13: 'Cameron Menzies',
  14: "William O'Connor",
  15: 'Jermaine Wattimena',
  16: 'Kevin Doets',
}

// Bracket-slot (0-indeksert) → spillernavn. Bygget fra standard
// turneringsseeding (seedOrder) for slotplassering, med den bekreftede
// runde 1-motstanderen satt inn i nabo-slotet til hver seed.
const SEED_SLOTS = seedOrder(BRACKET_SIZE)
const BRACKET_SLOTS: string[] = new Array(BRACKET_SIZE)
for (let pairIdx = 0; pairIdx < BRACKET_SIZE / 2; pairIdx++) {
  const a = SEED_SLOTS[pairIdx * 2]
  const b = SEED_SLOTS[pairIdx * 2 + 1]
  const seedRank = a <= 16 ? a : b
  const seedSlot = a <= 16 ? pairIdx * 2 : pairIdx * 2 + 1
  const oppSlot = a <= 16 ? pairIdx * 2 + 1 : pairIdx * 2
  BRACKET_SLOTS[seedSlot] = SEED_NAME_BY_NUMBER.get(seedRank) ?? `Seed ${seedRank}`
  BRACKET_SLOTS[oppSlot] = R1_OPPONENT_BY_SEED[seedRank]
}

// 16 runde 1-kamper: [spillerA, spillerB][] — ingen bye, alle 32 spiller runde 1.
export const R1_MATCHES: [string, string][] = Array.from({ length: BRACKET_SIZE / 2 }, (_, i) => [
  BRACKET_SLOTS[i * 2],
  BRACKET_SLOTS[i * 2 + 1],
])

const NAME_TO_MATCH_INDEX = new Map<string, number>()
R1_MATCHES.forEach(([a, b], i) => {
  NAME_TO_MATCH_INDEX.set(a, i)
  NAME_TO_MATCH_INDEX.set(b, i)
})

// Ingen plasseringsspillere i World Grand Prix-feltet — hele feltet er kjent og navngitt.
function isFiller(_name: string): boolean {
  return false
}

export interface DrawSlotInfo { name: string; isFiller: boolean }

export interface FirstMatchInfo {
  opponent: DrawSlotInfo
  /** Den andre runde 1-kampen hvis vinner venter i runde 2 (potensielle runde 2-motstandere). */
  round2Pair: [DrawSlotInfo, DrawSlotInfo]
}

/** Hvem denne spilleren møter i runde 1, og hvilket par som venter i runde 2. */
export function getFirstMatchInfo(playerName: string): FirstMatchInfo | null {
  const idx = NAME_TO_MATCH_INDEX.get(playerName)
  if (idx == null) return null
  const [a, b] = R1_MATCHES[idx]
  const opponentName = a === playerName ? b : a
  const partnerIdx = idx % 2 === 0 ? idx + 1 : idx - 1
  const [pa, pb] = R1_MATCHES[partnerIdx]
  return {
    opponent: { name: opponentName, isFiller: isFiller(opponentName) },
    round2Pair: [
      { name: pa, isFiller: isFiller(pa) },
      { name: pb, isFiller: isFiller(pb) },
    ],
  }
}

/** «(N)» for seedede spillere, ellers undefined — brukes i bracket-visning, samme konvensjon som PDC selv bruker. */
export function getSeedLabel(playerName: string): string | undefined {
  const seed = ALL_PLAYERS.find((p) => p.name === playerName)?.seedNumber
  return seed != null ? `(${seed})` : undefined
}

/**
 * De andre seedede spillerne i samme del av braketten (gruppe på 8
 * sammenhengende bracket-slots — én av de 4 «kvartene» i en 32-brakett) —
 * de du potensielt kan møte lenger ut i turneringen dersom alle vinner fram.
 */
export function getBracketSection(playerName: string): string[] {
  const idx = NAME_TO_MATCH_INDEX.get(playerName)
  if (idx == null) return []
  const slot = BRACKET_SLOTS.indexOf(playerName)
  const sectionStart = Math.floor(slot / 8) * 8
  const sectionSlots = Array.from({ length: 8 }, (_, i) => sectionStart + i).filter((s) => s !== slot)
  return sectionSlots
    .map((s) => BRACKET_SLOTS[s])
    .filter((name) => getSeedLabel(name) != null)
}

const RANKING_BY_NAME = new Map(ALL_PLAYERS.map((p) => [p.name, p.pdcRanking]))
// Runde k (1-basert) i en 32-brakett → stage-nøkkel i STAGE_ORDER.
const ROUND_STAGES = ['r1', 'r2', 'qf', 'sf', 'final'] as const

export interface PathStep {
  stage: (typeof ROUND_STAGES)[number]
  /** Best rangerte spiller som kan bli motstander i denne runden hvis alle favoritter vinner. */
  opponent: string
  pdcRanking: number
}

/**
 * «Potensiell vei til finalen»: for hver runde, den best rangerte spilleren
 * som kan dukke opp som motstander dersom alle favorittene vinner sine kamper —
 * dvs. beste rangering i den motsatte halvdelen av spillerens brakett-blokk
 * på det nivået. Bygger på seedplasseringen (runde 1 er ekte trekning, runde
 * 2+ er beste estimat) inntil braketten faktisk er avgjort — merk det i UI.
 */
export function getPathToFinal(playerName: string): PathStep[] {
  const slot = BRACKET_SLOTS.indexOf(playerName)
  if (slot < 0) return []
  const steps: PathStep[] = []
  for (let k = 1; k <= ROUND_STAGES.length; k++) {
    const blockSize = 2 ** k
    const half = blockSize / 2
    const blockStart = Math.floor(slot / blockSize) * blockSize
    const inUpperHalf = slot < blockStart + half
    const oppStart = inUpperHalf ? blockStart + half : blockStart
    let best: PathStep | null = null
    for (let s = oppStart; s < oppStart + half; s++) {
      const name = BRACKET_SLOTS[s]
      const ranking = RANKING_BY_NAME.get(name)
      if (ranking == null) continue
      if (!best || ranking < best.pdcRanking) best = { stage: ROUND_STAGES[k - 1], opponent: name, pdcRanking: ranking }
    }
    if (best) steps.push(best)
  }
  return steps
}

export interface DrawSection {
  /** 1-basert seksjonsnummer, hver på 8 spillere / 4 runde 1-kamper (én av de 4 «kvartene»). */
  index: number
  /** Beste seed i seksjonen — brukes som overskrift («Seksjon 1 · seed 1»). */
  topSeed: string
  matches: [string, string][]
}

/** Hele runde 1-trekningen delt i 4 seksjoner à 4 kamper (kvarter), for brakett-pop-upen. */
export function getDrawSections(): DrawSection[] {
  const MATCHES_PER_SECTION = 4
  return Array.from({ length: R1_MATCHES.length / MATCHES_PER_SECTION }, (_, i) => {
    const matches = R1_MATCHES.slice(i * MATCHES_PER_SECTION, i * MATCHES_PER_SECTION + MATCHES_PER_SECTION)
    const names = matches.flat()
    const topSeed = names.reduce((best, n) => {
      const r = RANKING_BY_NAME.get(n)
      const b = RANKING_BY_NAME.get(best)
      return r != null && (b == null || r < b) ? n : best
    }, names[0])
    return { index: i + 1, topSeed, matches }
  })
}

export function isFillerName(name: string): boolean {
  return isFiller(name)
}

// ── Neste kamp ───────────────────────────────────────────────────────────
//
// BRACKET_SLOTS definerer hele braketten som et fullstendig utslags-tre, ikke
// bare runde 1: runde k sin kamp nr. i er mellom vinneren av de to runde
// (k−1)-kampene som "feeder" den. Det betyr at vi kan slå opp den EKTE
// motstanderen (ikke bare et eksempel) så snart resultatet for hele den
// andre halvparten av braketten er registrert i match_results — helt uten en
// egen "hvem møter hvem"-tabell. `resolveWinner` går rekursivt ned treet og
// stopper med `null` i det den treffer en runde som ikke er avgjort ennå.

/** Vinneren av bracket-blokken [start, end) på runde `stageIdx` (0 = runde 1-slot), eller
 * `null` hvis den blokken ikke er avgjort i `matches` ennå. */
function resolveWinner(start: number, end: number, stageIdx: number, matches: MatchResult[]): string | null {
  if (stageIdx === 0) return BRACKET_SLOTS[start]
  const half = (end - start) / 2
  const left = resolveWinner(start, start + half, stageIdx - 1, matches)
  const right = resolveWinner(start + half, end, stageIdx - 1, matches)
  if (left == null || right == null) return null
  const stage = ROUND_STAGES[stageIdx - 1]
  const played = matches.find((m) =>
    (m.stage ?? 'r1') === stage && m.winner != null &&
    ((m.player1 === left && m.player2 === right) || (m.player1 === right && m.player2 === left)))
  return played?.winner ?? null
}

export interface BracketSlot {
  /** Kjent motstander (runde 1: alltid kjent — det er selve trekningen). `null` = venter på at forrige runde avgjøres. */
  player1: string | null
  player2: string | null
  /** Den faktisk registrerte kampen for dette bracket-slotet, hvis begge sider er kjent og kampen er spilt. */
  match: MatchResult | null
}

/**
 * Alle bracket-slotene for én runde (16 for runde 1, 8 for runde 2, … 1 for finalen) —
 * navnene kjent så langt braketten er avgjort, uansett hvor mange av dem som faktisk har
 * et registrert resultat i `matches` ennå. Brukt av «Kamper»-fanen i turneringsguiden til å
 * plassere hvert kort på riktig sted i selve turneringstreet (så vinneren alltid havner
 * midt mellom de to rundene som feeder den), i stedet for bare å liste opp de kampene som
 * tilfeldigvis er spilt så langt.
 */
export function getBracketRound(stage: (typeof ROUND_STAGES)[number], matches: MatchResult[]): BracketSlot[] {
  const stageIdx = ROUND_STAGES.indexOf(stage)
  const blockSize = 2 ** (stageIdx + 1)
  const half = blockSize / 2
  const count = BRACKET_SIZE / blockSize
  return Array.from({ length: count }, (_, i) => {
    const start = i * blockSize
    const player1 = resolveWinner(start, start + half, stageIdx, matches)
    const player2 = resolveWinner(start + half, start + blockSize, stageIdx, matches)
    const match = player1 != null && player2 != null
      ? matches.find((mt) =>
          (mt.stage ?? 'r1') === stage &&
          ((mt.player1 === player1 && mt.player2 === player2) || (mt.player1 === player2 && mt.player2 === player1)))
        ?? null
      : null
    return { player1, player2, match }
  })
}

export interface NextMatchInfo {
  stage: (typeof ROUND_STAGES)[number]
  /** null = ikke avgjort ennå OG ingen navngitt eksempel-favoritt i den blokken. */
  opponent: string | null
  isFiller: boolean
  /** true = ekte, avgjort motstander. false = beste eksempel-gjetning (se getPathToFinal) inntil runden er avgjort. */
  confirmed: boolean
}

/**
 * Spillerens neste kamp: ekte og avgjort så langt braketten faktisk er spilt
 * (via `resolveWinner`), ellers samme "beste favoritt"-eksempel som
 * `getPathToFinal` bruker — helt til den runden faktisk er avgjort. `null` =
 * ingen neste kamp (slått ut, allerede vunnet finalen, eller ukjent spiller).
 */
export function getNextMatch(playerName: string, matches: MatchResult[]): NextMatchInfo | null {
  const slot = BRACKET_SLOTS.indexOf(playerName)
  if (slot < 0) return null
  if (isPlayerEliminated(playerName, matches) || isPlayerChampion(playerName, matches)) return null

  const furthest = furthestStageReached(playerName, matches, ROUND_STAGES)
  const nextIdx = furthest ? ROUND_STAGES.indexOf(furthest as (typeof ROUND_STAGES)[number]) + 1 : 0
  if (nextIdx <= 0 && furthest && ROUND_STAGES.indexOf(furthest as (typeof ROUND_STAGES)[number]) < 0) return null
  if (nextIdx >= ROUND_STAGES.length) return null
  const nextStage = ROUND_STAGES[nextIdx]

  // Runde 1: motstanderen er alltid den faste trekningen (den er allerede "fasit" i appen).
  if (nextIdx === 0) {
    const info = getFirstMatchInfo(playerName)
    if (!info) return null
    return { stage: nextStage, opponent: info.opponent.name, isFiller: info.opponent.isFiller, confirmed: true }
  }

  const blockSize = 2 ** (nextIdx + 1)
  const half = blockSize / 2
  const blockStart = Math.floor(slot / blockSize) * blockSize
  const inUpperHalf = slot < blockStart + half
  const oppStart = inUpperHalf ? blockStart + half : blockStart

  const resolved = resolveWinner(oppStart, oppStart + half, nextIdx, matches)
  if (resolved != null) {
    return { stage: nextStage, opponent: resolved, isFiller: isFiller(resolved), confirmed: true }
  }

  const guess = getPathToFinal(playerName).find((s) => s.stage === nextStage)
  return guess
    ? { stage: nextStage, opponent: guess.opponent, isFiller: false, confirmed: false }
    : { stage: nextStage, opponent: null, isFiller: false, confirmed: false }
}
