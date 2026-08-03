// Beregner grupperesultater og populerer advancement-tabellen
// Kjør: node scripts/sim-advancement.mjs
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xd2NmdG11ZHdydmtnZmR1eXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Mzk2NzksImV4cCI6MjA5NDMxNTY3OX0.YFzmFg6VfI2EChNj8PfXsFmOAb0B2ZzOsIns2eCfwPo'
const BASE = 'https://oqwcftmudwrvkgfduyve.supabase.co/rest/v1'
const h = { 'apikey': ANON, 'Authorization': `Bearer ${ANON}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' }

// Gruppe-tilhørighet fra schedule.ts
const TEAM_GROUP = {
  'Mexico': 'A', 'Sør-Afrika': 'A', 'Sør-Korea': 'A', 'Tsjekkia': 'A',
  'Canada': 'B', 'Bosnia-Hercegovina': 'B', 'Qatar': 'B', 'Sveits': 'B',
  'Brasil': 'C', 'Marokko': 'C', 'Haiti': 'C', 'Skottland': 'C',
  'USA': 'D', 'Paraguay': 'D', 'Australia': 'D', 'Tyrkia': 'D',
  'Tyskland': 'E', 'Curaçao': 'E', 'Elfenbenskysten': 'E', 'Ecuador': 'E',
  'Nederland': 'F', 'Japan': 'F', 'Sverige': 'F', 'Tunisia': 'F',
  'Belgia': 'G', 'Egypt': 'G', 'Iran': 'G', 'New Zealand': 'G',
  'Spania': 'H', 'Kapp Verde': 'H', 'Saudi-Arabia': 'H', 'Uruguay': 'H',
  'Frankrike': 'I', 'Senegal': 'I', 'Irak': 'I', 'Norge': 'I',
  'Argentina': 'J', 'Algerie': 'J', 'Østerrike': 'J', 'Jordan': 'J',
  'Portugal': 'K', 'Congo DR': 'K', 'Usbekistan': 'K', 'Colombia': 'K',
  'England': 'L', 'Kroatia': 'L', 'Ghana': 'L', 'Panama': 'L',
}

console.log('Henter gruppespillresultater...')
const res = await fetch(`${BASE}/match_results?stage=eq.group&select=home_team,away_team,home_goals,away_goals`, { headers: h })
const matches = await res.json()
console.log(`${matches.length} kamper hentet\n`)

// Bygg stillingstabell
const stats = {}
function getStats(team) {
  if (!stats[team]) stats[team] = { team, group: TEAM_GROUP[team] ?? '?', pts: 0, gd: 0, gf: 0, ga: 0 }
  return stats[team]
}

for (const m of matches) {
  const h_ = getStats(m.home_team)
  const a_ = getStats(m.away_team)
  h_.gf += m.home_goals; h_.ga += m.away_goals; h_.gd += m.home_goals - m.away_goals
  a_.gf += m.away_goals; a_.ga += m.home_goals; a_.gd += m.away_goals - m.home_goals
  if (m.home_goals > m.away_goals) { h_.pts += 3 }
  else if (m.home_goals === m.away_goals) { h_.pts += 1; a_.pts += 1 }
  else { a_.pts += 3 }
}

// Sorter: poeng → målforskjell → scorede mål
function sortTeams(teams) {
  return [...teams].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || Math.random() - 0.5)
}

// Grupper
const groups = {}
for (const s of Object.values(stats)) {
  if (!groups[s.group]) groups[s.group] = []
  groups[s.group].push(s)
}

const advancing = []
const thirdPlace = []

for (const [grp, teams] of Object.entries(groups).sort()) {
  const sorted = sortTeams(teams)
  advancing.push(sorted[0], sorted[1])
  if (sorted[2]) thirdPlace.push(sorted[2])

  console.log(`Gruppe ${grp}:`)
  for (const t of sorted) {
    const marker = sorted.indexOf(t) < 2 ? '✓' : ' '
    console.log(`  ${marker} ${t.team.padEnd(22)} ${t.pts}p  ${t.gd >= 0 ? '+' : ''}${t.gd}  ${t.gf}:${t.ga}`)
  }
  console.log()
}

// 8 beste 3.-plasserte
const best8Third = sortTeams(thirdPlace).slice(0, 8)
const allAdvancing = [...advancing, ...best8Third]

console.log(`Beste 3.-plasserte (8 av ${thirdPlace.length}):`)
for (const t of best8Third) {
  console.log(`  ✓ ${t.team} (Gruppe ${t.group}) — ${t.pts}p, GD ${t.gd >= 0 ? '+' : ''}${t.gd}`)
}
console.log()

// Post advancement-rader
const advRows = allAdvancing.map(t => ({ team_name: t.team, stage_reached: 'group' }))
console.log(`Poster ${advRows.length} advancement-rader...`)
const advRes = await fetch(`${BASE}/advancement`, {
  method: 'POST',
  headers: { ...h, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
  body: JSON.stringify(advRows),
})

if (!advRes.ok) {
  const txt = await advRes.text()
  console.error('Feil:', advRes.status, txt)
  process.exit(1)
}

console.log(`✓ ${advRows.length} lag registrert som videre fra gruppespillet`)
console.log('\nKjør nå: node scripts/simulate-r32.mjs  →  for å simulere 1/16-finalene')
