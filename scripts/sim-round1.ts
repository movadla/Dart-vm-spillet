/**
 * Simulerer runde 1 i VM 2026 — én kamp per lag (24 kamper totalt).
 * Bruker pott-vektet tilfeldighet (seed=77) for troverdige resultater.
 *
 * Kjør:  npm run sim-round1
 * Nullstill: npm run cleanup-round1
 *
 * NB: Siden viser ikke poeng før VM starter (11. juni).
 * For å teste poengvisningen, endre midlertidig i src/app/deltaker/[id]/page.tsx:
 *   const DEADLINE = new Date('2026-05-01T19:00:00Z')
 * Husk å sette den tilbake til '2026-06-11T19:00:00Z' etterpå.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { GROUP_SCHEDULE } from '../src/data/schedule'
import { POTS } from '../src/data/pots'

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

// Seeded LCG random
let _s = 77
const rand = () => { _s = (Math.imul(1664525, _s) + 1013904223) >>> 0; return _s / 4294967296 }
const ri = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1))

const teamToPot = new Map(POTS.flatMap(p => p.teams.map(t => [t.name, p.potNumber])))
const teamToFlag = new Map(POTS.flatMap(p => p.teams.map(t => [t.name, t.flag])))

function simMatch(home: string, away: string) {
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
  return { home_team: home, away_team: away, home_goals: hg, away_goals: ag, stage: 'group' as const }
}

// Runde 1: første 2 kamper i hver gruppe (én kamp per lag)
const ROUND1_IDS = new Set([
  'm001','m002', // Gruppe A
  'm007','m008', // Gruppe B
  'm013','m014', // Gruppe C
  'm019','m020', // Gruppe D
  'm025','m026', // Gruppe E
  'm031','m032', // Gruppe F
  'm037','m038', // Gruppe G
  'm043','m044', // Gruppe H
  'm049','m050', // Gruppe I
  'm055','m056', // Gruppe J
  'm061','m062', // Gruppe K
  'm067','m068', // Gruppe L
])

const round1Matches = GROUP_SCHEDULE.filter(m => ROUND1_IDS.has(m.id))
const results = round1Matches.map(m => simMatch(m.home, m.away))

// ── Print resultater ─────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(52))
console.log('  VM 2026 — RUNDE 1  (simulert, seed=77)')
console.log('═'.repeat(52))

const byGroup = new Map<string, typeof round1Matches>()
for (const m of round1Matches) {
  if (!byGroup.has(m.group)) byGroup.set(m.group, [])
  byGroup.get(m.group)!.push(m)
}

for (const [grp, matches] of [...byGroup.entries()].sort()) {
  console.log(`\n  Gruppe ${grp}:`)
  for (const m of matches) {
    const r = results[round1Matches.indexOf(m)]
    const hFlag = teamToFlag.get(m.home) ?? ''
    const aFlag = teamToFlag.get(m.away) ?? ''
    const score = `${r.home_goals}–${r.away_goals}`
    const outcome = r.home_goals > r.away_goals ? `${m.home} vinner`
      : r.away_goals > r.home_goals ? `${m.away} vinner`
      : 'Uavgjort'
    console.log(`    ${hFlag} ${m.home.padEnd(20)} ${score}  ${aFlag} ${m.away.padEnd(20)}  (${outcome})`)
  }
}

console.log('\n' + '═'.repeat(52))

// ── Seed til Supabase ────────────────────────────────────────────────────────
async function run() {
  // Slett all eksisterende avansementsdata (ingen lag har avansert etter runde 1)
  const allTeamNames = POTS.flatMap(p => p.teams.map(t => t.name))
  const { error: advErr } = await supabase.from('advancement').delete().in('team_name', allTeamNames)
  if (advErr) throw new Error(`Sletting av advancement feilet: ${advErr.message}`)

  // Slett alle eksisterende kampresultater for alle 48 lag (hjemme og borte)
  const { error: d1 } = await supabase.from('match_results').delete().in('home_team', allTeamNames)
  if (d1) throw new Error(`Sletting (hjemmelag) feilet: ${d1.message}`)
  const { error: d2 } = await supabase.from('match_results').delete().in('away_team', allTeamNames)
  if (d2) throw new Error(`Sletting (bortelag) feilet: ${d2.message}`)

  // Insert runde 1-resultater
  const rows = results.map(r => ({
    home_team: r.home_team,
    away_team: r.away_team,
    home_goals: r.home_goals,
    away_goals: r.away_goals,
    stage: 'group',
  }))

  const { error: insErr } = await supabase.from('match_results').insert(rows)
  if (insErr) throw new Error(`Insert feilet: ${insErr.message}`)

  console.log(`\n  ✅ ${rows.length} resultater lagt inn i databasen`)
  console.log('\n  Hva du kan teste nå:')
  console.log('  • /leaderboard          — rangering med poeng')
  console.log('  • /deltaker/<id>        — min side med kampresultater i lagkortene')
  console.log('  • «Din neste kamp»      — skal nå vise neste kamp, ikke første kamp')
  console.log('\n  NB: Poengvisning er skjult frem til 11. juni.')
  console.log('  For å teste den, endre midlertidig i src/app/deltaker/[id]/page.tsx:')
  console.log("    const DEADLINE = new Date('2026-05-01T19:00:00Z')")
  console.log('\n  Nullstill med: npm run cleanup-round1\n')
}

run().catch(e => { console.error('\n  ❌', e.message); process.exit(1) })
