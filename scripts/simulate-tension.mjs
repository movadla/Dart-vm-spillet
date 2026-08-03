// Simulates 100 players and tracks leaderboard movement across stages

const SCORING = { win: 3, draw: 1, goal: 1,
  adv: { group: 6, r32: 10, r16: 15, qf: 22, sf: 30, winner: 45 } }

const ADV_AT = {
  group_out: 0, group: 6, r32: 16, r16: 31, qf: 53, sf: 83, final: 83, winner: 128
}

const mult = p => p <= 4 ? 1 : p <= 6 ? 2 : 3

const TEAMS = [
  ['Frankrike',1,'I',5.5],['Spania',1,'H',6.0],['England',1,'L',7.5],
  ['Brasil',2,'C',9.0],['Argentina',2,'J',9.5],['Portugal',2,'K',11.0],['Tyskland',2,'E',15.0],
  ['Nederland',3,'F',21.0],['Norge',3,'I',26.0],['Belgia',3,'G',34.0],['USA',3,'D',41.0],['Colombia',3,'K',41.0],
  ['Uruguay',4,'H',51.0],['Marokko',4,'C',51.0],['Japan',4,'F',51.0],['Mexico',4,'A',76.0],
  ['Sverige',4,'F',76.0],['Kroatia',4,'L',81.0],
  ['Sveits',5,'B',81.0],['Ecuador',5,'E',91.0],['Senegal',5,'I',101.0],['Tyrkia',5,'D',101.0],
  ['Østerrike',5,'J',101.0],['Canada',5,'B',151.0],['Paraguay',5,'D',151.0],
  ['Algerie',6,'J',201.0],['Tsjekkia',6,'A',201.0],
  ['Elfenbenskysten',6,'E',201.0],['Sør-Korea',6,'A',251.0],['Egypt',6,'G',251.0],
  ['Skottland',6,'C',251.0],['Ghana',6,'L',251.0],
  ['Bosnia',7,'B',251.0],['Iran',7,'G',501.0],['Australia',7,'D',501.0],['Tunisia',7,'F',501.0],
  ['Congo',7,'K',751.0],['Saudi-Arabia',7,'H',1001.0],['New Zealand',7,'G',1001.0],['Qatar',7,'B',1001.0],
  ['Irak',8,'I',1001.0],['Jordan',8,'J',1001.0],['Kapp Verde',8,'H',1001.0],['Usbekistan',8,'K',1001.0],
  ['Panama',8,'L',1001.0],['Sør-Afrika',8,'A',1001.0],['Curaçao',8,'E',2501.0],['Haiti',8,'C',2501.0],
].map(([name,pot,group,odds])=>({name,pot,group,odds,str:1/odds}))

const byName = Object.fromEntries(TEAMS.map(t=>[t.name,t]))
const byGroup = {}
for (const t of TEAMS) { if (!byGroup[t.group]) byGroup[t.group]=[]; byGroup[t.group].push(t.name) }

function poisson(lam) {
  if (lam<=0) return 0
  const L=Math.exp(-lam); let p=1,k=0
  do { k++; p*=Math.random() } while (p>L); return k-1
}

function simMatch(a,b) {
  const sa=byName[a].str, sb=byName[b].str, tot=sa+sb
  return [poisson(2.7*sa/tot), poisson(2.7*sb/tot)]
}

function simKnockout(a,b) {
  let [ga,gb]=simMatch(a,b)
  if (ga===gb) { if (Math.random()<byName[a].str/(byName[a].str+byName[b].str)) ga++; else gb++ }
  return ga>gb ? [a,b,ga,gb] : [b,a,gb,ga]
}

