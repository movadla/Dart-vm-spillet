// Simulerer alle 104 VM-kamper med konfigurerbar forsinkelse mellom hver kamp
// Usage: node scripts/run-full-sim.mjs [delay_ms=600000]
// 104 kamper × 10 min = ~17,3 timer
//
// Steg: gruppespill (72) → gruppeopprykkberegning → R32 (16) → R16 (8) → QF (4) → SF (2) → Bronsefinale (1) → Finale (1)
//
// ADVARSEL: Ikke kjør sim-advancement.mjs etter at dette scriptet har startet knockout-fasen.

import { simGroup, simKnockout } from './sim-strength.mjs'

const DELAY = parseInt(process.argv[2] ?? '600000')
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xd2NmdG11ZHdydmtnZmR1eXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Mzk2NzksImV4cCI6MjA5NDMxNTY3OX0.YFzmFg6VfI2EChNj8PfXsFmOAb0B2ZzOsIns2eCfwPo'
const BASE = 'https://oqwcftmudwrvkgfduyve.supabase.co/rest/v1'
const h = { 'apikey': ANON, 'Authorization': `Bearer ${ANON}`, 'Content-Type': 'application/json' }

const sleep = ms => new Promise(r => setTimeout(r, ms))
const ts = () => new Date().toLocaleTimeString('nb', { hour12: false })
const eta = () => {
  const now = new Date()
  now.setMilliseconds(now.getMilliseconds() + DELAY)
  return now.toLocaleTimeString('nb', { hour12: false })
}

async function postMatch(home, away, hg, ag, stage) {
  const res = await fetch(`${BASE}/match_results`, {
    method: 'POST',
    headers: { ...h, 'Prefer': 'resolution=merge-duplicates,return=minimal', 'Content-Type': 'application/json' },
    body: JSON.stringify({ home_team: home, away_team: away, home_goals: hg, away_goals: ag, stage, played_at: new Date().toISOString() }),
  })
  if (!res.ok) console.error(`  ❌ POST ${home} vs ${away}: ${await res.text()}`)
}

async function patchAdvancement(team, stage) {
  const res = await fetch(`${BASE}/advancement?team_name=eq.${encodeURIComponent(team)}`, {
    method: 'PATCH',
    headers: { ...h, 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage_reached: stage }),
  })
  if (!res.ok) console.error(`  ❌ PATCH advancement ${team}: ${await res.text()}`)
}

async function upsertAdvancement(rows) {
  const res = await fetch(`${BASE}/advancement`, {
    method: 'POST',
    headers: { ...h, 'Prefer': 'resolution=merge-duplicates,return=minimal', 'Content-Type': 'application/json' },
    body: JSON.stringify(rows),
  })
  if (!res.ok) console.error(`  ❌ Upsert advancement: ${await res.text()}`)
}

