// WC 2026 Monte Carlo simulation
// Scoring: win=3, draw=1, goal=1 | adv: group=6, r32=10, r16=15, qf=22, sf=30, winner=45
// Multipliers: pot 1-4 = 1x, pot 5-6 = 2x, pot 7-8 = 3x

const SCORING = {
  win: 3, draw: 1, goal: 1,
  adv: { group: 6, r32: 10, r16: 15, qf: 22, sf: 30, winner: 45 },
}
const ADV_CUM = {
  group_out: 0,
  group:  6,
  r32:    6+10,
  r16:    6+10+15,
  qf:     6+10+15+22,
  sf:     6+10+15+22+30,
  final:  6+10+15+22+30,      // finalist who lost
  winner: 6+10+15+22+30+45,
}

const mult = p => p <= 4 ? 1 : p <= 6 ? 2 : 3

const TEAMS = [
  ['Frankrike',1,'I',5.5],['Spania',1,'H',6.0],['England',1,'L',7.5],
  ['Brasil',2,'C',9.0],['Argentina',2,'J',9.5],['Portugal',2,'K',11.0],['Tyskland',2,'E',15.0],
  ['Nederland',3,'F',21.0],['Norge',3,'I',26.0],['Belgia',3,'G',34.0],['USA',3,'D',41.0],['Colombia',3,'K',41.0],
  ['Uruguay',4,'H',51.0],['Marokko',4,'C',51.0],['Japan',4,'F',51.0],['Mexico',4,'A',76.0],['Sverige',4,'F',76.0],['Kroatia',4,'L',81.0],
  ['Sveits',5,'B',81.0],['Ecuador',5,'E',91.0],['Senegal',5,'I',101.0],['Tyrkia',5,'D',101.0],['Østerrike',5,'J',101.0],['Canada',5,'B',151.0],['Paraguay',5,'D',151.0],
  ['Algerie',6,'J',201.0],['Tsjekkia',6,'A',201.0],['Elfenbenskysten',6,'E',201.0],
  ['Sør-Korea',6,'A',251.0],['Egypt',6,'G',251.0],['Skottland',6,'C',251.0],['Ghana',6,'L',251.0],
  ['Bosnia',7,'B',251.0],['Iran',7,'G',501.0],['Australia',7,'D',501.0],['Tunisia',7,'F',501.0],
  ['Congo',7,'K',751.0],['Saudi-Arabia',7,'H',1001.0],['New Zealand',7,'G',1001.0],['Qatar',7,'B',1001.0],
  ['Irak',8,'I',1001.0],['Jordan',8,'J',1001.0],['Kapp Verde',8,'H',1001.0],['Usbekistan',8,'K',1001.0],
  ['Panama',8,'L',1001.0],['Sør-Afrika',8,'A',1001.0],['Curaçao',8,'E',2501.0],['Haiti',8,'C',2501.0],
].map(([name,pot,group,odds]) => ({ name, pot, group, odds, str: 1/odds }))

const byName = Object.fromEntries(TEAMS.map(t => [t.name, t]))
const byGroup = {}
for (const t of TEAMS) { if (!byGroup[t.group]) byGroup[t.group]=[]; byGroup[t.group].push(t.name) }

// Poisson random
function poisson(lam) {
  if (lam <= 0) return 0
  const L = Math.exp(-lam); let p=1, k=0
  do { k++; p *= Math.random() } while (p > L)
  return k-1
}

// Simulate 90-min match → [goalsA, goalsB]
function simMatch(a, b) {
  const sa=byName[a].str, sb=byName[b].str, tot=sa+sb
  const xgA = 2.7 * sa/tot, xgB = 2.7 * sb/tot
  return [poisson(xgA), poisson(xgB)]
}

// Knockout match (add ET/pens if draw)
function simKnockout(a, b) {
  let [ga, gb] = simMatch(a, b)
  if (ga === gb) {
    const sa=byName[a].str, sb=byName[b].str
    // 50/50 weighted by strength for pens
    if (Math.random() < sa/(sa+sb)) ga++; else gb++
  }
  return ga > gb ? [a, b, ga, gb] : [b, a, gb, ga] // [winner, loser, wGoals, lGoals]
}

