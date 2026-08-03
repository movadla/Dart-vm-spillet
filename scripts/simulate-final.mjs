// Simulerer bronsefinale + finale
import { simKnockout } from './sim-strength.mjs'
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xd2NmdG11ZHdydmtnZmR1eXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Mzk2NzksImV4cCI6MjA5NDMxNTY3OX0.YFzmFg6VfI2EChNj8PfXsFmOAb0B2ZzOsIns2eCfwPo'
const BASE = 'https://oqwcftmudwrvkgfduyve.supabase.co/rest/v1'
const h = { 'apikey': ANON, 'Authorization': `Bearer ${ANON}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' }

function simulate(home, away, stage) {
  const [hg, ag] = simKnockout(home, away)
  return { home, away, hg, ag, winner: hg > ag ? home : away, loser: hg > ag ? away : home, stage }
}

// Hent alle SF-spillere og SF-resultater for å finne tap- og vinnere
const [advSfRes, sfMatchRes, existingFinalRes, existingBronzeRes] = await Promise.all([
  fetch(`${BASE}/advancement?stage_reached=eq.sf&select=team_name`, { headers: h }),
  fetch(`${BASE}/match_results?stage=eq.sf&select=home_team,away_team,home_goals,away_goals`, { headers: h }),
  fetch(`${BASE}/match_results?stage=eq.final&select=home_team,away_team`, { headers: h }),
  fetch(`${BASE}/match_results?stage=eq.bronze&select=home_team,away_team`, { headers: h }),
])

const sfFinalists = (await advSfRes.json()).map(r => r.team_name)
const sfMatches = await sfMatchRes.json()
const existingFinals = await existingFinalRes.json()
const existingBronze = await existingBronzeRes.json()

if (existingFinals.length > 0) {
  console.log('Finalen er allerede spilt.')
  process.exit(0)
}

if (sfFinalists.length < 2) {
  console.error('Finner ikke 2 finalister med stage=sf. Sjekk at SF er simulert.')
  process.exit(1)
}

// SF-tapere: lag i SF-kamper som ikke er finalister
const sfLosers = []
for (const m of sfMatches) {
  const winner = m.home_goals > m.away_goals ? m.home_team : m.away_team
  const loser = m.home_goals > m.away_goals ? m.away_team : m.home_team
  if (!sfFinalists.includes(loser)) continue
  // loser er faktisk en finalekanditat — dette skjer ikke, men trygt å sjekke
}
// Finn tapere: alle lag i SF-kamper som IKKE har stage=sf advancement
const sfParticipants = new Set()
for (const m of sfMatches) { sfParticipants.add(m.home_team); sfParticipants.add(m.away_team) }
for (const t of sfParticipants) {
  if (!sfFinalists.includes(t)) sfLosers.push(t)
}

console.log(`Finalister: ${sfFinalists.join(', ')}`)
console.log(`Bronsefinale: ${sfLosers.join(' vs ')}\n`)

// Bronsefinale
if (sfLosers.length === 2 && existingBronze.length === 0) {
  const b = simulate(sfLosers[0], sfLosers[1], 'bronze')
  const bRes = await fetch(`${BASE}/match_results`, {
    method: 'POST',
    headers: { ...h, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ home_team: b.home, away_team: b.away, home_goals: b.hg, away_goals: b.ag, stage: 'bronze' })
  })
  if (bRes.ok) {
    console.log(`  Bronsefinale: ${b.home} ${b.hg}–${b.ag} ${b.away}  →  ${b.winner} tar bronsen`)
    // Bronze = stage 'bronze', silver = stage 'silver' for taperen
    await fetch(`${BASE}/advancement?team_name=eq.${encodeURIComponent(b.winner)}`, {
      method: 'PATCH', headers: h,
      body: JSON.stringify({ stage_reached: 'bronze' })
    })
  }
}

// Finale
const f = simulate(sfFinalists[0], sfFinalists[1], 'final')
const fRes = await fetch(`${BASE}/match_results`, {
  method: 'POST',
  headers: { ...h, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
  body: JSON.stringify({ home_team: f.home, away_team: f.away, home_goals: f.hg, away_goals: f.ag, stage: 'final' })
})
if (fRes.ok) {
  console.log(`  Finale:       ${f.home} ${f.hg}–${f.ag} ${f.away}  →  🏆 ${f.winner} er verdensmester!`)
  await fetch(`${BASE}/advancement?team_name=eq.${encodeURIComponent(f.winner)}`, {
    method: 'PATCH', headers: h,
    body: JSON.stringify({ stage_reached: 'gold' })
  })
  await fetch(`${BASE}/advancement?team_name=eq.${encodeURIComponent(f.loser)}`, {
    method: 'PATCH', headers: h,
    body: JSON.stringify({ stage_reached: 'silver' })
  })
} else {
  console.error('❌ Feil ved finale:', await fRes.text())
}

console.log('\n✓ VM er ferdig!')