// ── KAMPPLAN (72 gruppespillkamper i VM-rekkefølge) ───────────────────────────
const ALL_MATCHES = [
  { date: '2026-06-11', time: '21:00', home: 'Mexico',             away: 'Sør-Afrika',        group: 'A' },
  { date: '2026-06-12', time: '04:00', home: 'Sør-Korea',          away: 'Tsjekkia',           group: 'A' },
  { date: '2026-06-12', time: '21:00', home: 'Canada',             away: 'Bosnia-Hercegovina', group: 'B' },
  { date: '2026-06-13', time: '01:00', home: 'USA',                away: 'Paraguay',           group: 'D' },
  { date: '2026-06-13', time: '07:00', home: 'Australia',          away: 'Tyrkia',             group: 'D' },
  { date: '2026-06-13', time: '18:00', home: 'Qatar',              away: 'Sveits',             group: 'B' },
  { date: '2026-06-14', time: '00:00', home: 'Brasil',             away: 'Marokko',            group: 'C' },
  { date: '2026-06-14', time: '03:00', home: 'Haiti',              away: 'Skottland',          group: 'C' },
  { date: '2026-06-14', time: '18:00', home: 'Tyskland',           away: 'Curaçao',            group: 'E' },
  { date: '2026-06-14', time: '21:00', home: 'Nederland',          away: 'Japan',              group: 'F' },
  { date: '2026-06-15', time: '01:00', home: 'Elfenbenskysten',    away: 'Ecuador',            group: 'E' },
  { date: '2026-06-15', time: '03:00', home: 'Sverige',            away: 'Tunisia',            group: 'F' },
  { date: '2026-06-15', time: '18:00', home: 'Spania',             away: 'Kapp Verde',         group: 'H' },
  { date: '2026-06-15', time: '21:00', home: 'Belgia',             away: 'Egypt',              group: 'G' },
  { date: '2026-06-16', time: '00:00', home: 'Saudi-Arabia',       away: 'Uruguay',            group: 'H' },
  { date: '2026-06-16', time: '02:00', home: 'Argentina',          away: 'Algerie',            group: 'J' },
  { date: '2026-06-16', time: '03:00', home: 'Iran',               away: 'New Zealand',        group: 'G' },
  { date: '2026-06-16', time: '21:00', home: 'Frankrike',          away: 'Senegal',            group: 'I' },
  { date: '2026-06-17', time: '00:00', home: 'Irak',               away: 'Norge',              group: 'I' },
  { date: '2026-06-17', time: '03:00', home: 'Østerrike',          away: 'Jordan',             group: 'J' },
  { date: '2026-06-17', time: '18:00', home: 'Portugal',           away: 'Congo DR',           group: 'K' },
  { date: '2026-06-17', time: '21:00', home: 'England',            away: 'Kroatia',            group: 'L' },
  { date: '2026-06-18', time: '01:00', home: 'Usbekistan',         away: 'Colombia',           group: 'K' },
  { date: '2026-06-18', time: '03:00', home: 'Ghana',              away: 'Panama',             group: 'L' },
  { date: '2026-06-18', time: '18:00', home: 'Tsjekkia',           away: 'Sør-Afrika',         group: 'A' },
  { date: '2026-06-18', time: '18:00', home: 'Sveits',             away: 'Bosnia-Hercegovina', group: 'B' },
  { date: '2026-06-18', time: '21:00', home: 'Canada',             away: 'Qatar',              group: 'B' },
  { date: '2026-06-19', time: '03:00', home: 'Mexico',             away: 'Sør-Korea',          group: 'A' },
  { date: '2026-06-19', time: '21:00', home: 'USA',                away: 'Australia',          group: 'D' },
  { date: '2026-06-20', time: '00:00', home: 'Skottland',          away: 'Marokko',            group: 'C' },
  { date: '2026-06-20', time: '02:30', home: 'Brasil',             away: 'Haiti',              group: 'C' },
  { date: '2026-06-20', time: '03:00', home: 'Tyrkia',             away: 'Paraguay',           group: 'D' },
  { date: '2026-06-20', time: '18:00', home: 'Nederland',          away: 'Sverige',            group: 'F' },
  { date: '2026-06-20', time: '22:00', home: 'Tyskland',           away: 'Elfenbenskysten',    group: 'E' },
  { date: '2026-06-21', time: '01:00', home: 'Ecuador',            away: 'Curaçao',            group: 'E' },
  { date: '2026-06-21', time: '04:00', home: 'Tunisia',            away: 'Japan',              group: 'F' },
  { date: '2026-06-21', time: '18:00', home: 'Spania',             away: 'Saudi-Arabia',       group: 'H' },
  { date: '2026-06-21', time: '21:00', home: 'Belgia',             away: 'Iran',               group: 'G' },
  { date: '2026-06-22', time: '00:00', home: 'Uruguay',            away: 'Kapp Verde',         group: 'H' },
  { date: '2026-06-22', time: '03:00', home: 'New Zealand',        away: 'Egypt',              group: 'G' },
  { date: '2026-06-22', time: '18:00', home: 'Argentina',          away: 'Østerrike',          group: 'J' },
  { date: '2026-06-22', time: '23:00', home: 'Frankrike',          away: 'Irak',               group: 'I' },
  { date: '2026-06-23', time: '02:00', home: 'Norge',              away: 'Senegal',            group: 'I' },
  { date: '2026-06-23', time: '02:00', home: 'Jordan',             away: 'Algerie',            group: 'J' },
  { date: '2026-06-23', time: '18:00', home: 'Portugal',           away: 'Usbekistan',         group: 'K' },
  { date: '2026-06-23', time: '21:00', home: 'England',            away: 'Ghana',              group: 'L' },
  { date: '2026-06-24', time: '01:00', home: 'Colombia',           away: 'Congo DR',           group: 'K' },
  { date: '2026-06-24', time: '03:00', home: 'Panama',             away: 'Kroatia',            group: 'L' },
  { date: '2026-06-24', time: '18:00', home: 'Sveits',             away: 'Canada',             group: 'B' },
  { date: '2026-06-24', time: '18:00', home: 'Bosnia-Hercegovina', away: 'Qatar',              group: 'B' },
  { date: '2026-06-25', time: '00:00', home: 'Skottland',          away: 'Brasil',             group: 'C' },
  { date: '2026-06-25', time: '00:00', home: 'Marokko',            away: 'Haiti',              group: 'C' },
  { date: '2026-06-25', time: '03:00', home: 'Tsjekkia',           away: 'Mexico',             group: 'A' },
  { date: '2026-06-25', time: '03:00', home: 'Sør-Afrika',         away: 'Sør-Korea',          group: 'A' },
  { date: '2026-06-25', time: '22:00', home: 'Curaçao',            away: 'Elfenbenskysten',    group: 'E' },
  { date: '2026-06-25', time: '22:00', home: 'Ecuador',            away: 'Tyskland',           group: 'E' },
  { date: '2026-06-26', time: '00:00', home: 'Japan',              away: 'Sverige',            group: 'F' },
  { date: '2026-06-26', time: '01:00', home: 'Tyrkia',             away: 'USA',                group: 'D' },
  { date: '2026-06-26', time: '01:00', home: 'Paraguay',           away: 'Australia',          group: 'D' },
  { date: '2026-06-26', time: '03:00', home: 'Tunisia',            away: 'Nederland',          group: 'F' },
  { date: '2026-06-26', time: '21:00', home: 'Norge',              away: 'Frankrike',          group: 'I' },
  { date: '2026-06-26', time: '21:00', home: 'Senegal',            away: 'Irak',               group: 'I' },
  { date: '2026-06-26', time: '22:00', home: 'Kapp Verde',         away: 'Saudi-Arabia',       group: 'H' },
  { date: '2026-06-27', time: '01:00', home: 'Uruguay',            away: 'Spania',             group: 'H' },
  { date: '2026-06-27', time: '03:00', home: 'Algerie',            away: 'Østerrike',          group: 'J' },
  { date: '2026-06-27', time: '03:00', home: 'Jordan',             away: 'Argentina',          group: 'J' },
  { date: '2026-06-27', time: '05:00', home: 'Egypt',              away: 'Iran',               group: 'G' },
  { date: '2026-06-27', time: '05:00', home: 'New Zealand',        away: 'Belgia',             group: 'G' },
  { date: '2026-06-28', time: '01:00', home: 'Colombia',           away: 'Portugal',           group: 'K' },
  { date: '2026-06-28', time: '01:00', home: 'Congo DR',           away: 'Usbekistan',         group: 'K' },
  { date: '2026-06-28', time: '03:00', home: 'Panama',             away: 'England',            group: 'L' },
  { date: '2026-06-28', time: '03:00', home: 'Kroatia',            away: 'Ghana',              group: 'L' },
]

