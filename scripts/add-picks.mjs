const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xd2NmdG11ZHdydmtnZmR1eXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Mzk2NzksImV4cCI6MjA5NDMxNTY3OX0.YFzmFg6VfI2EChNj8PfXsFmOAb0B2ZzOsIns2eCfwPo'
const BASE = 'https://oqwcftmudwrvkgfduyve.supabase.co/rest/v1'
const h = { 'apikey': ANON, 'Authorization': `Bearer ${ANON}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' }

const POTS = [
  [1, ['Frankrike','Spania','England']],
  [2, ['Brasil','Argentina','Portugal','Tyskland']],
  [3, ['Nederland','Norge','Belgia','USA','Colombia']],
  [4, ['Uruguay','Marokko','Japan','Mexico','Sverige','Kroatia']],
  [5, ['Sveits','Ecuador','Senegal','Tyrkia','Østerrike','Canada','Paraguay']],
  [6, ['Algerie','Tsjekkia','Elfenbenskysten','Sør-Korea','Egypt','Skottland','Ghana']],
  [7, ['Bosnia-Hercegovina','Iran','Australia','Tunisia','Congo DR','Saudi-Arabia','New Zealand','Qatar']],
  [8, ['Irak','Jordan','Kapp Verde','Usbekistan','Panama','Sør-Afrika','Curaçao','Haiti']],
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

const pRes = await fetch(`${BASE}/participants?select=id,name&order=created_at.desc`, { headers: h })
const participants = await pRes.json()

const pkRes = await fetch(`${BASE}/picks?select=participant_id`, { headers: h })
const existingPicks = await pkRes.json()
const hasPicksSet = new Set(existingPicks.map(p => p.participant_id))

const needPicks = participants.filter(p => !hasPicksSet.has(p.id))
console.log('Deltakere uten picks:', needPicks.map(p => p.name).join(', '))

const pickRows = needPicks.flatMap(p =>
  POTS.map(([n, teams]) => ({
    participant_id: p.id,
    pot_number: n,
    team_name: pick(teams),
  }))
)

if (!pickRows.length) { console.log('Alle har picks allerede'); process.exit(0) }

const ins = await fetch(`${BASE}/picks`, { method: 'POST', headers: h, body: JSON.stringify(pickRows) })
if (!ins.ok) { console.error('Feil:', await ins.text()); process.exit(1) }

console.log(`✓ ${pickRows.length} picks lagt til for ${needPicks.length} deltakere`)
needPicks.forEach(p => console.log(`  ${p.name} → /deltaker/${p.id}`))
