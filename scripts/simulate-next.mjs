// Simulerer N kamper i gitt knockout-stage
// Kjør: node scripts/simulate-next.mjs <stage> <count>
// Stages: r32, r16, qf, sf
// Eksempel: node scripts/simulate-next.mjs r32 15

import { simKnockout } from './sim-strength.mjs'

const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xd2NmdG11ZHdydmtnZmR1eXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Mzk2NzksImV4cCI6MjA5NDMxNTY3OX0.YFzmFg6VfI2EChNj8PfXsFmOAb0B2ZzOsIns2eCfwPo'
const BASE = 'https://oqwcftmudwrvkgfduyve.supabase.co/rest/v1'
const h = { 'apikey': ANON, 'Authorization': `Bearer ${ANON}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' }

const PREV_STAGE = { r32: 'group', r16: 'r32', qf: 'r16', sf: 'qf' }
const STAGE_LABEL = { r32: '1/16', r16: '1/8', qf: 'QF', sf: 'SF' }

// ── R32 bracket-draw-logikk (speilbilde av src/data/bracket-draw.ts) ─────────

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
  if (!teams) return []
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
    const groupMatches = matches.filter(m =>
      (!m.stage || m.stage === 'group') &&
      VM_GROUPS[letter].includes(m.home_team) &&
      VM_GROUPS[letter].includes(m.away_team)
    )
    if (groupMatches.length >= 6) {
      result.set(letter, calcGroupStandings(letter, matches))
    }
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

// Build R32 pairs using the official draw, mirroring buildBracket()'s two-pass logic
function buildR32Pairs(allMatches) {
  const confirmedPos = getConfirmedPositions(allMatches)
  const confirmed3rd = getConfirmed3rdPlaces(allMatches)

  const playedInR32 = new Set(
    allMatches.filter(m => m.stage === 'r32').flatMap(m => [m.home_team, m.away_team])
  )

  const pairs = []
  const orphaned = []
  const processed = new Set()

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

  // Pair orphans together alphabetically
  orphaned.sort((a, b) => a.localeCompare(b))
  for (let i = 0; i + 1 < orphaned.length; i += 2) {
    pairs.push([orphaned[i], orphaned[i + 1]])
  }

  return pairs
}

function getWinner(match) {
  if (match.home_goals > match.away_goals) return match.home_team
  if (match.away_goals > match.home_goals) return match.away_team
  return null // draw shouldn't happen in knockout
}

function getR32DrawIndex(homeTeam, awayTeam, allMatches) {
  const confirmed = getConfirmedPositions(allMatches)
  const thirds = getConfirmed3rdPlaces(allMatches)
  const homeSlot = findTeamR32Slot(homeTeam, confirmed, thirds)
  const awaySlot = findTeamR32Slot(awayTeam, confirmed, thirds)
  if (!homeSlot || !awaySlot) return -1
  return R32_DRAW.findIndex(d =>
    (d.home === homeSlot && d.away === awaySlot) ||
    (d.home === awaySlot && d.away === homeSlot)
  )
}

function findTeamR32Slot(teamName, confirmed, thirds) {
  for (const [letter, standings] of confirmed) {
    const idx = standings.findIndex(s => s.team === teamName)
    if (idx === 0) return `1${letter}`
    if (idx === 1) return `2${letter}`
    if (idx === 2) {
      for (const [slotPos, team] of thirds) {
        if (team === teamName) return slotPos
      }
      return null
    }
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────

const stage = process.argv[2]
const count = parseInt(process.argv[3] ?? '99')

if (!PREV_STAGE[stage]) {
  console.error(`❌ Ugyldig stage: ${stage}. Gyldige: r32, r16, qf, sf`)
  process.exit(1)
}

const label = STAGE_LABEL[stage]

// Fetch all match results (needed for group standings in r32 case)
const allMatchesRes = await fetch(`${BASE}/match_results?select=home_team,away_team,home_goals,away_goals,stage`, { headers: h })
const allMatches = await allMatchesRes.json()

let pairs // [[home, away], ...]

if (stage === 'r32') {
  // Use the real FIFA draw
  const advRes = await fetch(`${BASE}/advancement?stage_reached=eq.group&select=team_name`, { headers: h })
  const advanced = new Set((await advRes.json()).map(r => r.team_name))

  pairs = buildR32Pairs(allMatches).filter(([home, away]) => advanced.has(home) && advanced.has(away))

  if (pairs.length === 0) {
    console.log('Ingen R32-par klare ennå — er alle grupper ferdige og advancement kjørt?')
    process.exit(0)
  }
} else {
  // R16/QF/SF: use bracket-chain ordering — pairs derived from previous stage sorted by draw index
  const prevStage = PREV_STAGE[stage]
  const prevResults = allMatches.filter(m => m.stage === prevStage && m.home_goals != null)

  // Sort previous stage results by draw index
  let prevSorted
  if (prevStage === 'r32') {
    prevSorted = [...prevResults].sort((a, b) => {
      const ia = getR32DrawIndex(a.home_team, a.away_team, allMatches)
      const ib = getR32DrawIndex(b.home_team, b.away_team, allMatches)
      return ia - ib
    })
  } else {
    // r16/qf inherit order from insertion order in DB (which follows bracket chain)
    prevSorted = prevResults
  }

  const alreadyPlayed = new Set(
    allMatches.filter(m => m.stage === stage).flatMap(m => [m.home_team, m.away_team])
  )

  // Build pairs from adjacent winners in sorted previous stage
  pairs = []
  for (let i = 0; i + 1 < prevSorted.length; i += 2) {
    const winA = getWinner(prevSorted[i])
    const winB = getWinner(prevSorted[i + 1])
    if (!winA || !winB) continue
    if (alreadyPlayed.has(winA) || alreadyPlayed.has(winB)) continue
    pairs.push([winA, winB])
  }

  if (pairs.length === 0) {
    console.log(`\nAlle ${label}-kamper er allerede spilt.`)
    process.exit(0)
  }
}

const totalPairs = pairs.length
const toSimulate = Math.min(count, totalPairs)

console.log(`${label}: ${totalPairs} par venter, simulerer ${toSimulate}:\n`)

const winners = []
for (let i = 0; i < toSimulate; i++) {
  const [home, away] = pairs[i]
  const [hg, ag] = simKnockout(home, away)
  const winner = hg > ag ? home : away

  const res = await fetch(`${BASE}/match_results`, {
    method: 'POST',
    headers: { ...h, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ home_team: home, away_team: away, home_goals: hg, away_goals: ag, stage })
  })
  if (res.ok) {
    console.log(`  ${label}: ${home} ${hg}–${ag} ${away}  →  ${winner} videre`)
    winners.push(winner)
  } else {
    console.error(`  ❌ ${home} vs ${away}: ${await res.text()}`)
  }
}

for (const w of winners) {
  await fetch(`${BASE}/advancement?team_name=eq.${encodeURIComponent(w)}`, {
    method: 'PATCH', headers: h,
    body: JSON.stringify({ stage_reached: stage })
  })
}

console.log(`\n✓ ${winners.length} vinnere oppdatert til stage: ${stage}`)
if (toSimulate < totalPairs) {
  console.log(`  (${totalPairs - toSimulate} kamp${totalPairs - toSimulate > 1 ? 'er' : ''} gjenstår i ${label})`)
}
