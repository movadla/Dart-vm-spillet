import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { POTS } from '../src/data/pots'
import { VM_GROUPS } from '../src/data/vm-groups'
import { SCORING } from '../src/config/scoring'

// ── Env ───────────────────────────────────────────────────────────────────────
const rawEnv = readFileSync('.env.local', 'utf-8')
const env = Object.fromEntries(
  rawEnv.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#') && l.trim())
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Mangler NEXT_PUBLIC_SUPABASE_URL eller NEXT_PUBLIC_SUPABASE_ANON_KEY i .env.local')
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// ── Seeded LCG random (seed=42, reproduserbart) ───────────────────────────────
let _s = 42
const rand = () => { _s = (Math.imul(1664525, _s) + 1013904223) >>> 0; return _s / 4294967296 }
const ri = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1))
const shuffle = <T>(a: T[]) => {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

// ── Lookups ───────────────────────────────────────────────────────────────────
const teamToPot = new Map(POTS.flatMap(p => p.teams.map(t => [t.name, p.potNumber])))
const teamToFlag = new Map(POTS.flatMap(p => p.teams.map(t => [t.name, t.flag])))
const allTeamNames = POTS.flatMap(p => p.teams.map(t => t.name))

// ── Match simulation ──────────────────────────────────────────────────────────
// Vinner-sannsynlighet basert på pot: Pot 1 (weight=8) slår Pot 8 (weight=1) langt oftere.
// 22% sjanse for uavgjort. Mål: vinner 1-3, taper 0-1, uavgjort 0-2 begge.
type MatchRow = { home_team: string; away_team: string; home_goals: number; away_goals: number; stage: string }

function simMatch(home: string, away: string, stage: string): MatchRow {
  const wH = 9 - (teamToPot.get(home) ?? 4)
  const wA = 9 - (teamToPot.get(away) ?? 4)
  let hg: number, ag: number
  if (rand() < 0.22) {
    hg = ag = ri(0, 2)
  } else if (rand() < wH / (wH + wA)) {
    hg = ri(1, 3); ag = ri(0, 1)
  } else {
    hg = ri(0, 1); ag = ri(1, 3)
  }
  return { home_team: home, away_team: away, home_goals: hg, away_goals: ag, stage }
}

// ── Gruppespill (12 grupper × 6 round-robin = 72 kamper) ─────────────────────
const allMatches: MatchRow[] = []
interface Entry { team: string; group: string; pts: number; gd: number; gf: number }
const allEntries: Entry[] = []

for (const g of VM_GROUPS) {
  const st = new Map(g.teams.map(t => [t, { team: t, group: g.letter, pts: 0, gd: 0, gf: 0 }]))
  for (let i = 0; i < g.teams.length; i++) {
    for (let j = i + 1; j < g.teams.length; j++) {
      const m = simMatch(g.teams[i], g.teams[j], 'group')
      allMatches.push(m)
      const h = st.get(m.home_team)!; const a = st.get(m.away_team)!
      h.gf += m.home_goals; h.gd += m.home_goals - m.away_goals
      a.gf += m.away_goals; a.gd += m.away_goals - m.home_goals
      if (m.home_goals > m.away_goals) h.pts += 3
      else if (m.home_goals === m.away_goals) { h.pts += 1; a.pts += 1 }
      else a.pts += 3
    }
  }
  const sorted = [...st.values()].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
  allEntries.push(...sorted)
}

// ── Avansement fra gruppe (top 2 per gruppe + 8 beste 3.-plasser = 32 lag) ────
const advancementMap = new Map<string, string>()
const thirds: Entry[] = []

const byGroup = new Map<string, Entry[]>()
for (const e of allEntries) {
  if (!byGroup.has(e.group)) byGroup.set(e.group, [])
  byGroup.get(e.group)!.push(e)
}
for (const entries of byGroup.values()) {
  advancementMap.set(entries[0].team, 'group')
  advancementMap.set(entries[1].team, 'group')
  thirds.push(entries[2])
}
thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
thirds.slice(0, 8).forEach(e => advancementMap.set(e.team, 'group'))

// ── Utslagsspill ──────────────────────────────────────────────────────────────
// stage_reached oppdateres for vinnere: 'r32' = vant R32, 'r16' = vant R16, osv.
// Tapere beholder sin siste stage (f.eks. taper i R32 har stage_reached='group').
let bracket = shuffle([...advancementMap.keys()])

for (const stage of ['r32', 'r16', 'qf', 'sf'] as const) {
  const winners: string[] = []
  for (let i = 0; i < bracket.length; i += 2) {
    const m = simMatch(bracket[i], bracket[i + 1], stage)
    allMatches.push(m)
    const w = m.home_goals >= m.away_goals ? m.home_team : m.away_team
    winners.push(w)
    advancementMap.set(w, stage)
  }
  bracket = shuffle(winners)
}

const finalM = simMatch(bracket[0], bracket[1], 'final')
allMatches.push(finalM)
const champion = finalM.home_goals >= finalM.away_goals ? bracket[0] : bracket[1]
const finalist = finalM.home_goals >= finalM.away_goals ? bracket[1] : bracket[0]
advancementMap.set(champion, 'winner')
advancementMap.set(finalist, 'final')

// ── Turneringsoversikt ────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(52))
console.log('  VM 2026 SIMULERING  (seed=42)')
console.log('═'.repeat(52))
console.log(`  Gruppevinnere per gruppe:`)
for (const [grp, entries] of byGroup) {
  const top = entries.slice(0, 2).map(e => `${e.team}(${e.pts}p)`).join(', ')
  console.log(`    Gruppe ${grp}: ${top}`)
}
console.log(`\n  R32-finalister: ${bracket.join(', ')}`)
console.log(`\n  🥇 VM-VINNER:  ${champion} ${teamToFlag.get(champion) ?? ''}`)
console.log(`  🥈 FINALIST:   ${finalist} ${teamToFlag.get(finalist) ?? ''}`)
console.log('═'.repeat(52))

// ── Generer 10 demo-spillere med tilfeldige picks ─────────────────────────────
const DEMO_NAMES = ['Lars Erik', 'Marte', 'Bjørn', 'Ingrid', 'Kristoffer', 'Silje', 'Torbjørn', 'Heidi', 'Magnus', 'Åse']
type Pick = { potNumber: number; teamName: string }

const players = DEMO_NAMES.map(n => ({
  name: `Demo ${n}`,
  picks: POTS.map(pot => ({
    potNumber: pot.potNumber,
    teamName: pot.teams[ri(0, pot.teams.length - 1)].name,
  })) as Pick[],
}))

// ── Scoring-verktøy (lokal beregning for konsolloversikt) ─────────────────────
const STAGE_ORDER = ['group', 'r32', 'r16', 'qf', 'sf', 'final', 'winner']
const STAGE_BONUS: Record<string, number> = { group: 5, r32: 8, r16: 12, qf: 17, sf: 24, final: 0, winner: 32 }

function effStage(finalStage: string | undefined, cp: string): string | undefined {
  if (!finalStage) return undefined
  const fi = STAGE_ORDER.indexOf(finalStage)
  const ci = STAGE_ORDER.indexOf(cp)
  return fi < 0 ? undefined : STAGE_ORDER[Math.min(fi, ci)]
}

function advBonus(stage: string | undefined): number {
  if (!stage) return 0
  const idx = STAGE_ORDER.indexOf(stage)
  return idx < 0 ? 0 : STAGE_ORDER.slice(0, idx + 1).reduce((s, st) => s + (STAGE_BONUS[st] ?? 0), 0)
}

function mPtsAt(team: string, stages: Set<string>): number {
  let pts = 0
  for (const m of allMatches) {
    if (!stages.has(m.stage)) continue
    const h = m.home_team === team
    if (!h && m.away_team !== team) continue
    const g = h ? m.home_goals : m.away_goals
    const c = h ? m.away_goals : m.home_goals
    pts += g + (g > c ? 4 : g === c ? 1 : 0)
  }
  return pts
}

function playerTotal(picks: Pick[], cp: string, stages: Set<string>): number {
  return picks.reduce((sum, p) => {
    const mult = SCORING.underdogMultiplier[p.potNumber] ?? 1
    const mPts = mPtsAt(p.teamName, stages)
    const aPts = advBonus(effStage(advancementMap.get(p.teamName), cp))
    return sum + Math.round(mPts * mult) + aPts
  }, 0)
}

// ── Leaderboard ved hvert checkpoint ─────────────────────────────────────────
const CHECKPOINTS = [
  { label: 'ETTER GRUPPESPILL', cp: 'group', stages: new Set(['group']) },
  { label: 'ETTER R32         ', cp: 'r32',   stages: new Set(['group', 'r32']) },
  { label: 'ETTER R16         ', cp: 'r16',   stages: new Set(['group', 'r32', 'r16']) },
  { label: 'ETTER KVARTFINALE ', cp: 'qf',    stages: new Set(['group', 'r32', 'r16', 'qf']) },
  { label: 'ETTER SEMIFINALE  ', cp: 'sf',    stages: new Set(['group', 'r32', 'r16', 'qf', 'sf']) },
  { label: 'ETTER FINALEN     ', cp: 'final', stages: new Set(['group', 'r32', 'r16', 'qf', 'sf', 'final']) },
]

for (const { label, cp, stages } of CHECKPOINTS) {
  const ranked = players
    .map(p => ({
      name: p.name.replace('Demo ', ''),
      total: playerTotal(p.picks, cp, stages),
      flags: p.picks.map(pk => teamToFlag.get(pk.teamName) ?? '?').join(''),
    }))
    .sort((a, b) => b.total - a.total)

  const spread = ranked[0].total - ranked[ranked.length - 1].total

  console.log(`\n  ${label}  (spread: ${spread}p)`)
  console.log('  ' + '─'.repeat(52))
  ranked.forEach((p, i) => {
    const rank = `${i + 1}.`.padEnd(4)
    const name = p.name.padEnd(14)
    const pts = `${p.total}p`.padStart(5)
    console.log(`  ${rank}${name} ${pts}  ${p.flags}`)
  })
}

// ── Supabase seed ─────────────────────────────────────────────────────────────
async function seedDatabase() {
  console.log('\n\n  Seeder til Supabase...')

  // 1. Rydd opp gammelt
  const { error: e1 } = await supabase.from('participants').delete().like('name', 'Demo %')
  if (e1) throw new Error(`Rydding av deltakere feilet: ${e1.message}`)

  const { error: e2 } = await supabase.from('match_results').delete().in('home_team', allTeamNames)
  if (e2) throw new Error(`Rydding av match_results feilet: ${e2.message}`)

  const { error: e3 } = await supabase.from('advancement').delete().in('team_name', allTeamNames)
  if (e3) throw new Error(`Rydding av advancement feilet: ${e3.message}`)

  // 2. Insert deltakere
  const { data: inserted, error: e4 } = await supabase
    .from('participants')
    .insert(players.map(p => ({
      name: p.name,
      email: `${p.name.toLowerCase()
        .replace(/å/g, 'a').replace(/æ/g, 'ae').replace(/ø/g, 'o')
        .replace(/\s+/g, '.')}@demo.no`,
      vipps_confirmed: true,
    })))
    .select('id, name')
  if (e4) throw new Error(`Insert deltakere feilet: ${e4.message}`)

  // 3. Insert picks
  const nameToId = new Map((inserted as { id: string; name: string }[]).map(p => [p.name, p.id]))
  const picksToInsert = players.flatMap(p =>
    p.picks.map(pk => ({
      participant_id: nameToId.get(p.name)!,
      pot_number: pk.potNumber,
      team_name: pk.teamName,
    }))
  )
  const { error: e5 } = await supabase.from('picks').insert(picksToInsert)
  if (e5) throw new Error(`Insert picks feilet: ${e5.message}`)

  // 4. Insert match_results (i batches)
  const BATCH = 50
  for (let i = 0; i < allMatches.length; i += BATCH) {
    const { error: eM } = await supabase.from('match_results').insert(allMatches.slice(i, i + BATCH))
    if (eM) throw new Error(`Insert match_results feilet: ${eM.message}`)
  }

  // 5. Insert advancement
  const advRows = [...advancementMap.entries()].map(([team_name, stage_reached]) => ({ team_name, stage_reached }))
  const { error: e6 } = await supabase.from('advancement').upsert(advRows)
  if (e6) throw new Error(`Insert advancement feilet: ${e6.message}`)

  console.log(`\n  ✅ Ferdig!`)
  console.log(`     ${players.length} deltakere  |  ${picksToInsert.length} picks  |  ${allMatches.length} kamper  |  ${advRows.length} avansementsrader`)
  console.log('\n  Åpne /leaderboard for å se resultatet.')
  console.log('  Rydd opp med: npm run cleanup-demo\n')
}

seedDatabase().catch(e => { console.error(e); process.exit(1) })
