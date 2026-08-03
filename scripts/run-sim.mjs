// Kjør: node scripts/run-sim.mjs
// Populerer Supabase med 20 sim-deltakere + 10 kampresultater
import { simGroup } from './sim-strength.mjs'

const SUPABASE_URL = 'https://oqwcftmudwrvkgfduyve.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xd2NmdG11ZHdydmtnZmR1eXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Mzk2NzksImV4cCI6MjA5NDMxNTY3OX0.YFzmFg6VfI2EChNj8PfXsFmOAb0B2ZzOsIns2eCfwPo'

const headers = {
  'apikey': ANON_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
}

async function sb(method, table, body, query = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${table}: ${res.status} ${text}`)
  return text ? JSON.parse(text) : null
}

const NAMES = [
  'Ole Hansen', 'Kari Olsen', 'Erik Johansen', 'Ingrid Andersen',
  'Lars Nilsen', 'Astrid Petersen', 'Per Christensen', 'Hilde Larsen',
  'Nils Berg', 'Silje Haugen', 'Tor Eriksen', 'Marit Holm',
  'Jens Dahl', 'Bente Solberg', 'Rune Moen', 'Lise Strand',
  'Hans Lund', 'Eva Bakke', 'Arne Lie', 'Tone Viken',
]

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

const MATCHES = [
  { home: 'Mexico',   away: 'Sør-Afrika' },
  { home: 'Sør-Korea', away: 'Tsjekkia' },
  { home: 'Canada',   away: 'Bosnia-Hercegovina' },
  { home: 'Qatar',    away: 'Sveits' },
  { home: 'Brasil',   away: 'Marokko' },
  { home: 'Haiti',    away: 'Skottland' },
  { home: 'USA',      away: 'Paraguay' },
  { home: 'Australia', away: 'Tyrkia' },
  { home: 'Tyskland', away: 'Curaçao' },
  { home: 'Elfenbenskysten', away: 'Ecuador' },
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

async function run() {
  console.log('🗑  Rydder databasen...')
  await sb('DELETE', 'picks', null, '?participant_id=neq.00000000-0000-0000-0000-000000000000')
  await sb('DELETE', 'league_members', null, '?league_id=neq.00000000-0000-0000-0000-000000000000')
  await sb('DELETE', 'leagues', null, '?id=neq.00000000-0000-0000-0000-000000000000')
  await sb('DELETE', 'advancement', null, '?team_name=neq.')
  await sb('DELETE', 'match_results', null, '?home_team=neq.')
  await sb('DELETE', 'participants', null, '?id=neq.00000000-0000-0000-0000-000000000000')
  console.log('✓ Databasen er tom')

  console.log('\n👥 Oppretter 20 deltakere...')
  const participantRows = NAMES.map((name, i) => ({
    name, email: `sim${i + 1}@vm-sim.local`, vipps_confirmed: true, pin: '1234',
  }))
  const participants = await sb('POST', 'participants', participantRows)
  console.log(`✓ ${participants.length} deltakere opprettet`)

  console.log('\n⚽ Genererer picks...')
  const pickRows = participants.flatMap(p =>
    POTS.map(pot => ({
      participant_id: p.id,
      pot_number: pot.n,
      team_name: pick(pot.teams),
    }))
  )
  await sb('POST', 'picks', pickRows, '?select=participant_id')
  console.log(`✓ ${pickRows.length} picks lagret (${participants.length} × 8 potter)`)

  console.log('\n🏟  Simulerer 10 kampresultater...')
  for (const m of MATCHES) {
    const [hg, ag] = simGroup(m.home, m.away)
    await sb('POST', 'match_results', { home_team: m.home, away_team: m.away, home_goals: hg, away_goals: ag, stage: 'group' })
    console.log(`  ${m.home} ${hg}–${ag} ${m.away}`)
  }
  console.log('✓ 10 kamper lagret')

  console.log('\n🎉 Simuleringen er klar!')
  console.log('Logg inn som en av disse (alle har PIN: 1234):')
  for (const p of participants.slice(0, 5)) {
    console.log(`  ${p.name.padEnd(20)} /deltaker/${p.id}`)
  }
  console.log(`  ... og ${participants.length - 5} til`)
}

run().catch(e => { console.error('❌', e.message); process.exit(1) })
