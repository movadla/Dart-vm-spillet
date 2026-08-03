/**
 * Kjør: npx tsx scripts/analyze-scoring.ts
 *
 * To forbedringer i simuleringen:
 *   1. Odds-basert kamp-sannsynlighet: Argentina slår Congo DR ~97%, ikke 89%
 *   2. Tester ulike multiplikator-sett for Pot 5–8
 */

import { POTS } from '../src/data/pots'
import { VM_GROUPS } from '../src/data/vm-groups'

const N_PLAYERS = 10
const N_SIMS    = 200

// ── Seeded random ─────────────────────────────────────────────────────────────
function makePrng(seed: number) {
  let s = seed >>> 0
  const rand  = () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296 }
  const ri    = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1))
  const shuffle = <T>(a: T[]) => {
    const b = [...a]
    for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] }
    return b
  }
  return { rand, ri, shuffle }
}

// ── Odds-basert lagstyrke ─────────────────────────────────────────────────────
// Strength = 1/odds (Argentina=0.2, Iran=0.005, Congo=0.0005)
// Vi bruker sqrt for å dempe ekstreme forskjeller litt.
// P(A vinner kamp | ikke uavgjort) = sqrt(str_A) / (sqrt(str_A) + sqrt(str_B))
// Argentina vs Iran: sqrt(0.2)/sqrt(0.005) → 86% seier-sjanse for Argentina
// Argentina vs Congo: 97% seier-sjanse
// Iran vs Saudi-Arabia: 57% (jevne odds)
const teamStrength = new Map<string, number>()
const teamToPot    = new Map<string, number>()
for (const p of POTS) {
  for (const t of p.teams) {
    teamStrength.set(t.name, 1 / parseFloat(t.odds))
    teamToPot.set(t.name, p.potNumber)
  }
}
const allTeamNames = POTS.flatMap(p => p.teams.map(t => t.name))

// ── Kampresultat (odds-basert, realistisk) ────────────────────────────────────
function simMatch(home: string, away: string, ri: (a:number,b:number)=>number, rand: ()=>number) {
  const sH = Math.sqrt(teamStrength.get(home) ?? 0.01)
  const sA = Math.sqrt(teamStrength.get(away) ?? 0.01)
  const pHome = sH / (sH + sA)   // sannsynlighet for hjemmelaget GITT ingen uavgjort
  let hg: number, ag: number
  // Uavgjort: 22% sjanse — litt lavere for svært ujevne kamper
  const equalityFactor = 1 - Math.abs(pHome - 0.5) * 0.6  // 1.0 når jevnt, lavere ved mismatch
  if (rand() < 0.22 * equalityFactor) {
    hg = ag = ri(0, 2)
  } else if (rand() < pHome) {
    hg = ri(1, 3); ag = ri(0, 1)
  } else {
    hg = ri(0, 1); ag = ri(1, 3)
  }
  return { hg, ag }
}

// ── Poengsystem-konfigurasjoner (base: 4p seier, 1p uavgjort, 1p mål) ────────
interface Config {
  label: string
  mult: Record<number, number>
}
const ADV = { group:5, r32:8, r16:12, qf:17, sf:24, final:0, winner:32 }

const CONFIGS: Config[] = [
  {
    label: 'A — Gjeldende    (Pot5-6: ×1.4  Pot7-8: ×2.0)',
    mult: { 1:1.0, 2:1.0, 3:1.0, 4:1.0, 5:1.4, 6:1.4, 7:2.0, 8:2.0 },
  },
  {
    label: 'B — Lett redusert (Pot5-6: ×1.3  Pot7-8: ×1.6)',
    mult: { 1:1.0, 2:1.0, 3:1.0, 4:1.0, 5:1.3, 6:1.3, 7:1.6, 8:1.6 },
  },
  {
    label: 'C — Flat nedre   (Pot5-8: ×1.4  ingen forskjell innad)',
    mult: { 1:1.0, 2:1.0, 3:1.0, 4:1.0, 5:1.4, 6:1.4, 7:1.4, 8:1.4 },
  },
]

// ── Turneringssimulering ──────────────────────────────────────────────────────
const STAGE_ORDER = ['group','r32','r16','qf','sf','final','winner'] as const
type Stage = typeof STAGE_ORDER[number]
const CHECKPOINTS: Stage[] = ['group','r32','r16','qf','sf','final']

interface Match { home: string; away: string; hg: number; ag: number; stage: Stage }

