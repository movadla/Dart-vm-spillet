// Simulerer de 8 gjenværende 1/16-finalene
import { simKnockout } from './sim-strength.mjs'
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xd2NmdG11ZHdydmtnZmR1eXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Mzk2NzksImV4cCI6MjA5NDMxNTY3OX0.YFzmFg6VfI2EChNj8PfXsFmOAb0B2ZzOsIns2eCfwPo'
const BASE = 'https://oqwcftmudwrvkgfduyve.supabase.co/rest/v1'
const h = { 'apikey': ANON, 'Authorization': `Bearer ${ANON}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' }

// Hent lag som har kommet videre fra gruppe men ikke spilt R32 ennå
const [advRes, matchRes] = await Promise.all([
  fetch(`${BASE}/advancement?stage_reached=eq.group&select=team_name`, { headers: h }),
  fetch(`${BASE}/match_results?stage=eq.r32&select=home_team,away_team`, { headers: h }),
])

const groupAdvanced = (await advRes.json()).map(r => r.team_name)
const r32Played = new Set()
for (const m of await matchRes.json()) {
  r32Played.add(m.home_team)
  r32Played.add(m.away_team)
}

const pending = groupAdvanced.filter(t => !r32Played.has(t))
console.log(`${pending.length} lag venter på sin 1/16-finale:`)
pending.forEach(t => console.log(`  ${t}`))

if (pending.length === 0) { console.log('\nAlle 1/16-finaler er allerede spilt.'); process.exit(0) }
if (pending.length % 2 !== 0) { console.error('\nOdd antall lag — noe er galt med dataene.'); process.exit(1) }

// Par opp tilfeldig og simuler
const shuffled = [...pending].sort(() => Math.random() - 0.5)
console.log(`\nSimulerer ${shuffled.length / 2} kamper:\n`)

const winners = []
for (let i = 0; i < shuffled.length; i += 2) {
  const home = shuffled[i], away = shuffled[i + 1]
  const [hg, ag] = simKnockout(home, away)
  const winner = hg > ag ? home : away

  const res = await fetch(`${BASE}/match_results`, {
    method: 'POST',
    headers: { ...h, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ home_team: home, away_team: away, home_goals: hg, away_goals: ag, stage: 'r32' })
  })
  if (res.ok) {
    console.log(`  1/16: ${home} ${hg}–${ag} ${away}  →  ${winner} videre`)
    winners.push(winner)
  } else {
    console.error(`  ❌ ${home} vs ${away}: ${await res.text()}`)
  }
}

// Oppdater advancement for vinnerne
for (const w of winners) {
  await fetch(`${BASE}/advancement?team_name=eq.${encodeURIComponent(w)}`, {
    method: 'PATCH', headers: h,
    body: JSON.stringify({ stage_reached: 'r32' })
  })
}

console.log(`\n✓ ${winners.length} vinnere oppdatert til stage: r32`)
console.log('Alle 1/16-finaler er nå spilt.')
