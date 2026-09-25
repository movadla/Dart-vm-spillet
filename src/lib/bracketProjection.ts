import { POTS } from '@/data/pots'
import { furthestStageReached, isPlayerChampion, isPlayerEliminated, type MatchResult } from './scoring'

// Genererer en illustrativ, stabil eksempel-trekning for hele 128-spiller-braketten
// (rent utslagsspill, ingen walkover/bye — alle spiller runde 1) — PDC har ikke publisert
// den faktiske trekningen ennå (kommer normalt medio november). Vi har kun 64 navngitte
// spillere i datasettet, så resten av feltet fylles med tydelig merkede plasseringsspillere
// ("Kvalifisert spiller N") som ikke er valgbare.
//
// Trekningen er deterministisk (samme resultat hver gang appen bygges) — ikke reell
// tilfeldig hver renders, og skal erstattes med ekte data når trekningen er kjent.

const BRACKET_SIZE = 128
const FILLER_COUNT = BRACKET_SIZE - POTS.flatMap((p) => p.players).length // 64
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

// Alle 128 "rangeringsplasser": de 64 navngitte spillerne (etter pdcRanking) + 64
// plasseringsspillere som fortsetter rangeringsrekken.
const RANKED_FIELD: string[] = [
  ...ALL_PLAYERS.slice().sort((a, b) => a.pdcRanking - b.pdcRanking).map((p) => p.name),
  ...Array.from({ length: FILLER_COUNT }, (_, i) => `Kvalifisert spiller ${i + 1}`),
]

// Bracket-slot (0-indeksert) → spillernavn, plassert via standard turneringsseeding.
const BRACKET_SLOTS: string[] = seedOrder(BRACKET_SIZE).map((rank) => RANKED_FIELD[rank - 1])

// 64 runde 1-kamper: [spillerA, spillerB][] — ingen bye, alle 128 spiller runde 1.
export const R1_MATCHES: [string, string][] = Array.from({ length: BRACKET_SIZE / 2 }, (_, i) => [
  BRACKET_SLOTS[i * 2],
  BRACKET_SLOTS[i * 2 + 1],
])

const NAME_TO_MATCH_INDEX = new Map<string, number>()
R1_MATCHES.forEach(([a, b], i) => {
  NAME_TO_MATCH_INDEX.set(a, i)
  NAME_TO_MATCH_INDEX.set(b, i)
})

function isFiller(name: string): boolean {
  return name.startsWith('Kvalifisert spiller')
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
 * De 7 andre seedede spillerne i samme "kvartal" av braketten (gruppe på 8 sammenhengende
 * bracket-slots) — de du potensielt kan møte lenger ut i turneringen dersom alle vinner fram.
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
// Runde k (1-basert) i en 128-brakett → stage-nøkkel i STAGE_ORDER.
const ROUND_STAGES = ['r1', 'r2', 'r3', 'r4', 'qf', 'sf', 'final'] as const

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
 * på det nivået. Runder der beste mulige motstander er en plasseringsspiller
 * (uten rangering) utelates. Bygger på eksempel-trekningen inntil den ekte
 * legges inn — merk det i UI.
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
  /** 1-basert seksjonsnummer (1–8), hver på 16 spillere / 8 runde 1-kamper. */
  index: number
  /** Beste seed i seksjonen — brukes som overskrift («Seksjon 1 · seed 1»). */
  topSeed: string
  matches: [string, string][]
}

/** Hele runde 1-trekningen delt i 8 seksjoner à 8 kamper, for brakett-pop-upen. */
export function getDrawSections(): DrawSection[] {
  return Array.from({ length: 8 }, (_, i) => {
    const matches = R1_MATCHES.slice(i * 8, i * 8 + 8)
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

export interface NextMatchInfo {
  stage: (typeof ROUND_STAGES)[number]
  /** null = ikke avgjort ennå OG ingen navngitt eksempel-favoritt i den blokken (rent plasseringsspiller-felt). */
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
