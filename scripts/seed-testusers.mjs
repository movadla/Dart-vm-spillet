// seed-testusers.mjs — opprett 40 testbrukere med picks og fordel dem i ligaer
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

const NAMES = [
  'Lars Petter Sæther', 'Per Ove Bakken', 'Jan Erik Myrland', 'Ole Martin Fossum',
  'Tor Arne Vesterås', 'Bjørn Tore Kleven', 'Hans Olav Nordås', 'Karl Ove Rønning',
  'Geir Arne Aas', 'Vegard Bråthen', 'Eirik Skjervold', 'Sindre Bjørnstad',
  'Torgeir Hopland', 'Kristoffer Ødegård', 'Håkon Langfeldt', 'Kjetil Reinholt',
  'Pål Sveen', 'Marius Dahl', 'Audun Heggdal', 'Steinar Sandmo',
  'Gunnar Solbakken', 'Øyvind Storfjord', 'Stian Kløvstad', 'Trond Ellingsen',
  'Magnus Lie', 'Espen Midtbø', 'Joakim Grønn', 'Bjørnar Viken',
  'Roger Thoresen', 'Erlend Tveit', 'Rasmus Kjeldsen', 'Mads Kristiansen',
  'Viktor Lindqvist', 'Marcus Hedlund', 'James Whitfield', 'Tom Ashworth',
  'Silje Rønning', 'Nora Bjerke', 'Sofie Vestergaard', 'Frida Björklund',
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function slug(name) { return name.toLowerCase().replace(/\s+/g, '.').replace(/[æ]/g, 'ae').replace(/[øö]/g, 'o').replace(/[åä]/g, 'a').replace(/[éè]/g, 'e').replace(/[ç]/g, 'c').replace(/[^a-z0-9.]/g, '') }

async function main() {
  // Hent eksisterende ligaer
  const { data: leagues } = await supabase.from('leagues').select('id, name')
  if (!leagues?.length) { console.log('Ingen ligaer funnet — opprett minst én liga først'); process.exit(1) }
  console.log(`Fant ${leagues.length} liga(er): ${leagues.map(l => l.name).join(', ')}\n`)

  let created = 0
  const participantIds = []

  for (const name of NAMES) {
    const email = `${slug(name)}.test@vmspillet-test.no`

    // Sjekk om deltakeren allerede finnes
    const { data: existing } = await supabase.from('participants').select('id').eq('email', email).maybeSingle()
    if (existing) {
      console.log(`  Hopper over (finnes): ${name}`)
      participantIds.push(existing.id)
      continue
    }

    const { data: p, error } = await supabase
      .from('participants')
      .insert({ name, email })
      .select('id')
      .single()

    if (error || !p) { console.error(`  FEIL ved oppretting av ${name}:`, error?.message); continue }

    // Tilfeldige picks
    const picks = POTS.map(pot => ({
      participant_id: p.id,
      pot_number: pot.n,
      team_name: pick(pot.teams),
    }))
    await supabase.from('picks').insert(picks)

    participantIds.push(p.id)
    created++
    console.log(`  ✓ ${name} (${email})`)
  }

  console.log(`\nOpprettet ${created} nye deltakere (${participantIds.length} totalt inkl. eksisterende)\n`)

  // Fordel deltakere jevnt i alle ligaer
  let leagueIdx = 0
  let membersAdded = 0
  for (const pid of participantIds) {
    const league = leagues[leagueIdx % leagues.length]
    const { error } = await supabase
      .from('league_members')
      .upsert({ league_id: league.id, participant_id: pid }, { onConflict: 'league_id,participant_id' })
    if (!error) membersAdded++
    leagueIdx++
  }

  console.log(`Lagt til ${membersAdded} deltakere i ${leagues.length} liga(er) (round-robin fordeling)`)
  console.log('\nFerdig! 🎉')
}

main().catch(console.error)
