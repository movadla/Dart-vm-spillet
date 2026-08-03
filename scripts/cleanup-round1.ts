/**
 * Nullstiller runde 1-simuleringen — sletter alle innlagte kampresultater.
 *
 * Kjør: npm run cleanup-round1
 *
 * NB: Husk å sette DEADLINE tilbake til '2026-06-11T19:00:00Z'
 * i src/app/deltaker/[id]/page.tsx hvis du endret den for testing.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { GROUP_SCHEDULE } from '../src/data/schedule'
import { POTS } from '../src/data/pots'

const rawEnv = readFileSync('.env.local', 'utf-8')
const env = Object.fromEntries(
  rawEnv.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#') && l.trim())
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const ROUND1_IDS = new Set([
  'm001','m002','m007','m008','m013','m014','m019','m020',
  'm025','m026','m031','m032','m037','m038','m043','m044',
  'm049','m050','m055','m056','m061','m062','m067','m068',
])

const round1Matches = GROUP_SCHEDULE.filter(m => ROUND1_IDS.has(m.id))
const homeTeams = round1Matches.map(m => m.home)

const allTeamNames = POTS.flatMap(p => p.teams.map(t => t.name))

async function run() {
  const { error: e1 } = await supabase.from('match_results').delete().in('home_team', allTeamNames)
  if (e1) throw new Error(`Sletting av resultater feilet: ${e1.message}`)
  const { error: e1b } = await supabase.from('match_results').delete().in('away_team', allTeamNames)
  if (e1b) throw new Error(`Sletting av resultater (borte) feilet: ${e1b.message}`)

  const { error: e2 } = await supabase.from('advancement').delete().in('team_name', allTeamNames)
  if (e2) throw new Error(`Sletting av advancement feilet: ${e2.message}`)

  console.log(`\n  ✅ Runde 1-resultater og avansementsdata slettet\n`)
}

run().catch(e => { console.error('\n  ❌', e.message); process.exit(1) })
