// Simulerer én gruppe-kamp per minutt i VM-schedulerekkefølge
// Kjør: node scripts/sim-timed.mjs [antall=10] [delay_ms=60000]
import { simGroup } from './sim-strength.mjs'

const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xd2NmdG11ZHdydmtnZmR1eXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Mzk2NzksImV4cCI6MjA5NDMxNTY3OX0.YFzmFg6VfI2EChNj8PfXsFmOAb0B2ZzOsIns2eCfwPo'
const BASE = 'https://oqwcftmudwrvkgfduyve.supabase.co/rest/v1'
const h = { 'apikey': ANON, 'Authorization': `Bearer ${ANON}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' }

// Alle 72 gruppespillkamper sortert etter faktisk VM-dato og -tid
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

const ROUNDS = parseInt(process.argv[2] ?? '10')
const DELAY_MS = parseInt(process.argv[3] ?? '60000')

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function simOne() {
  const res = await fetch(`${BASE}/match_results?stage=eq.group&select=home_team,away_team`, { headers: h })
  const played = await res.json()
  const playedSet = new Set(played.flatMap(m => [`${m.home_team}|${m.away_team}`, `${m.away_team}|${m.home_team}`]))

  const remaining = ALL_MATCHES.filter(m => !playedSet.has(`${m.home}|${m.away}`))
  if (remaining.length === 0) {
    console.log('Alle gruppespillkamper er spilt!')
    return false
  }

  const m = remaining[0]
  const [hg, ag] = simGroup(m.home, m.away)
  await fetch(`${BASE}/match_results`, {
    method: 'POST', headers: h,
    body: JSON.stringify({ home_team: m.home, away_team: m.away, home_goals: hg, away_goals: ag, stage: 'group' }),
  })
  console.log(`[${new Date().toLocaleTimeString('no')}] ${m.date} ${m.time} Gr.${m.group}: ${m.home} ${hg}–${ag} ${m.away}`)
  return true
}

console.log(`Simulerer ${ROUNDS} kamper med ${DELAY_MS / 1000}s pause\n`)
for (let i = 0; i < ROUNDS; i++) {
  const ok = await simOne()
  if (!ok) break
  if (i < ROUNDS - 1) await sleep(DELAY_MS)
}
console.log('\nFerdig!')