function runTournament(seed: number): { matches: Match[]; advMap: Map<string,Stage>; champion: string } {
  const { rand, ri, shuffle } = makePrng(seed)
  const matches: Match[] = []
  const advMap = new Map<string, Stage>()

  interface Entry { team: string; pts: number; gd: number; gf: number }

  for (const g of VM_GROUPS) {
    const st = new Map(g.teams.map(t => [t, { team:t, pts:0, gd:0, gf:0 }]))
    for (let i = 0; i < g.teams.length; i++) {
      for (let j = i+1; j < g.teams.length; j++) {
        const { hg, ag } = simMatch(g.teams[i], g.teams[j], ri, rand)
        matches.push({ home:g.teams[i], away:g.teams[j], hg, ag, stage:'group' })
        const h = st.get(g.teams[i])!; const a = st.get(g.teams[j])!
        h.gf += hg; h.gd += hg-ag; a.gf += ag; a.gd += ag-hg
        if (hg > ag) h.pts += 3
        else if (hg === ag) { h.pts += 1; a.pts += 1 }
        else a.pts += 3
      }
    }
    const sorted = [...st.values()].sort((a,b) => b.pts-a.pts || b.gd-a.gd || b.gf-a.gf)
    advMap.set(sorted[0].team, 'group'); advMap.set(sorted[1].team, 'group')
    // Lagre 3.-plasserte for best-of-thirds
    ;(sorted[2] as any)._rank3 = true
    ;(sorted[2] as any)._rank3pts = sorted[2].pts
    // NB: vi lagrer thirds separat under
  }

  // Gjør om til enklere: top2 fra hver gruppe + 8 beste thirds
  const byGroup = new Map<string, Entry[]>()
  const allE: Entry[] = []
  for (const g of VM_GROUPS) {
    // re-beregn standings
    const st = new Map(g.teams.map(t => [t, { team:t, pts:0, gd:0, gf:0 }]))
    for (const m of matches.filter(m => m.stage === 'group')) {
      if (!g.teams.includes(m.home)) continue
      const h = st.get(m.home)!; const a = st.get(m.away)!
      h.gf += m.hg; h.gd += m.hg-m.ag; a.gf += m.ag; a.gd += m.ag-m.hg
      if (m.hg > m.ag) h.pts += 3
      else if (m.hg === m.ag) { h.pts += 1; a.pts += 1 }
      else a.pts += 3
    }
    const sorted = [...st.values()].sort((a,b) => b.pts-a.pts || b.gd-a.gd || b.gf-a.gf)
    byGroup.set(g.letter, sorted)
    allE.push(...sorted)
  }
  advMap.clear()
  const thirds2: Entry[] = []
  for (const [, e] of byGroup) {
    advMap.set(e[0].team, 'group'); advMap.set(e[1].team, 'group')
    thirds2.push(e[2])
  }
  thirds2.sort((a,b) => b.pts-a.pts || b.gd-a.gd || b.gf-a.gf)
  thirds2.slice(0,8).forEach(e => advMap.set(e.team, 'group'))

  let bracket = shuffle([...advMap.keys()])
  for (const stage of ['r32','r16','qf','sf'] as const) {
    const winners: string[] = []
    for (let i = 0; i < bracket.length; i += 2) {
      const { hg, ag } = simMatch(bracket[i], bracket[i+1], ri, rand)
      matches.push({ home:bracket[i], away:bracket[i+1], hg, ag, stage })
      const w = hg >= ag ? bracket[i] : bracket[i+1]
      winners.push(w); advMap.set(w, stage)
    }
    bracket = shuffle(winners)
  }
  const { hg, ag } = simMatch(bracket[0], bracket[1], ri, rand)
  matches.push({ home:bracket[0], away:bracket[1], hg, ag, stage:'final' })
  const champion = hg >= ag ? bracket[0] : bracket[1]
  const finalist = hg >= ag ? bracket[1] : bracket[0]
  advMap.set(champion, 'winner'); advMap.set(finalist, 'final')

  return { matches, advMap, champion }
}

// ── Poengberegning ────────────────────────────────────────────────────────────
function calcScores(
  picks: string[][], matches: Match[], advMap: Map<string,Stage>,
  mult: Record<number,number>, checkpoint: Stage,
): number[] {
  const ci = STAGE_ORDER.indexOf(checkpoint)
  const included = new Set(STAGE_ORDER.slice(0, ci+1))
  const mPts = new Map<string,number>()
  for (const m of matches) {
    if (!included.has(m.stage)) continue
    for (const [team, isHome] of [[m.home,true],[m.away,false]] as [string,boolean][]) {
      const g = isHome ? m.hg : m.ag; const c = isHome ? m.ag : m.hg
      mPts.set(team, (mPts.get(team)??0) + g + (g>c ? 4 : g===c ? 1 : 0))
    }
  }
  const advBonus = (fs: Stage | undefined) => {
    if (!fs) return 0
    const fi = STAGE_ORDER.indexOf(fs)
    const eff = STAGE_ORDER[Math.min(fi,ci)] as Stage
    return STAGE_ORDER.slice(0, STAGE_ORDER.indexOf(eff)+1).reduce((s,st) => s+(ADV[st as Stage]??0), 0)
  }
  return picks.map(pp => pp.reduce((sum, team, pi) => {
    const m = mPts.get(team)??0
    const a = advBonus(advMap.get(team) as Stage|undefined)
    return sum + Math.round(m * (mult[pi+1]??1)) + a
  }, 0))
}

