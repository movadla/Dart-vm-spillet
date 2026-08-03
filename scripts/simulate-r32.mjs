// Fullfører gruppespillet + simulerer 8 av 16-delfinaler
import { simGroup, simKnockout } from './sim-strength.mjs'
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xd2NmdG11ZHdydmtnZmR1eXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Mzk2NzksImV4cCI6MjA5NDMxNTY3OX0.YFzmFg6VfI2EChNj8PfXsFmOAb0B2ZzOsIns2eCfwPo'
const BASE = 'https://oqwcftmudwrvkgfduyve.supabase.co/rest/v1'
const h = { 'apikey': ANON, 'Authorization': `Bearer ${ANON}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' }

// Alle 72 gruppespillkamper — korrekt fra src/data/schedule.ts
const ALL_GROUP_MATCHES = [
  // Gruppe A
  { home: 'Mexico', away: 'Sør-Afrika', group: 'A' },
  { home: 'Sør-Korea', away: 'Tsjekkia', group: 'A' },
  { home: 'Tsjekkia', away: 'Sør-Afrika', group: 'A' },
  { home: 'Mexico', away: 'Sør-Korea', group: 'A' },
  { home: 'Tsjekkia', away: 'Mexico', group: 'A' },
  { home: 'Sør-Afrika', away: 'Sør-Korea', group: 'A' },
  // Gruppe B
  { home: 'Canada', away: 'Bosnia-Hercegovina', group: 'B' },
  { home: 'Qatar', away: 'Sveits', group: 'B' },
  { home: 'Sveits', away: 'Bosnia-Hercegovina', group: 'B' },
  { home: 'Canada', away: 'Qatar', group: 'B' },
  { home: 'Sveits', away: 'Canada', group: 'B' },
  { home: 'Bosnia-Hercegovina', away: 'Qatar', group: 'B' },
  // Gruppe C
  { home: 'Brasil', away: 'Marokko', group: 'C' },
  { home: 'Haiti', away: 'Skottland', group: 'C' },
  { home: 'Skottland', away: 'Marokko', group: 'C' },
  { home: 'Brasil', away: 'Haiti', group: 'C' },
  { home: 'Skottland', away: 'Brasil', group: 'C' },
  { home: 'Marokko', away: 'Haiti', group: 'C' },
  // Gruppe D
  { home: 'USA', away: 'Paraguay', group: 'D' },
  { home: 'Australia', away: 'Tyrkia', group: 'D' },
  { home: 'USA', away: 'Australia', group: 'D' },
  { home: 'Tyrkia', away: 'Paraguay', group: 'D' },
  { home: 'Tyrkia', away: 'USA', group: 'D' },
  { home: 'Paraguay', away: 'Australia', group: 'D' },
  // Gruppe E
  { home: 'Tyskland', away: 'Curaçao', group: 'E' },
  { home: 'Elfenbenskysten', away: 'Ecuador', group: 'E' },
  { home: 'Tyskland', away: 'Elfenbenskysten', group: 'E' },
  { home: 'Ecuador', away: 'Curaçao', group: 'E' },
  { home: 'Curaçao', away: 'Elfenbenskysten', group: 'E' },
  { home: 'Ecuador', away: 'Tyskland', group: 'E' },
  // Gruppe F
  { home: 'Nederland', away: 'Japan', group: 'F' },
  { home: 'Sverige', away: 'Tunisia', group: 'F' },
  { home: 'Nederland', away: 'Sverige', group: 'F' },
  { home: 'Tunisia', away: 'Japan', group: 'F' },
  { home: 'Japan', away: 'Sverige', group: 'F' },
  { home: 'Tunisia', away: 'Nederland', group: 'F' },
  // Gruppe G
  { home: 'Belgia', away: 'Egypt', group: 'G' },
  { home: 'Iran', away: 'New Zealand', group: 'G' },
  { home: 'Belgia', away: 'Iran', group: 'G' },
  { home: 'New Zealand', away: 'Egypt', group: 'G' },
  { home: 'Egypt', away: 'Iran', group: 'G' },
  { home: 'New Zealand', away: 'Belgia', group: 'G' },
  // Gruppe H
  { home: 'Spania', away: 'Kapp Verde', group: 'H' },
  { home: 'Saudi-Arabia', away: 'Uruguay', group: 'H' },
  { home: 'Spania', away: 'Saudi-Arabia', group: 'H' },
  { home: 'Uruguay', away: 'Kapp Verde', group: 'H' },
  { home: 'Kapp Verde', away: 'Saudi-Arabia', group: 'H' },
  { home: 'Uruguay', away: 'Spania', group: 'H' },
  // Gruppe I
  { home: 'Frankrike', away: 'Senegal', group: 'I' },
  { home: 'Irak', away: 'Norge', group: 'I' },
  { home: 'Frankrike', away: 'Irak', group: 'I' },
  { home: 'Norge', away: 'Senegal', group: 'I' },
  { home: 'Norge', away: 'Frankrike', group: 'I' },
  { home: 'Senegal', away: 'Irak', group: 'I' },
  // Gruppe J
  { home: 'Argentina', away: 'Algerie', group: 'J' },
  { home: 'Østerrike', away: 'Jordan', group: 'J' },
  { home: 'Argentina', away: 'Østerrike', group: 'J' },
  { home: 'Jordan', away: 'Algerie', group: 'J' },
  { home: 'Algerie', away: 'Østerrike', group: 'J' },
  { home: 'Jordan', away: 'Argentina', group: 'J' },
  // Gruppe K
  { home: 'Portugal', away: 'Congo DR', group: 'K' },
  { home: 'Usbekistan', away: 'Colombia', group: 'K' },
  { home: 'Portugal', away: 'Usbekistan', group: 'K' },
  { home: 'Colombia', away: 'Congo DR', group: 'K' },
  { home: 'Colombia', away: 'Portugal', group: 'K' },
  { home: 'Congo DR', away: 'Usbekistan', group: 'K' },
  // Gruppe L
  { home: 'England', away: 'Kroatia', group: 'L' },
  { home: 'Ghana', away: 'Panama', group: 'L' },
  { home: 'England', away: 'Ghana', group: 'L' },
  { home: 'Panama', away: 'Kroatia', group: 'L' },
  { home: 'Panama', away: 'England', group: 'L' },
  { home: 'Kroatia', away: 'Ghana', group: 'L' },
]

// ── Hent eksisterende resultater ──────────────────────────────────────────────
console.log('Henter eksisterende kampresultater...')
const existingRes = await fetch(`${BASE}/match_results?select=home_team,away_team,home_goals,away_goals`, { headers: h })
const existingList = await existingRes.json()

const existingSet = new Set()
const allResults = []
for (const m of existingList) {
  existingSet.add(`${m.home_team}|${m.away_team}`)
  existingSet.add(`${m.away_team}|${m.home_team}`)
  allResults.push(m)
}
console.log(`${existingList.length} kamper allerede i DB\n`)

// ── Legg til manglende gruppespillkamper ──────────────────────────────────────
const remaining = ALL_GROUP_MATCHES.filter(m => !existingSet.has(`${m.home}|${m.away}`))
console.log(`Legger til ${remaining.length} manglende gruppespillkamper:`)

for (const m of remaining) {
  const [hg, ag] = simGroup(m.home, m.away)
  const res = await fetch(`${BASE}/match_results`, {
    method: 'POST', headers: h,
    body: JSON.stringify({ home_team: m.home, away_team: m.away, home_goals: hg, away_goals: ag, stage: 'group' })
  })
  if (res.ok) {
    console.log(`  Gr.${m.group}: ${m.home} ${hg}–${ag} ${m.away}`)
    allResults.push({ home_team: m.home, away_team: m.away, home_goals: hg, away_goals: ag })
    existingSet.add(`${m.home}|${m.away}`)
    existingSet.add(`${m.away}|${m.home}`)
  } else {
    console.error(`  ❌ ${m.home} vs ${m.away}: ${await res.text()}`)
  }
}

// ── Beregn gruppestandings ────────────────────────────────────────────────────
console.log('\nBeregner gruppestandings...')

const groups = {}
for (const m of ALL_GROUP_MATCHES) {
  if (!groups[m.group]) groups[m.group] = new Set()
  groups[m.group].add(m.home)
  groups[m.group].add(m.away)
}

function getStandings(group, teams, results) {
  const stats = {}
  for (const t of teams) stats[t] = { pts: 0, gd: 0, gf: 0 }

  // Dedupliser: kun én kamp per par (første i rekkefølgen er kanonisk)
  const seen = new Set()
  for (const m of results) {
    const pairKey = [m.home_team, m.away_team].sort().join('|')
    if (seen.has(pairKey)) continue
    // Kun group-stage-kamper mellom lag i denne gruppen
    const isGroupMatch = teams.has(m.home_team) && teams.has(m.away_team)
    if (!isGroupMatch) continue
    seen.add(pairKey)

    const hg = m.home_goals, ag = m.away_goals
    stats[m.home_team].gf += hg
    stats[m.away_team].gf += ag
    stats[m.home_team].gd += hg - ag
    stats[m.away_team].gd += ag - hg
    if (hg > ag) { stats[m.home_team].pts += 3 }
    else if (hg === ag) { stats[m.home_team].pts += 1; stats[m.away_team].pts += 1 }
    else { stats[m.away_team].pts += 3 }
  }

  return Object.entries(stats)
    .sort((a, b) => b[1].pts - a[1].pts || b[1].gd - a[1].gd || b[1].gf - a[1].gf)
    .map(([name, s]) => ({ name, ...s, group }))
}

const standings = {}
for (const [grp, teams] of Object.entries(groups)) {
  standings[grp] = getStandings(grp, teams, allResults)
}

// Top 2 fra hver gruppe = 24 team
const top2 = []
const thirdPlace = []
for (const [grp, rows] of Object.entries(standings)) {
  top2.push(rows[0], rows[1])
  thirdPlace.push(rows[2])
}

// 8 beste tredjeplasser = 32 totalt til R32
thirdPlace.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
const best8Third = thirdPlace.slice(0, 8)

const r32Teams = [...top2, ...best8Third]
console.log(`\n${r32Teams.length} lag videre til R32:`)
for (const t of r32Teams) console.log(`  ${t.group}: ${t.name} (${t.pts}p, GD ${t.gd})`)

// ── Upsert advancement for alle 32 videre ────────────────────────────────────
console.log('\nOppdaterer advancement-tabell...')
const advRows = r32Teams.map(t => ({ team_name: t.name, stage_reached: 'group' }))
const advRes = await fetch(`${BASE}/advancement`, {
  method: 'POST',
  headers: { ...h, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
  body: JSON.stringify(advRows)
})
if (!advRes.ok) console.error('Advancement upsert feil:', await advRes.text())
else console.log(`${advRows.length} advancement-rader oppdatert (stage: group)`)

// ── Simuler 8 av 16-delfinaler ────────────────────────────────────────────────
console.log('\nSimulerer 8 R32-kamper:')

// Bland og par opp 32 lag i 16 par, ta de 8 første
const shuffled = [...r32Teams].sort(() => Math.random() - 0.5)
const r32Pairs = []
for (let i = 0; i < shuffled.length; i += 2) {
  r32Pairs.push([shuffled[i], shuffled[i + 1]])
}
const toPlay = r32Pairs.slice(0, 8)

const r32Winners = []
for (const [teamA, teamB] of toPlay) {
  const [hg, ag] = simKnockout(teamA.name, teamB.name)
  const winner = hg > ag ? teamA : teamB

  const res = await fetch(`${BASE}/match_results`, {
    method: 'POST',
    headers: { ...h, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ home_team: teamA.name, away_team: teamB.name, home_goals: hg, away_goals: ag, stage: 'r32' })
  })
  if (res.ok) {
    console.log(`  R32: ${teamA.name} ${hg}–${ag} ${teamB.name} → ${winner.name} videre`)
    r32Winners.push(winner)
  } else {
    console.error(`  ❌ ${teamA.name} vs ${teamB.name}: ${await res.text()}`)
  }
}

// Oppdater advancement for R32-vinnere
for (const winner of r32Winners) {
  const patchRes = await fetch(`${BASE}/advancement?team_name=eq.${encodeURIComponent(winner.name)}`, {
    method: 'PATCH', headers: h,
    body: JSON.stringify({ stage_reached: 'r32' })
  })
  if (!patchRes.ok) console.error(`Advancement patch feil for ${winner.name}`)
}
console.log(`\n✓ ${r32Winners.length} R32-vinnere oppdatert i advancement`)
console.log('\nSim ferdig. Sjekk /leaderboard og /deltaker/[id]')
