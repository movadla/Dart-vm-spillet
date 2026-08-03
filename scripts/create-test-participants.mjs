// Oppretter 4 navngitte testdeltakere med tilfeldige picks
// Kjør: node scripts/create-test-participants.mjs
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://oqwcftmudwrvkgfduyve.supabase.co'

function loadEnv() {
  try {
    return Object.fromEntries(
      readFileSync('.env.local', 'utf8').split('\n')
        .filter(l => l.includes('=') && !l.startsWith('#'))
        .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
    )
  } catch { return {} }
}
const env = loadEnv()
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!SERVICE_KEY) { console.error('❌ SUPABASE_SERVICE_ROLE_KEY mangler i .env.local'); process.exit(1) }

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
}

async function sb(method, table, body, query = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${table}: ${res.status} ${text}`)
  return text ? JSON.parse(text) : null
}

const NAMES = ['Storspiller-Stian', 'Taktikk-Tina', 'Underdog-Ulrik', 'Favoritt-Frida']

const POTS = [
  { n: 1, teams: ['Frankrike', 'Spania', 'England'] },
  { n: 2, teams: ['Brasil', 'Argentina', 'Portugal', 'Tyskland'] },
  { n: 3, teams: ['Nederland', 'Norge', 'Belgia', 'USA', 'Colombia'] },
  { n: 4, teams: ['Uruguay', 'Marokko', 'Japan', 'Mexico', 'Sverige', 'Kroatia'] },
  { n: 5, teams: ['Sveits', 'Ecuador', 'Senegal', 'Tyrkia', 'Østerrike', 'Canada', 'Paraguay'] },
  { n: 6, teams: ['Algerie', 'Tsjekkia', 'Elfenbenskysten', 'Sør-Korea', 'Egypt', 'Skottland', 'Ghana'] },
  { n: 7, teams: ['Bosnia-Hercegovina', 'Iran', 'Australia', 'Tunisia', 'Congo DR', 'Saudi-Arabia', 'New Zealand', 'Qatar'] },
  { n: 8, teams: ['Irak', 'Jordan', 'Kapp Verde', 'Usbekistan', 'Panama', 'Sør-Afrika', 'Curaçao', 'Haiti'] },
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

async function run() {
  console.log('👥 Oppretter 4 testdeltakere...')
  const rows = NAMES.map((name, i) => ({
    name,
    email: `test${i + 1}@vm-test.local`,
    vipps_confirmed: true,
    pin: '1234',
  }))
  const participants = await sb('POST', 'participants', rows)
  console.log(`✓ ${participants.length} deltakere opprettet\n`)

  console.log('⚽ Genererer picks...')
  const pickRows = participants.flatMap(p =>
    POTS.map(pot => ({ participant_id: p.id, pot_number: pot.n, team_name: pick(pot.teams) }))
  )
  await sb('POST', 'picks', pickRows, '?select=participant_id')
  console.log(`✓ ${pickRows.length} picks lagret\n`)

  console.log('─────────────────────────────────────────────')
  console.log('Logg inn med PIN: 1234')
  console.log('─────────────────────────────────────────────')
  for (const p of participants) {
    const picks = pickRows.filter(r => r.participant_id === p.id).map(r => r.team_name).join(', ')
    console.log(`${p.name.padEnd(22)} /deltaker/${p.id}`)
    console.log(`  Picks: ${picks}`)
  }
  console.log('─────────────────────────────────────────────')
}

run().catch(e => { console.error('❌', e.message); process.exit(1) })