function runTournament() {
  const pts   = Object.fromEntries(TEAMS.map(t => [t.name, 0]))   // match pts
  const stage = Object.fromEntries(TEAMS.map(t => [t.name, null]))
  const stand = Object.fromEntries(TEAMS.map(t => [t.name, {p:0,gd:0,gf:0}]))

  // ── GROUP STAGE ──
  for (const members of Object.values(byGroup)) {
    for (let i=0; i<members.length; i++) for (let j=i+1; j<members.length; j++) {
      const [a,b] = [members[i],members[j]]
      const [ga,gb] = simMatch(a,b)
      pts[a] += ga; pts[b] += gb
      stand[a].gf+=ga; stand[a].gd+=ga-gb
      stand[b].gf+=gb; stand[b].gd+=gb-ga
      if      (ga>gb) { pts[a]+=SCORING.win; stand[a].p+=3 }
      else if (gb>ga) { pts[b]+=SCORING.win; stand[b].p+=3 }
      else            { pts[a]+=SCORING.draw; pts[b]+=SCORING.draw; stand[a].p++; stand[b].p++ }
    }
  }

  // Sort each group
  const thirds = []
  const r32pool = []
  for (const [g, members] of Object.entries(byGroup)) {
    const ranked = members.slice().sort((a,b)=>
      stand[b].p-stand[a].p || stand[b].gd-stand[a].gd || stand[b].gf-stand[a].gf)
    r32pool.push(ranked[0], ranked[1])
    thirds.push({ name: ranked[2], ...stand[ranked[2]] })
    stage[ranked[3]] = 'group_out'
  }

  // Best 8 third-place teams advance
  thirds.sort((a,b) => b.p-a.p || b.gd-a.gd || b.gf-a.gf)
  for (let i=0; i<8; i++)  { r32pool.push(thirds[i].name) }
  for (let i=8; i<12; i++) { stage[thirds[i].name] = 'group_out' }

  for (const n of r32pool) stage[n] = 'group'

  // ── KNOCKOUT ──
  function runRound(pool, stageName) {
    const shuffled = pool.slice().sort(()=>Math.random()-0.5)
    const winners = []
    for (let i=0; i<shuffled.length; i+=2) {
      const [w, l, wg, lg] = simKnockout(shuffled[i], shuffled[i+1])
      pts[w] += wg + SCORING.win
      pts[l] += lg
      stage[l] = stageName === 'r32' ? 'group' : stageName.replace('win','') + 'out' // keep last good stage
      // Actually: track as "eliminated in stageName" → their adv is previous stage
      // Let's do it properly:
      stage[l] = {r32:'group', r16:'r32', qf:'r16', sf:'qf', final:'sf'}[stageName]
      stage[w] = stageName
      winners.push(w)
    }
    return winners
  }

  const r16 = runRound(r32pool, 'r32')
  const qf  = runRound(r16,    'r16')
  const sf  = runRound(qf,     'qf')
  const fin = runRound(sf,     'sf')  // fin = [finalistA, finalistB]

  // Final
  const [w, l, wg, lg] = simKnockout(fin[0], fin[1])
  pts[w] += wg + SCORING.win
  pts[l] += lg
  stage[w] = 'winner'
  stage[l] = 'final'

  // ── CALCULATE TOTAL WITH MULTIPLIER ──
  const totals = {}
  for (const t of TEAMS) {
    const advPts  = ADV_CUM[stage[t.name]] ?? 0
    const matchPts = pts[t.name]
    const m = mult(t.pot)
    totals[t.name] = {
      match: matchPts, adv: advPts,
      base: matchPts + advPts,
      total: m * (matchPts + advPts),
      stage: stage[t.name], pot: t.pot, mult: m
    }
  }
  return totals
}

// ── RUN 10 TOURNAMENTS ──
const N = 10
const allResults = []
const potTotals  = {1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]}

console.log('═══════════════════════════════════════════════════════════════')
console.log(' VM 2026 – 10 simuleringer')
console.log(' Scoring: 3/1/1  |  Adv: 6-10-15-22-30-45  |  Mult: 1/2/3/4x')
console.log('═══════════════════════════════════════════════════════════════\n')