// Returns per-team: { matchPts at each stage, finalStage }
function runTournament() {
  const pts   = Object.fromEntries(TEAMS.map(t=>[t.name,0]))
  const stage = Object.fromEntries(TEAMS.map(t=>[t.name,'group_out']))
  const stand = Object.fromEntries(TEAMS.map(t=>[t.name,{p:0,gd:0,gf:0}]))

  // Group stage
  for (const members of Object.values(byGroup)) {
    for (let i=0;i<members.length;i++) for (let j=i+1;j<members.length;j++) {
      const [a,b]=[members[i],members[j]], [ga,gb]=simMatch(a,b)
      pts[a]+=ga; pts[b]+=gb
      stand[a].gf+=ga; stand[a].gd+=ga-gb
      stand[b].gf+=gb; stand[b].gd+=gb-ga
      if (ga>gb) { pts[a]+=SCORING.win; stand[a].p+=3 }
      else if (gb>ga) { pts[b]+=SCORING.win; stand[b].p+=3 }
      else { pts[a]+=SCORING.draw; pts[b]+=SCORING.draw; stand[a].p++; stand[b].p++ }
    }
  }

  const thirds=[]
  const r32pool=[]
  for (const members of Object.values(byGroup)) {
    const ranked=members.slice().sort((a,b)=>stand[b].p-stand[a].p||stand[b].gd-stand[a].gd||stand[b].gf-stand[a].gf)
    r32pool.push(ranked[0],ranked[1])
    thirds.push({name:ranked[2],...stand[ranked[2]]})
  }
  thirds.sort((a,b)=>b.p-a.p||b.gd-a.gd||b.gf-a.gf)
  for (let i=0;i<8;i++) r32pool.push(thirds[i].name)
  for (const n of r32pool) stage[n]='group'

  const ptsAfterGroup = {...pts}

  function runRound(pool, winStage, loseStage) {
    const shuffled=pool.slice().sort(()=>Math.random()-0.5)
    const winners=[]
    for (let i=0;i<shuffled.length;i+=2) {
      const [w,l,wg,lg]=simKnockout(shuffled[i],shuffled[i+1])
      pts[w]+=wg+SCORING.win; pts[l]+=lg
      stage[w]=winStage; stage[l]=loseStage
      winners.push(w)
    }
    return winners
  }

  const r16=runRound(r32pool,'r32','group')
  const ptsAfterR32={...pts}
  const qf=runRound(r16,'r16','r32')
  const ptsAfterR16={...pts}
  const sf=runRound(qf,'qf','r16')
  const ptsAfterQF={...pts}
  const fin=runRound(sf,'sf','qf')
  const ptsAfterSF={...pts}

  const [w,l,wg,lg]=simKnockout(fin[0],fin[1])
  pts[w]+=wg+SCORING.win; pts[l]+=lg
  stage[w]='winner'; stage[l]='final'

  return { pts, ptsAfterGroup, ptsAfterR32, ptsAfterR16, ptsAfterQF, ptsAfterSF, stage }
}

// Score a player at a given snapshot
function scorePlayer(picks, ptsSnapshot, stageSnapshot) {
  return picks.reduce((sum, name) => {
    const t = byName[name]
    const m = mult(t.pot)
    const matchPts = ptsSnapshot[name]
    const advPts = ADV_AT[stageSnapshot[name]] ?? 0
    return sum + m * (matchPts + advPts)
  }, 0)
}

// Generate 100 random players
function makePlayers(n) {
  return Array.from({length: n}, (_, i) => ({
    id: i+1,
    picks: [1,2,3,4,5,6,7,8].map(p => {
      const pool = TEAMS.filter(t=>t.pot===p)
      return pool[Math.floor(Math.random()*pool.length)].name
    })
  }))
}

// ── RUN 5 WCs, 100 players each ──
const WC_RUNS = 5
const allSims = []

for (let sim=0; sim<WC_RUNS; sim++) {
  const players = makePlayers(100)
  const tourney = runTournament()
  const { pts, ptsAfterGroup, ptsAfterR32, ptsAfterR16, ptsAfterQF, ptsAfterSF, stage } = tourney

  // Score everyone at each checkpoint
  const checkpoints = ['group','r32','r16','qf','sf','final']
  const snapPts   = { group: ptsAfterGroup, r32: ptsAfterR32, r16: ptsAfterR16, qf: ptsAfterQF, sf: ptsAfterSF, final: pts }
  const snapStage = {}

  // Reconstruct stage at each checkpoint
  // group: everyone either 'group' or 'group_out'
  // r32: same as final for those who lost r32, rest advanced
  // We need to re-simulate stage-by-stage... let's use a simpler approach:
  // stage[] is final stage, but for scoring mid-tournament we need partial stages
  // Hack: use final stage but cap it per checkpoint

  const stageOrder = ['group_out','group','r32','r16','qf','sf','final','winner']
  const checkStages = { group:'group', r32:'r32', r16:'r16', qf:'qf', sf:'sf', final:'winner' }
  const maxAtCheckpoint = { group:1, r32:2, r16:3, qf:4, sf:5, final:7 } // index into stageOrder

  const scores = {}
  for (const [cp, maxIdx] of Object.entries(maxAtCheckpoint)) {
    scores[cp] = players.map(pl => ({
      id: pl.id,
      pts: pl.picks.reduce((sum, name) => {
        const t = byName[name]
        const m = mult(t.pot)
        const matchPts = snapPts[cp][name]
        // Cap stage at checkpoint
        const finalStageIdx = stageOrder.indexOf(stage[name])
        const cappedIdx = Math.min(finalStageIdx, maxIdx)
        const advPts = ADV_AT[stageOrder[cappedIdx]] ?? 0
        return sum + m * (matchPts + advPts)
      }, 0)
    }))
  }

  // Rank at each checkpoint
  const ranks = {}
  for (const cp of Object.keys(scores)) {
    const sorted = scores[cp].slice().sort((a,b)=>b.pts-a.pts)
    ranks[cp] = Object.fromEntries(sorted.map((p,i)=>[p.id, i+1]))
  }

  // Position changes between stages
  const cps = ['group','r32','r16','qf','sf','final']
  const changes = []
  for (let i=1; i<cps.length; i++) {
    const prev=cps[i-1], curr=cps[i]
    const diffs = players.map(pl => Math.abs(ranks[curr][pl.id] - ranks[prev][pl.id]))
    changes.push({ from: prev, to: curr, avgChange: diffs.reduce((a,b)=>a+b)/diffs.length,
      maxChange: Math.max(...diffs), pctMoved10: diffs.filter(d=>d>=10).length })
  }

  // Top-5 stability: how many of top 5 after groups are still top 5 at end?
  const top5group = Object.entries(ranks.group).filter(([,r])=>r<=5).map(([id])=>+id)
  const top5final = Object.entries(ranks.final).filter(([,r])=>r<=5).map(([id])=>+id)
  const top5overlap = top5group.filter(id=>top5final.includes(id)).length

  // Bottom-5 stability
  const bot5group = Object.entries(ranks.group).filter(([,r])=>r>=96).map(([id])=>+id)
  const bot5final = Object.entries(ranks.final).filter(([,r])=>r>=96).map(([id])=>+id)
  const bot5overlap = bot5group.filter(id=>bot5final.includes(id)).length

  // Winner of the WC
  const wcWinner = Object.entries(stage).find(([,s])=>s==='winner')[0]

  // Final scores range
  const finalScores = Object.values(scores.final).map(p=>p.pts).sort((a,b)=>b-a)
  const gap = finalScores[0] - finalScores[99]
  const top10avg = finalScores.slice(0,10).reduce((a,b)=>a+b)/10
  const bot10avg = finalScores.slice(90).reduce((a,b)=>a+b)/10

  allSims.push({ changes, top5overlap, bot5overlap, wcWinner, gap,
    top10avg, bot10avg, finalScores, scores, ranks })
}

