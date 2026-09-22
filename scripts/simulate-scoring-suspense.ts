// Simulerer 1000 dart-VM-turneringer med 50 tilfeldige deltakere hver, for å teste
// om den enkle poengmodellen (1p/sett, 2p/avansement, 5p for turneringsseier, ×multiplikator)
// gir spenning gjennom hele turneringen eller om den blir avgjort for tidlig.
//
// Kjør: npx tsx scripts/simulate-scoring-suspense.ts

import { POTS } from '@/data/pots'
import { R1_MATCHES, getRound2Seed } from '@/lib/bracketProjection'

// ── Ny, enkel poengmodell (under vurdering — ikke koblet til appen ennå) ──
const SCORING = {
  perSetWon: 1,
  perAdvancement: 2,
  tournamentWinner: 5,
  underdogMultiplier: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 4 } as Record<number, number>,
}

const STAGES = ['r1', 'r2', 'r3', 'r4', 'qf', 'sf', 'final'] as const
type MatchStage = typeof STAGES[number]
const SETS_TARGET: Record<MatchStage, number> = { r1: 3, r2: 4, r3: 4, r4: 5, qf: 5, sf: 6, final: 7 }

const N_SIMS = 1000
const N_PARTICIPANTS = 50
const STRENGTH_SPREAD = 15 // lavere = mer overraskelser, høyere = mer forutsigbart

interface MatchResult { player1: string; player2: string; sets1: number; sets2: number; stage: MatchStage; winner: string }
interface Pick { player_name: string; pot_number: number }

const ALL_PLAYERS = POTS.flatMap((p) => p.players)
const SEEDED = ALL_PLAYERS.filter((p) => p.seedNumber != null).sort((a, b) => a.seedNumber! - b.seedNumber!)

// Rangeringstall for alle 96 braketturneringsplasser (lavere = sterkere). Ekte spillere bruker
// pdcRanking; plasseringsspillere ("Kvalifisert spiller N") får et fast, svakt tall.
const RANK: Record<string, number> = {}
for (const p of ALL_PLAYERS) RANK[p.name] = p.pdcRanking
for (const [a, b] of R1_MATCHES) {
  if (RANK[a] == null) RANK[a] = 70
  if (RANK[b] == null) RANK[b] = 75
}

function winProb(rankA: number, rankB: number): number {
  return 1 / (1 + Math.pow(10, (rankA - rankB) / STRENGTH_SPREAD))
}

function playMatch(a: string, b: string, stage: MatchStage, rand: () => number): MatchResult {
  const pA = winProb(RANK[a] ?? 80, RANK[b] ?? 80)
  const aWins = rand() < pA
  const target = SETS_TARGET[stage]
  const loserSets = Math.floor(rand() * target) // 0..target-1
  const [sets1, sets2] = aWins ? [target, loserSets] : [loserSets, target]
  return { player1: a, player2: b, sets1, sets2, stage, winner: aWins ? a : b }
}

// Enkel deterministisk-per-kjøring PRNG (mulberry32) seedet ulikt for hver simulering.
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function simulateTournament(rand: () => number): MatchResult[] {
  const all: MatchResult[] = []

  // Runde 1 (32 kamper blant useedede + plasseringsspillere)
  const r1 = R1_MATCHES.map(([a, b]) => playMatch(a, b, 'r1', rand))
  all.push(...r1)

  // Runde 2: 32 seedede (bye) + 32 runde 1-vinnere, paret via seedingen.
  const r2Pairs: [string, string][] = r1.map((m, i) => [m.winner, getRound2Seed(i)!])
  const r2 = r2Pairs.map(([a, b]) => playMatch(a, b, 'r2', rand))
  all.push(...r2)

  // Runde 3–Finale: rent utslagsspill, nabo-par av forrige rundes vinnere.
  let prevWinners = r2.map((m) => m.winner)
  const laterStages: MatchStage[] = ['r3', 'r4', 'qf', 'sf', 'final']
  for (const stage of laterStages) {
    const matches: MatchResult[] = []
    for (let i = 0; i < prevWinners.length; i += 2) {
      matches.push(playMatch(prevWinners[i], prevWinners[i + 1], stage, rand))
    }
    all.push(...matches)
    prevWinners = matches.map((m) => m.winner)
  }

  return all
}

function randomPicks(rand: () => number): Pick[] {
  return POTS.map((pot) => ({
    player_name: pot.players[Math.floor(rand() * pot.players.length)].name,
    pot_number: pot.potNumber,
  }))
}

function calcPoints(picks: Pick[], matches: MatchResult[]): number {
  let total = 0
  for (const pick of picks) {
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
    const mult = SCORING.underdogMultiplier[pick.pot_number] ?? 1
    total += (setPts + wins * SCORING.perAdvancement + (wonFinal ? SCORING.tournamentWinner : 0)) * mult
  }
  return total
}

