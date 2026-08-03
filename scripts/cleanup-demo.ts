import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { POTS } from '../src/data/pots'

const rawEnv = readFileSync('.env.local', 'utf-8')
const env = Object.fromEntries(
  rawEnv.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#') && l.trim())
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const allTeamNames = POTS.flatMap(p => p.teams.map(t => t.name))

async function cleanup() {
  console.log('Rydder opp demo-data...')

  const { error: e1 } = await supabase.from('participants').delete().like('name', 'Demo %')
  if (e1) throw new Error(`Feil: ${e1.message}`)

  const { error: e2 } = await supabase.from('match_results').delete().in('home_team', allTeamNames)
  if (e2) throw new Error(`Feil: ${e2.message}`)

  const { error: e3 } = await supabase.from('advancement').delete().in('team_name', allTeamNames)
  if (e3) throw new Error(`Feil: ${e3.message}`)

  console.log('✅ Demo-deltakere, kampresultater og avansement er slettet.')
}

cleanup().catch(e => { console.error(e); process.exit(1) })