// ── PRINT RESULTS ──
console.log('═══════════════════════════════════════════════════════════════════')
console.log(' SPENNINGSANALYSE: 100 spillere × 5 VM-simuleringer')
console.log('═══════════════════════════════════════════════════════════════════\n')

for (let i=0; i<WC_RUNS; i++) {
  const sim = allSims[i]
  console.log(`── VM ${i+1} (VM-vinner: ${sim.wcWinner}) ────────────────────────────────`)

  // Leaderboard at each stage: show top 3 + last
  const cps = ['group','r32','r16','qf','sf','final']
  const cpLabels = { group:'Etter gruppe', r32:'Etter R32', r16:'Etter R16', qf:'Etter QF', sf:'Etter SF', final:'Sluttresultat' }
  for (const cp of cps) {
    const sorted = sim.scores[cp].slice().sort((a,b)=>b.pts-a.pts)
    const t = sorted.slice(0,3).map(p=>`#${sim.ranks[cp][p.id]}(${p.pts}p)`).join(' ')
    const last = sorted[sorted.length-1]
    console.log(`  ${cpLabels[cp].padEnd(16)}: Topp: ${t.padEnd(32)} Bunn: ${last.pts}p`)
  }

  console.log(`  Posisjonshopp per runde:`)
  for (const c of sim.changes) {
    console.log(`    ${c.from}→${c.to}: snitt ±${c.avgChange.toFixed(1)} plasser, maks ±${c.maxChange}, >10 plasser: ${c.pctMoved10} spillere`)
  }
  console.log(`  Topp-5 etter gruppe som FORTSATT er topp-5 til slutt: ${sim.top5overlap}/5`)
  console.log(`  Bunn-5 etter gruppe som FORTSATT er bunn-5 til slutt: ${sim.bot5overlap}/5`)
  console.log(`  Spenn topp→bunn: ${sim.gap.toFixed(0)} pts  |  Topp-10 snitt: ${sim.top10avg.toFixed(0)}  Bunn-10 snitt: ${sim.bot10avg.toFixed(0)}`)
  console.log()
}

// Aggregate
console.log('═══════════════════════════════════════════════════════════════════')
console.log(' SAMMENDRAG (snitt over 5 VM-simuleringer)')
console.log('═══════════════════════════════════════════════════════════════════')

const cpPairs = [['group','r32'],['r32','r16'],['r16','qf'],['qf','sf'],['sf','final']]
const labels = ['gruppe→R32','R32→R16','R16→QF','QF→SF','SF→finale']
for (let ci=0; ci<cpPairs.length; ci++) {
  const avgChange = allSims.reduce((s,sim)=>s+sim.changes[ci].avgChange,0)/WC_RUNS
  const avgMoved10 = allSims.reduce((s,sim)=>s+sim.changes[ci].pctMoved10,0)/WC_RUNS
  console.log(`  ${labels[ci].padEnd(15)}: snitt ±${avgChange.toFixed(1)} plasser,  ${avgMoved10.toFixed(1)} spillere hopper >10 plasser`)
}

const avgTop5stable = allSims.reduce((s,sim)=>s+sim.top5overlap,0)/WC_RUNS
const avgBot5stable = allSims.reduce((s,sim)=>s+sim.bot5overlap,0)/WC_RUNS
const avgGap = allSims.reduce((s,sim)=>s+sim.gap,0)/WC_RUNS
console.log(`\n  Topp-5 stabilitet:  ${avgTop5stable.toFixed(1)}/5 fra etter gruppe til slutt`)
console.log(`  Bunn-5 stabilitet:  ${avgBot5stable.toFixed(1)}/5 fra etter gruppe til slutt`)
console.log(`  Snitt spenn:        ${avgGap.toFixed(0)} pts mellom #1 og #100`)