// ── VM-GRUPPER + R32-LODDTREKNING ─────────────────────────────────────────────
const VM_GROUPS = {
  A: ['Mexico', 'Sør-Afrika', 'Sør-Korea', 'Tsjekkia'],
  B: ['Canada', 'Sveits', 'Qatar', 'Bosnia-Hercegovina'],
  C: ['Brasil', 'Marokko', 'Haiti', 'Skottland'],
  D: ['USA', 'Paraguay', 'Australia', 'Tyrkia'],
  E: ['Tyskland', 'Curaçao', 'Elfenbenskysten', 'Ecuador'],
  F: ['Nederland', 'Japan', 'Sverige', 'Tunisia'],
  G: ['Belgia', 'Egypt', 'Iran', 'New Zealand'],
  H: ['Spania', 'Kapp Verde', 'Saudi-Arabia', 'Uruguay'],
  I: ['Frankrike', 'Senegal', 'Irak', 'Norge'],
  J: ['Argentina', 'Algerie', 'Østerrike', 'Jordan'],
  K: ['Portugal', 'Congo DR', 'Usbekistan', 'Colombia'],
  L: ['England', 'Kroatia', 'Ghana', 'Panama'],
}

const R32_DRAW = [
  { home: '2A', away: '2B'     },
  { home: '1C', away: '2F'     },
  { home: '1E', away: '3ABCDF' },
  { home: '1F', away: '2C'     },
  { home: '2E', away: '2I'     },
  { home: '1A', away: '3CEFHI' },
  { home: '1J', away: '2H'     },
  { home: '2D', away: '2G'     },
  { home: '1D', away: '3BEFIJ' },
  { home: '1G', away: '3AEHIJ' },
  { home: '1H', away: '2J'     },
  { home: '2K', away: '2L'     },
  { home: '1B', away: '3EFGIJ' },
  { home: '1I', away: '3CDFGH' },
  { home: '1K', away: '3DEIJL' },
  { home: '1L', away: '3EHIJK' },
]

