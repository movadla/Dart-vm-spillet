// Simulerer 2 semifinaler (SF)
import { simKnockout } from './sim-strength.mjs'
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xd2NmdG11ZHdydmtnZmR1eXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Mzk2NzksImV4cCI6MjA5NDMxNTY3OX0.YFzmFg6VfI2EChNj8PfXsFmOAb0B2ZzOsIns2eCfwPo'
const BASE = 'https://oqwcftmudwrvkgfduyve.supabase.co/rest/v1'
const h = { 'apikey': ANON, 'Authorization': `Bearer ${ANON}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' }

const [advRes, matchRes] = await Promise.all([
  fetch(`${BASE}/advancement?stage_reached=eq.qf&select=team_name`, { headers: h }),
  fetch(`${BASE}/match_results?stage=eq.sf&select=home_team,away_team`, { headers: h }),
])

const qfAdvanced = (await advRes.json()).map(r => r.team_name)
const sfPlayed = new Set()
for (const m of await matchRes.json()) {
  sfPlayed.add(m.home_team)
  sfPlayed.add(m.away_team)
}

const pending = qfAdvanced.filter(t => !sfPlayed.has(t))
console.log(`${pending.length} lag venter på semifinale:`)
pending.forEach(t => console.log(`  ${t}`))

if (pending.length === 0) { console.log('\nAlle semifinaler er allerede spilt.'); process.exit(0) }
if (pending.length % 2 !== 0) { console.error('\nOdd antall lag — noe er galt.'); process.exit(1) }

const shuffled = [...pending].sort((a, b) => a.localeCompare(b))
console.log(`\nSimulerer ${shuffled.length / 2} kamper:\n`)

const winners = []
const losers = []
for (let i = 0; i < shuffled.length; i += 2) {
  const home = shuffled[i], away = shuffled[i + 1]
  const [hg, ag] = simKnockout(home, away)
  const winner = hg > ag ? home : away
  const loser = hg > ag ? away : home

  const res = await fetch(`${BASE}/match_results`, {
    method: 'POST',
    headers: { ...h, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ home_team: home, away_team: away, home_goals: hg, away_goals: ag, stage: 'sf' })
  })
  if (res.ok) {
    console.log(`  SF: ${home} ${hg}–${ag} ${away}  →  ${winner} til finale, ${loser} til bronsefinale`)
    winners.push(winner)
    losers.push(loser)
  } else {
    console.error(`  ❌ ${home} vs ${away}: ${await res.text()}`)
  }
}

for (const w of winners) {
  await fetch(`${BASE}/advancement?team_name=eq.${encodeURIComponent(w)}`, {
    method: 'PATCH', headers: h,
    body: JSON.stringify({ stage_reached: 'sf' })
  })
}

console.log(`\n✓ ${winners.length} finalister oppdatert til stage: sf`)
console.log(`Finalister: ${winners.join(' vs ')}`)
console.log(`Bronsefinale: ${losers.join(' vs ')}`)
