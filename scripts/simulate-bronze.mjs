// Simulerer bronsefinalen
import { simKnockout } from './sim-strength.mjs'
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xd2NmdG11ZHdydmtnZmR1eXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Mzk2NzksImV4cCI6MjA5NDMxNTY3OX0.YFzmFg6VfI2EChNj8PfXsFmOAb0B2ZzOsIns2eCfwPo'
const BASE = 'https://oqwcftmudwrvkgfduyve.supabase.co/rest/v1'
const h = { 'apikey': ANON, 'Authorization': `Bearer ${ANON}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' }

// SF-tapere = lag med stage_reached=qf som har spilt SF
const [sfMatchRes, bronzeMatchRes] = await Promise.all([
  fetch(`${BASE}/match_results?stage=eq.sf&select=home_team,away_team,home_goals,away_goals`, { headers: h }),
  fetch(`${BASE}/match_results?stage=eq.bronze&select=home_team,away_team`, { headers: h }),
])

const sfMatches = await sfMatchRes.json()
const bronzePlayed = new Set()
for (const m of await bronzeMatchRes.json()) {
  bronzePlayed.add(m.home_team)
  bronzePlayed.add(m.away_team)
}

const sfLosers = sfMatches.map(m => m.home_goals < m.away_goals ? m.home_team : m.away_team)
const pending = sfLosers.filter(t => !bronzePlayed.has(t))

console.log(`SF-tapere til bronsefinale: ${pending.join(' vs ')}`)

if (pending.length === 0) { console.log('\nBronsefinalen er allerede spilt.'); process.exit(0) }
if (pending.length !== 2) { console.error(`\nForventet 2 lag, fant ${pending.length} — noe er galt.`); process.exit(1) }

const [home, away] = pending
const [hg, ag] = simKnockout(home, away)
const winner = hg > ag ? home : away
const loser = hg > ag ? away : home

const res = await fetch(`${BASE}/match_results`, {
  method: 'POST',
  headers: { ...h, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
  body: JSON.stringify({ home_team: home, away_team: away, home_goals: hg, away_goals: ag, stage: 'bronze' })
})

if (!res.ok) { console.error(`❌ ${home} vs ${away}: ${await res.text()}`); process.exit(1) }

console.log(`\n  BRONSE: ${home} ${hg}–${ag} ${away}  →  ${winner} bronsemedalje, ${loser} ute`)

await fetch(`${BASE}/advancement?team_name=eq.${encodeURIComponent(winner)}`, {
  method: 'PATCH', headers: h,
  body: JSON.stringify({ stage_reached: 'bronze' })
})

console.log(`\n✓ ${winner} oppdatert til stage: bronze`)