for (let sim=1; sim<=N; sim++) {
  const res = runTournament()
  allResults.push(res)

  // Find winner
  const winner = Object.entries(res).find(([,v])=>v.stage==='winner')
  const finalist = Object.entries(res).find(([,v])=>v.stage==='final')

  console.log(`── VM ${sim} ─────────────────────────────────────────`)
  console.log(`  🏆 Vinner:    ${winner[0].padEnd(18)} ${winner[1].total.toFixed(0)} pts (${winner[1].mult}x)`)
  console.log(`  🥈 Finalist:  ${finalist[0].padEnd(18)} ${finalist[1].total.toFixed(0)} pts`)

  // Surprises: pot 5-8 teams that reached qf or beyond
  const surprises = Object.entries(res)
    .filter(([,v]) => v.pot >= 5 && ['r16','qf','sf','final','winner'].includes(v.stage))
    .sort((a,b)=>b[1].total-a[1].total)
  if (surprises.length) {
    const s = surprises.map(([n,v])=>`${n}(P${v.pot},${v.stage},${v.total.toFixed(0)}pts)`).join(', ')
    console.log(`  ⚡ Overraskelser: ${s}`)
  }

  // Example player: picks best team from each pot (deterministic test)
  const examplePicks = [1,2,3,4,5,6,7,8].map(p => {
    const potTeams = TEAMS.filter(t=>t.pot===p)
    // Pick the one with lowest odds (favourite in that pot) for "lucky player"
    return potTeams.sort((a,b)=>a.odds-b.odds)[0].name
  })
  const luckyScore = examplePicks.reduce((s,n)=>s+res[n].total,0)

  // Unlucky: pick highest odds (outsider) from each pot
  const unluckyPicks = [1,2,3,4,5,6,7,8].map(p => {
    const potTeams = TEAMS.filter(t=>t.pot===p)
    return potTeams.sort((a,b)=>b.odds-a.odds)[0].name
  })
  const unluckyScore = unluckyPicks.reduce((s,n)=>s+res[n].total,0)

  // Random player
  const randomPicks = [1,2,3,4,5,6,7,8].map(p => {
    const potTeams = TEAMS.filter(t=>t.pot===p)
    return potTeams[Math.floor(Math.random()*potTeams.length)].name
  })
  const randomScore = randomPicks.reduce((s,n)=>s+res[n].total,0)

  console.log(`  👤 Favoritt-spiller (${examplePicks.slice(0,3).join('/')}...): ${luckyScore.toFixed(0)} pts`)
  console.log(`  👤 Tilfeldig spiller: ${randomScore.toFixed(0)} pts  |  Outsider-spiller: ${unluckyScore.toFixed(0)} pts`)

  // Accumulate pot totals
  for (const t of TEAMS) {
    potTotals[t.pot].push(res[t.name].total)
  }
  console.log()
}

// ── AGGREGATE STATS ──
console.log('═══════════════════════════════════════════════════════════════')
console.log(' SNITT PER POTT (over 10 turneringer × antall lag i potten)')
console.log('═══════════════════════════════════════════════════════════════')

for (let p=1; p<=8; p++) {
  const arr = potTotals[p]
  const avg = arr.reduce((a,b)=>a+b,0)/arr.length
  const min = Math.min(...arr)
  const max = Math.max(...arr)
  const m = mult(p)
  console.log(`  Pott ${p} (${m}x): snitt=${avg.toFixed(1)}  min=${min.toFixed(0)}  max=${max.toFixed(0)}  (${arr.length} observasjoner)`)
}

// ── SIMULATE 1000 RANDOM PLAYER SCORES ──
console.log('\n═══════════════════════════════════════════════════════════════')
console.log(' SPILLERSCORER: 1000 tilfeldige spillere × 3 VM-simuleringer')
console.log('═══════════════════════════════════════════════════════════════')
const playerScores = []
for (let i=0; i<3; i++) {
  const res = runTournament()
  for (let j=0; j<1000; j++) {
    const picks = [1,2,3,4,5,6,7,8].map(p => {
      const potTeams = TEAMS.filter(t=>t.pot===p)
      return potTeams[Math.floor(Math.random()*potTeams.length)].name
    })
    playerScores.push(picks.reduce((s,n)=>s+res[n].total,0))
  }
}
playerScores.sort((a,b)=>a-b)
const ps = playerScores
const pct = p => ps[Math.floor(p*ps.length/100)]
console.log(`  Bunnsjikt (10%):      ${pct(10).toFixed(0)} pts`)
console.log(`  Nedre kvartil (25%):  ${pct(25).toFixed(0)} pts`)
console.log(`  Median (50%):         ${pct(50).toFixed(0)} pts`)
console.log(`  Øvre kvartil (75%):   ${pct(75).toFixed(0)} pts`)
console.log(`  Toppsjikt (90%):      ${pct(90).toFixed(0)} pts`)
console.log(`  Absolutt topp (99%):  ${pct(99).toFixed(0)} pts`)
console.log(`  Maks observert:       ${ps[ps.length-1].toFixed(0)} pts`)
console.log(`  Snitt:                ${(ps.reduce((a,b)=>a+b,0)/ps.length).toFixed(0)} pts`)