const THIRD_SLOTS = R32_DRAW
  .flatMap(m => [m.home, m.away])
  .filter(p => p.startsWith('3'))
  .map(p => ({ pos: p, groups: p.slice(1).split('') }))

function calcGroupStandings(letter, matches) {
  const teams = VM_GROUPS[letter]
  const s = {}
  for (const t of teams) s[t] = { team: t, pts: 0, gd: 0, gf: 0 }
  for (const m of matches) {
    if (!teams.includes(m.home_team) || !teams.includes(m.away_team)) continue
    if (m.stage && m.stage !== 'group') continue
    const hg = m.home_goals, ag = m.away_goals
    s[m.home_team].gf += hg; s[m.away_team].gf += ag
    s[m.home_team].gd += hg - ag; s[m.away_team].gd += ag - hg
    if (hg > ag) s[m.home_team].pts += 3
    else if (hg === ag) { s[m.home_team].pts += 1; s[m.away_team].pts += 1 }
    else s[m.away_team].pts += 3
  }
  return Object.values(s).sort((a, b) => (b.pts - a.pts) || (b.gd - a.gd) || (b.gf - a.gf))
}

function getConfirmedPositions(matches) {
  const result = new Map()
  for (const letter of Object.keys(VM_GROUPS)) {
    const gm = matches.filter(m =>
      (!m.stage || m.stage === 'group') &&
      VM_GROUPS[letter].includes(m.home_team) &&
      VM_GROUPS[letter].includes(m.away_team)
    )
    if (gm.length >= 6) result.set(letter, calcGroupStandings(letter, matches))
  }
  return result
}

function assign3rdPlaces(qualifying) {
  const result = new Map()
  function solve(si, rem) {
    if (si === THIRD_SLOTS.length) return rem.length === 0
    const slot = THIRD_SLOTS[si]
    for (const q of rem) {
      if (slot.groups.includes(q.group)) {
        result.set(slot.pos, q.team)
        if (solve(si + 1, rem.filter(r => r !== q))) return true
        result.delete(slot.pos)
      }
    }
    return false
  }
  solve(0, qualifying)
  return result
}

function getConfirmed3rdPlaces(matches) {
  const confirmed = getConfirmedPositions(matches)
  if (confirmed.size < 12) return new Map()
  const all3rd = Array.from(confirmed.entries()).map(([letter, standings]) => ({
    group: letter, team: standings[2].team,
    pts: standings[2].pts, gd: standings[2].gd, gf: standings[2].gf,
  }))
  all3rd.sort((a, b) => (b.pts - a.pts) || (b.gd - a.gd) || (b.gf - a.gf))
  return assign3rdPlaces(all3rd.slice(0, 8).map(t => ({ group: t.group, team: t.team })))
}

function resolvePos(pos, confirmed, thirds) {
  if (pos.startsWith('3')) return thirds.get(pos) ?? null
  const rankIdx = parseInt(pos[0]) - 1
  const group = pos.slice(1)
  return confirmed.get(group)?.[rankIdx]?.team ?? null
}