// ── Analyse ───────────────────────────────────────────────────────────────────
// Del 1: Hvem vinner turneringen (pot-fordeling)?
const potWins = new Array(8).fill(0)
const champNames: Record<string,number> = {}
for (let sim = 0; sim < N_SIMS; sim++) {
  const { champion } = runTournament(sim * 7919 + 1)
  const pot = teamToPot.get(champion) ?? 0
  potWins[pot-1]++
  champNames[champion] = (champNames[champion]??0) + 1
}

console.log(`\n${'═'.repeat(64)}`)
console.log(`  SIMULERINGSRESULTAT — odds-basert  (${N_SIMS} simuleringer)`)
console.log('═'.repeat(64))
console.log('\n  Hvem vinner turneringen? (med realistisk odds-basert simulering)')
console.log('  ' + '─'.repeat(48))

let rowBuf = ''
for (let pot = 0; pot < 8; pot++) {
  const pct  = (potWins[pot] / N_SIMS * 100).toFixed(0)
  const bar  = '█'.repeat(Math.round(potWins[pot] / N_SIMS * 30))
  console.log(`  Pot ${pot+1}: ${String(potWins[pot]).padStart(3)} sim  (${pct.padStart(2)}%)  ${bar}`)
}

// Topp 5 vinnende lag
const top5 = Object.entries(champNames).sort((a,b) => b[1]-a[1]).slice(0, 6)
console.log('\n  Hyppigste vinnere:')
for (const [team, wins] of top5) {
  const pot  = teamToPot.get(team) ?? '?'
  const pct  = (wins / N_SIMS * 100).toFixed(0)
  console.log(`    ${team.padEnd(22)} ${String(wins).padStart(3)} vinner  (${pct}%)  — Pot ${pot}`)
}

// Del 2: Spredning og plassbytt per multiplikator-konfig
console.log(`\n\n${'═'.repeat(64)}`)
console.log('  MULTIPLIKANTOR — spredning og drama')
console.log('═'.repeat(64))
console.log('\n  Spread = gap 1.–10. plass.  Pos-bytt = spillere som bytter plass')

const CP_LABEL: Record<string,string> = {
  group:'Gruppe', r32:'R32', r16:'R16', qf:'QF', sf:'SF', final:'Final',
}

for (const cfg of CONFIGS) {
  const spreads     = CHECKPOINTS.map(() => [] as number[])
  const moves       = CHECKPOINTS.map(() => [] as number[])
  const comebacks: number[] = []
  const winnerRanks: number[] = []

  for (let sim = 0; sim < N_SIMS; sim++) {
    const { ri: pRi } = makePrng(sim * 3571 + 2)
    const picks: string[][] = Array.from({ length:N_PLAYERS }, () =>
      POTS.map(pot => pot.teams[pRi(0, pot.teams.length-1)].name)
    )
    const { matches, advMap } = runTournament(sim * 7919 + 1)
    const byCp = CHECKPOINTS.map(cp => calcScores(picks, matches, advMap, cfg.mult, cp))

    byCp.forEach((sc, ci) => spreads[ci].push(Math.max(...sc) - Math.min(...sc)))

    for (let ci = 1; ci < CHECKPOINTS.length; ci++) {
      const prev = byCp[ci-1]; const curr = byCp[ci]
      const rank = (sc: number[], p: number) => sc.filter(s => s > sc[p]).length
      comebacks  // bruk bare én gang under
      let moved = 0
      for (let p = 0; p < N_PLAYERS; p++) {
        if (rank(prev,p) !== rank(curr,p)) moved++
      }
      moves[ci].push(moved)
    }

    const finalSc = byCp[byCp.length-1]; const groupSc = byCp[0]
    const rank    = (sc: number[], p: number) => sc.filter(s => s > sc[p]).length
    const winP    = finalSc.indexOf(Math.max(...finalSc))
    winnerRanks.push(rank(groupSc, winP) + 1)

    const gRanked   = [...groupSc].sort((a,b) => b-a)
    const cutoff    = gRanked[Math.floor(N_PLAYERS/2)-1]
    const fTop3     = new Set([...finalSc].sort((a,b) => b-a).slice(0,3))
    comebacks.push(groupSc.some((gs,i) => gs < cutoff && fTop3.has(finalSc[i])) ? 1 : 0)
  }

  const avg = (a: number[]) => a.reduce((s,v) => s+v, 0) / a.length

  console.log(`\n  ── ${cfg.label}`)
  console.log(`     ${''.padEnd(8)} ${'Spread'.padStart(8)} ${'Pos-bytt'.padStart(10)}`)
  console.log('     ' + '─'.repeat(30))
  CHECKPOINTS.forEach((cp, ci) => {
    const sp = `${avg(spreads[ci]).toFixed(0)}p`.padStart(8)
    const mv = ci===0 ? '         ─' : `${avg(moves[ci]).toFixed(1)} av ${N_PLAYERS}`.padStart(10)
    console.log(`     ${CP_LABEL[cp].padEnd(8)} ${sp} ${mv}`)
  })
  const cb  = avg(comebacks)*100
  const wRk = avg(winnerRanks)
  console.log(`\n     Comeback-rate: ${cb.toFixed(0)}%   |   Vinneren lå typisk på plass ${wRk.toFixed(1)} etter gruppe`)
}

