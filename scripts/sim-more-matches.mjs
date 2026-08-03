// Sletter alle kampresultater og legger inn korrekte resultater fra GROUP_SCHEDULE
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xd2NmdG11ZHdydmtnZmR1eXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Mzk2NzksImV4cCI6MjA5NDMxNTY3OX0.YFzmFg6VfI2EChNj8PfXsFmOAb0B2ZzOsIns2eCfwPo'
const BASE = 'https://oqwcftmudwrvkgfduyve.supabase.co/rest/v1'
const h = { 'apikey': ANON, 'Authorization': `Bearer ${ANON}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' }

function poisson(lam) {
  const L = Math.exp(-lam); let k = 0, p = 1
  do { k++; p *= Math.random() } while (p > L)
  return k - 1
}

// Korrekt GROUP_SCHEDULE — eksakt kopiert fra src/data/schedule.ts
const SCHEDULE = [
  // Gruppe A
  ['Mexico','Sør-Afrika'],['Sør-Korea','Tsjekkia'],
  ['Tsjekkia','Sør-Afrika'],['Mexico','Sør-Korea'],
  ['Tsjekkia','Mexico'],['Sør-Afrika','Sør-Korea'],
  // Gruppe B
  ['Canada','Bosnia-Hercegovina'],['Qatar','Sveits'],
  ['Sveits','Bosnia-Hercegovina'],['Canada','Qatar'],
  ['Sveits','Canada'],['Bosnia-Hercegovina','Qatar'],
  // Gruppe C
  ['Brasil','Marokko'],['Haiti','Skottland'],
  ['Skottland','Marokko'],['Brasil','Haiti'],
  ['Skottland','Brasil'],['Marokko','Haiti'],
  // Gruppe D
  ['USA','Paraguay'],['Australia','Tyrkia'],
  ['USA','Australia'],['Tyrkia','Paraguay'],
  ['Tyrkia','USA'],['Paraguay','Australia'],
  // Gruppe E
  ['Tyskland','Curaçao'],['Elfenbenskysten','Ecuador'],
  ['Tyskland','Elfenbenskysten'],['Ecuador','Curaçao'],
  ['Curaçao','Elfenbenskysten'],['Ecuador','Tyskland'],
  // Gruppe F
  ['Nederland','Japan'],['Sverige','Tunisia'],
  ['Nederland','Sverige'],['Tunisia','Japan'],
  ['Japan','Sverige'],['Tunisia','Nederland'],
  // Gruppe G
  ['Belgia','Egypt'],['Iran','New Zealand'],
  ['Belgia','Iran'],['New Zealand','Egypt'],
  ['Egypt','Iran'],['New Zealand','Belgia'],
  // Gruppe H
  ['Spania','Kapp Verde'],['Saudi-Arabia','Uruguay'],
  ['Spania','Saudi-Arabia'],['Uruguay','Kapp Verde'],
  ['Kapp Verde','Saudi-Arabia'],['Uruguay','Spania'],
  // Gruppe I
  ['Frankrike','Senegal'],['Irak','Norge'],
  ['Frankrike','Irak'],['Norge','Senegal'],
  ['Norge','Frankrike'],['Senegal','Irak'],
  // Gruppe J
  ['Argentina','Algerie'],['Østerrike','Jordan'],
  ['Argentina','Østerrike'],['Jordan','Algerie'],
  ['Algerie','Østerrike'],['Jordan','Argentina'],
  // Gruppe K
  ['Portugal','Congo DR'],['Usbekistan','Colombia'],
  ['Portugal','Usbekistan'],['Colombia','Congo DR'],
  ['Colombia','Portugal'],['Congo DR','Usbekistan'],
  // Gruppe L
  ['England','Kroatia'],['Ghana','Panama'],
  ['England','Ghana'],['Panama','Kroatia'],
  ['Panama','England'],['Kroatia','Ghana'],
]

const ANTALL = parseInt(process.argv[2] ?? '50')

// Steg 1: Slett alle eksisterende match_results
console.log('Sletter alle eksisterende kampresultater...')
const delRes = await fetch(`${BASE}/match_results?home_team=neq.`, {
  method: 'DELETE',
  headers: { ...h, 'Prefer': 'return=minimal' },
})
if (delRes.ok) {
  console.log('Slettet alle rader')
} else {
  console.error('Feil ved sletting:', delRes.status, await delRes.text())
  process.exit(1)
}

// Steg 2: Sett inn korrekte resultater
const toInsert = SCHEDULE.slice(0, ANTALL)
console.log(`Legger inn ${toInsert.length} kampresultater...\n`)

let count = 0
for (const [home, away] of toInsert) {
  const hg = poisson(1.3), ag = poisson(1.3)
  const res = await fetch(`${BASE}/match_results`, {
    method: 'POST', headers: h,
    body: JSON.stringify({ home_team: home, away_team: away, home_goals: hg, away_goals: ag, stage: 'group' })
  })
  if (res.ok) {
    console.log(`  ${home} ${hg}–${ag} ${away}`)
    count++
  } else {
    console.error(`  ❌ ${home} vs ${away}: ${await res.text()}`)
  }
}

console.log(`\n✓ ${count} av ${toInsert.length} kamper lagt til`)