function buildR32Pairs(allMatches) {
  const confirmedPos = getConfirmedPositions(allMatches)
  const confirmed3rd = getConfirmed3rdPlaces(allMatches)
  const playedInR32 = new Set(
    allMatches.filter(m => m.stage === 'r32').flatMap(m => [m.home_team, m.away_team])
  )
  const pairs = [], orphaned = [], processed = new Set()
  for (const draw of R32_DRAW) {
    const homeName = resolvePos(draw.home, confirmedPos, confirmed3rd)
    const awayName = resolvePos(draw.away, confirmedPos, confirmed3rd)
    const homeReady = !!homeName && !playedInR32.has(homeName) && !processed.has(homeName)
    const awayReady = !!awayName && !playedInR32.has(awayName) && !processed.has(awayName)
    if (homeReady && awayReady) {
      pairs.push([homeName, awayName])
      processed.add(homeName); processed.add(awayName)
    } else {
      if (homeReady) { orphaned.push(homeName); processed.add(homeName) }
      if (awayReady) { orphaned.push(awayName); processed.add(awayName) }
    }
  }
  orphaned.sort((a, b) => a.localeCompare(b))
  for (let i = 0; i + 1 < orphaned.length; i += 2) pairs.push([orphaned[i], orphaned[i + 1]])
  return pairs
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

const delaySec = Math.round(DELAY / 1000)
const delayMin = Math.round(DELAY / 60000)
console.log(`\n🏆 Full VM 2026-simulering — ${delayMin > 0 ? delayMin + ' min' : delaySec + ' sek'} mellom kamper`)
console.log(`   104 kamper estimert ferdig om ${Math.round(104 * DELAY / 3600000 * 10) / 10} timer\n`)

// ── FASE 1: GRUPPESPILL (72 kamper) ──────────────────────────────────────────
console.log('══ FASE 1: GRUPPESPILL (72 kamper) ══\n')

const existingRes = await fetch(`${BASE}/match_results?stage=eq.group&select=home_team,away_team`, { headers: h })
const existingGroup = await existingRes.json()
const playedSet = new Set(existingGroup.flatMap(m => [`${m.home_team}|${m.away_team}`, `${m.away_team}|${m.home_team}`]))
const remaining = ALL_MATCHES.filter(m => !playedSet.has(`${m.home}|${m.away}`))

if (remaining.length === 0) {
  console.log('  Alle 72 gruppespillkamper er allerede spilt — hopper til fase 2.\n')
} else {
  let first = true
  for (const m of remaining) {
    if (!first) {
      console.log(`  [${ts()}] Neste kamp om ${delayMin > 0 ? delayMin + ' min' : delaySec + ' sek'} (ca. ${eta()})...`)
      await sleep(DELAY)
    }
    first = false
    const [hg, ag] = simGroup(m.home, m.away)
    await postMatch(m.home, m.away, hg, ag, 'group')
    console.log(`  [${ts()}] Gr.${m.group}: ${m.home} ${hg}–${ag} ${m.away}`)
  }
}

// ── FASE 2: GRUPPEOPPRYKKBEREGNING ───────────────────────────────────────────
console.log('\n══ FASE 2: GRUPPEOPPRYKKBEREGNING ══\n')

const allGroupRes = await fetch(`${BASE}/match_results?stage=eq.group&select=home_team,away_team,home_goals,away_goals,stage`, { headers: h })
const allGroupMatches = await allGroupRes.json()
const confirmedPos = getConfirmedPositions(allGroupMatches)

if (confirmedPos.size < 12) {
  console.error(`❌ Bare ${confirmedPos.size}/12 grupper er fullspilt. Avbryter.`)
  process.exit(1)
}

const all3rd = Array.from(confirmedPos.entries()).map(([letter, standings]) => ({
  group: letter, team: standings[2].team,
  pts: standings[2].pts, gd: standings[2].gd, gf: standings[2].gf,
}))
all3rd.sort((a, b) => (b.pts - a.pts) || (b.gd - a.gd) || (b.gf - a.gf))
const top8Third = all3rd.slice(0, 8)

const advRows = []
for (const [letter, standings] of confirmedPos) {
  advRows.push({ team_name: standings[0].team, stage_reached: 'group' })
  advRows.push({ team_name: standings[1].team, stage_reached: 'group' })
  console.log(`  Gruppe ${letter}: ${standings[0].team} (1.) og ${standings[1].team} (2.) videre`)
}
for (const t of top8Third) {
  advRows.push({ team_name: t.team, stage_reached: 'group' })
  console.log(`  3. plass ${t.group}: ${t.team} — ${t.pts}p, GD ${t.gd >= 0 ? '+' : ''}${t.gd} (videre)`)
}

await upsertAdvancement(advRows)
console.log(`\n  ✓ ${advRows.length} lag registrert som videre fra gruppespillet`)

// ── FASE 3: R32 (16 kamper) ──────────────────────────────────────────────────
console.log('\n══ FASE 3: 1/16-FINALE (16 kamper) ══\n')

const allMatchesForR32 = await fetch(`${BASE}/match_results?select=home_team,away_team,home_goals,away_goals,stage`, { headers: h }).then(r => r.json())
const r32Pairs = buildR32Pairs(allMatchesForR32)

if (r32Pairs.length === 0) {
  console.log('  Ingen R32-par klare ennå.')
} else {
  const r32Winners = []
  for (let i = 0; i < r32Pairs.length; i++) {
    const [home, away] = r32Pairs[i]
    console.log(`  [${ts()}] Neste kamp om ${delayMin > 0 ? delayMin + ' min' : delaySec + ' sek'}...`)
    await sleep(DELAY)
    const [hg, ag] = simKnockout(home, away)
    const winner = hg > ag ? home : away
    await postMatch(home, away, hg, ag, 'r32')
    await patchAdvancement(winner, 'r32')
    console.log(`  [${ts()}] 1/16: ${home} ${hg}–${ag} ${away}  →  ${winner} videre`)
    r32Winners.push(winner)
  }
  console.log(`\n  ✓ ${r32Winners.length} R32-vinnere`)
}

// ── FASE 4: R16 (8 kamper) ───────────────────────────────────────────────────
console.log('\n══ FASE 4: 1/8-FINALE (8 kamper) ══\n')

const allMatchesForR16 = await fetch(`${BASE}/match_results?select=home_team,away_team,home_goals,away_goals,stage`, { headers: h }).then(r => r.json())
const r32Results = allMatchesForR16.filter(m => m.stage === 'r32' && m.home_goals != null)

function getR32DrawIndex(homeTeam, awayTeam, allMatches) {
  const confirmed = getConfirmedPositions(allMatches)
  const thirds = getConfirmed3rdPlaces(allMatches)
  function findSlot(name) {
    for (const [letter, standings] of confirmed) {
      const idx = standings.findIndex(s => s.team === name)
      if (idx === 0) return `1${letter}`
      if (idx === 1) return `2${letter}`
      if (idx === 2) { for (const [sp, t] of thirds) { if (t === name) return sp } return null }
    }
    return null
  }
  const hs = findSlot(homeTeam), as = findSlot(awayTeam)
  if (!hs || !as) return -1
  return R32_DRAW.findIndex(d => (d.home === hs && d.away === as) || (d.home === as && d.away === hs))
}

const r32Sorted = [...r32Results].sort((a, b) =>
  getR32DrawIndex(a.home_team, a.away_team, allMatchesForR16) -
  getR32DrawIndex(b.home_team, b.away_team, allMatchesForR16)
)

const r16Winners = []
for (let i = 0; i + 1 < r32Sorted.length; i += 2) {
  const winA = r32Sorted[i].home_goals > r32Sorted[i].away_goals ? r32Sorted[i].home_team : r32Sorted[i].away_team
  const winB = r32Sorted[i+1].home_goals > r32Sorted[i+1].away_goals ? r32Sorted[i+1].home_team : r32Sorted[i+1].away_team
  console.log(`  [${ts()}] Neste kamp om ${delayMin > 0 ? delayMin + ' min' : delaySec + ' sek'}...`)
  await sleep(DELAY)
  const [hg, ag] = simKnockout(winA, winB)
  const winner = hg > ag ? winA : winB
  await postMatch(winA, winB, hg, ag, 'r16')
  await patchAdvancement(winner, 'r16')
  console.log(`  [${ts()}] 1/8: ${winA} ${hg}–${ag} ${winB}  →  ${winner} videre`)
  r16Winners.push(winner)
}
console.log(`\n  ✓ ${r16Winners.length} R16-vinnere`)

// ── FASE 5: QF (4 kamper) ────────────────────────────────────────────────────
console.log('\n══ FASE 5: KVARTFINALE (4 kamper) ══\n')

const qfWinners = []
for (let i = 0; i + 1 < r16Winners.length; i += 2) {
  const [home, away] = [r16Winners[i], r16Winners[i+1]]
  console.log(`  [${ts()}] Neste kamp om ${delayMin > 0 ? delayMin + ' min' : delaySec + ' sek'}...`)
  await sleep(DELAY)
  const [hg, ag] = simKnockout(home, away)
  const winner = hg > ag ? home : away
  await postMatch(home, away, hg, ag, 'qf')
  await patchAdvancement(winner, 'qf')
  console.log(`  [${ts()}] QF: ${home} ${hg}–${ag} ${away}  →  ${winner} videre`)
  qfWinners.push(winner)
}
console.log(`\n  ✓ ${qfWinners.length} QF-vinnere`)

// ── FASE 6: SF (2 kamper) ────────────────────────────────────────────────────
console.log('\n══ FASE 6: SEMIFINALE (2 kamper) ══\n')

const sfWinners = [], sfLosers = []
for (let i = 0; i + 1 < qfWinners.length; i += 2) {
  const [home, away] = [qfWinners[i], qfWinners[i+1]]
  console.log(`  [${ts()}] Neste kamp om ${delayMin > 0 ? delayMin + ' min' : delaySec + ' sek'}...`)
  await sleep(DELAY)
  const [hg, ag] = simKnockout(home, away)
  const winner = hg > ag ? home : away
  const loser  = hg > ag ? away  : home
  await postMatch(home, away, hg, ag, 'sf')
  await patchAdvancement(winner, 'sf')
  console.log(`  [${ts()}] SF: ${home} ${hg}–${ag} ${away}  →  ${winner} videre`)
  sfWinners.push(winner)
  sfLosers.push(loser)
}
console.log(`\n  ✓ Finalister: ${sfWinners.join(' og ')}`)
console.log(`  ✓ Bronsekamp: ${sfLosers.join(' mot ')}`)

// ── FASE 7: BRONSEFINALE ─────────────────────────────────────────────────────
console.log('\n══ FASE 7: BRONSEFINALE ══\n')

console.log(`  [${ts()}] Neste kamp om ${delayMin > 0 ? delayMin + ' min' : delaySec + ' sek'}...`)
await sleep(DELAY)
{
  const [home, away] = sfLosers
  const [hg, ag] = simKnockout(home, away)
  const bronze = hg > ag ? home : away
  await postMatch(home, away, hg, ag, 'bronze')
  await patchAdvancement(bronze, 'bronze')
  console.log(`  [${ts()}] Bronsefinale: ${home} ${hg}–${ag} ${away}  →  🥉 ${bronze}`)
}

// ── FASE 8: FINALE ───────────────────────────────────────────────────────────
console.log('\n══ FASE 8: FINALE ══\n')

console.log(`  [${ts()}] Neste kamp om ${delayMin > 0 ? delayMin + ' min' : delaySec + ' sek'}...`)
await sleep(DELAY)
{
  const [home, away] = sfWinners
  const [hg, ag] = simKnockout(home, away)
  const gold   = hg > ag ? home : away
  const silver = hg > ag ? away  : home
  await postMatch(home, away, hg, ag, 'final')
  await patchAdvancement(gold,   'gold')
  await patchAdvancement(silver, 'silver')
  console.log(`  [${ts()}] Finale: ${home} ${hg}–${ag} ${away}`)
  console.log(`  🥇 ${gold}  🥈 ${silver}`)
}

console.log('\n🏁 VM-simulering fullført!\n')