// ── Kjør simuleringene ──
const lockInRounds: number[] = []      // hvilken runde (1-indeksert, 7=finale) #1 ble stående resten av turneringen
const leadChangeCounts: number[] = []  // antall ganger en ny deltaker tok #1-plassen
const finalGapPct: number[] = []       // poenggap #1→#2 som andel av #1 sin sluttsum, etter finalen
const winnerRankAtR3: number[] = []    // hvilken plass til slutt-vinneren lå på etter runde 3 (r4-kamper spilt)

for (let sim = 0; sim < N_SIMS; sim++) {
  const rand = mulberry32(1000 + sim * 97)
  const participants = Array.from({ length: N_PARTICIPANTS }, (_, i) => ({ id: i, picks: randomPicks(rand) }))
  const matches = simulateTournament(rand)

  // Poengsum kumulativt etter hver runde (r1..final = 7 punkter i tid)
  let cumulative: MatchResult[] = []
  const rankingsPerRound: number[][] = [] // rankingsPerRound[roundIdx] = deltaker-id-er sortert best→dårligst
  for (const stage of STAGES) {
    cumulative = cumulative.concat(matches.filter((m) => m.stage === stage))
    const scored = participants
      .map((p) => ({ id: p.id, pts: calcPoints(p.picks, cumulative) }))
      .sort((a, b) => b.pts - a.pts)
    rankingsPerRound.push(scored.map((s) => s.id))
  }

  // Lock-in: siste runde der #1 byttet
  let lastLeader = rankingsPerRound[0][0]
  let lockInRound = 1
  let leadChanges = 0
  for (let r = 1; r < rankingsPerRound.length; r++) {
    const leader = rankingsPerRound[r][0]
    if (leader !== lastLeader) {
      leadChanges++
      lockInRound = r + 1
      lastLeader = leader
    }
  }
  lockInRounds.push(lockInRound)
  leadChangeCounts.push(leadChanges)

  // Gap #1 → #2 ved finalen
  const finalScored = participants
    .map((p) => ({ id: p.id, pts: calcPoints(p.picks, matches) }))
    .sort((a, b) => b.pts - a.pts)
  const gapPct = finalScored[0].pts > 0 ? ((finalScored[0].pts - finalScored[1].pts) / finalScored[0].pts) * 100 : 0
  finalGapPct.push(gapPct)

  // Hvor lå slutt-vinneren (deltaker) etter runde 4 (indeks 3 av 7)?
  const champion = finalScored[0].id
  const rankAtR4 = rankingsPerRound[3].indexOf(champion) + 1
  winnerRankAtR3.push(rankAtR4)
}

function avg(arr: number[]) { return arr.reduce((a, b) => a + b, 0) / arr.length }
function median(arr: number[]) { const s = [...arr].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] }
function pct(arr: number[], pred: (n: number) => boolean) { return (arr.filter(pred).length / arr.length) * 100 }

console.log(`\n=== ${N_SIMS} simuleringer × ${N_PARTICIPANTS} deltakere — enkel poengmodell ===\n`)
console.log(`Poengmodell: 1p/sett vunnet, 2p/avansement (kampseier), 5p bonus for turneringsseier, × pott-multiplikator (1/1/2/2/3/4)\n`)

console.log(`Lock-in-runde (siste gang #1-plassen byttet eier), 1=r1 ... 7=finale:`)
console.log(`  Snitt: ${avg(lockInRounds).toFixed(2)}   Median: ${median(lockInRounds)}`)
console.log(`  Andel avgjort før semifinale (runde ≤5): ${pct(lockInRounds, (n) => n <= 5).toFixed(1)}%`)
console.log(`  Andel avgjort i finalerunden (runde 7):    ${pct(lockInRounds, (n) => n === 7).toFixed(1)}%\n`)

console.log(`Antall lederbytter (#1-plassen skifter hender) gjennom turneringen:`)
console.log(`  Snitt: ${avg(leadChangeCounts).toFixed(2)}   Median: ${median(leadChangeCounts)}\n`)

console.log(`Poenggap #1→#2 ved turneringsslutt (andel av #1 sin sum):`)
console.log(`  Snitt: ${avg(finalGapPct).toFixed(1)}%   Median: ${median(finalGapPct).toFixed(1)}%`)
console.log(`  Andel med gap under 5% (knivskarpt):  ${pct(finalGapPct, (n) => n < 5).toFixed(1)}%`)
console.log(`  Andel med gap over 30% (klart avgjort): ${pct(finalGapPct, (n) => n > 30).toFixed(1)}%\n`)

console.log(`Hvor lå den endelige vinneren (deltakeren) på tabellen etter runde 4 (8 spillere igjen)?`)
console.log(`  Snitt plassering: ${avg(winnerRankAtR3).toFixed(1)} av ${N_PARTICIPANTS}`)
console.log(`  Andel som lå i topp 3 allerede da: ${pct(winnerRankAtR3, (n) => n <= 3).toFixed(1)}%`)
console.log(`  Andel som lå utenfor topp 10:      ${pct(winnerRankAtR3, (n) => n > 10).toFixed(1)}%\n`)