// Del 3: Konkret eksempel — se hvem bytter plass
console.log(`\n\n${'═'.repeat(64)}`)
console.log('  EKSEMPEL — konkret plassbytt (seed=77)')
console.log('═'.repeat(64))

const { ri: dRi } = makePrng(999)
const demoPicks: string[][] = Array.from({ length:N_PLAYERS }, () =>
  POTS.map(pot => pot.teams[dRi(0, pot.teams.length-1)].name)
)
const { matches: dM, advMap: dA, champion: dChamp } = runTournament(77 * 7919 + 1)
console.log(`\n  VM-vinner i dette eksemplet: ${dChamp} (Pot ${teamToPot.get(dChamp)})`)

for (const cfg of CONFIGS.slice(0,2)) {  // vis A og B
  const byCp = CHECKPOINTS.map(cp => calcScores(demoPicks, dM, dA, cfg.mult, cp))
  const rank  = (sc: number[], p: number) => sc.filter(s => s > sc[p]).length + 1
  const names = Array.from({length:N_PLAYERS}, (_,i) => `Spiller ${i+1}`)
  const order = [...names.keys()].sort((a,b) => byCp[byCp.length-1][b] - byCp[byCp.length-1][a])
  const potPicks = demoPicks.map(pp => pp.map((t,i) => `${t}(×${cfg.mult[i+1]??1})`).join(', '))

  console.log(`\n  ${cfg.label.split('—')[0].trim()}`)
  console.log(`  ${'Navn'.padEnd(11)}` + CHECKPOINTS.map(cp => CP_LABEL[cp].padStart(9)).join(''))
  console.log('  ' + '─'.repeat(11 + CHECKPOINTS.length*9))
  for (const pi of order) {
    const cells = byCp.map((sc,ci) => `${sc[pi]}(${rank(sc,pi)}.)`.padStart(9)).join('')
    console.log(`  ${names[pi].padEnd(11)}${cells}`)
  }

  console.log('\n  Plassbytt mellom runder:')
  for (let ci = 1; ci < CHECKPOINTS.length; ci++) {
    const prev = byCp[ci-1]; const curr = byCp[ci]
    const rk   = (sc: number[], p: number) => sc.filter(s => s > sc[p]).length
    const who  = names.filter((_,pi) => rk(prev,pi) !== rk(curr,pi))
    const from = `${CP_LABEL[CHECKPOINTS[ci-1]]}→${CP_LABEL[CHECKPOINTS[ci]]}`
    console.log(`  ${from.padEnd(12)}: ${who.length===0 ? 'ingen' : `${who.length} byttet`}`)
  }
}

// Oppsummering
console.log(`\n\n${'═'.repeat(64)}`)
console.log('  OPPSUMMERING')
console.log('═'.repeat(64))
const pot1pct = (potWins[0]/N_SIMS*100).toFixed(0)
const pot78pct = ((potWins[6]+potWins[7])/N_SIMS*100).toFixed(0)
console.log(`
  Med odds-basert simulering:
  → Pot 1-lag vinner turneringen ${pot1pct}% av gangene (realistisk)
  → Pot 7-8-lag vinner ${pot78pct}% — mye sjeldnere enn med gammel simulering

  Multiplikator-valg:
  → Config A (×2.0 for Pot 7-8): stor gevinst hvis underdog-laget gjør det bra,
    men det skjer nå sjeldnere → høy risiko, sjelden reward
  → Config B (×1.6 for Pot 7-8): litt mer jevnt, men fortsatt løft
  → Config C (flat ×1.4): minimerer "lotteri-følelsen" for Pot 7-8-picks

  Anbefaling: Config B er god balanse. Folk med Pot 7-8-lag har
  fortsatt noe å se frem til, men det er ikke avgjørende om de lykkes.
  Alternativt: beholdt gjeldende (A) gir mer spenning men mer tilfeldig.
`)
