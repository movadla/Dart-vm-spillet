import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { checkAdminAuth } from '@/lib/adminAuth'

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

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function slug(name: string) {
  return name.toLowerCase()
    .replace(/\s+/g, '.').replace(/[æ]/g, 'ae').replace(/[øö]/g, 'o')
    .replace(/[åä]/g, 'a').replace(/[éè]/g, 'e').replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9.]/g, '')
}

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const supabase = getSupabaseAdmin()

  // Hent eksisterende ligaer
  const { data: leagues } = await supabase.from('leagues').select('id, name')
  if (!leagues?.length) {
    return NextResponse.json({ error: 'Ingen ligaer funnet — opprett minst én liga først' }, { status: 400 })
  }

  const results: string[] = []
  const participantIds: string[] = []

  for (const name of NAMES) {
    const email = `${slug(name)}.test@vmspillet-test.no`

    // Hopp over hvis allerede finnes
    const { data: existing } = await supabase.from('participants').select('id').eq('email', email).maybeSingle()
    if (existing) {
      results.push(`hopper over (finnes): ${name}`)
      participantIds.push(existing.id)
      continue
    }

    const { data: p, error } = await supabase
      .from('participants')
      .insert({ name, email })
      .select('id')
      .single()

    if (error || !p) { results.push(`FEIL: ${name} — ${error?.message}`); continue }

    // Tilfeldige picks
    const picks = POTS.map(pot => ({
      participant_id: p.id,
      pot_number: pot.n,
      team_name: pick(pot.teams),
    }))
    await supabase.from('picks').insert(picks)

    participantIds.push(p.id)
    results.push(`opprettet: ${name}`)
  }

  // Fordel jevnt i alle ligaer (round-robin)
  let membersAdded = 0
  for (let i = 0; i < participantIds.length; i++) {
    const league = leagues[i % leagues.length]
    const { error } = await supabase
      .from('league_members')
      .upsert({ league_id: league.id, participant_id: participantIds[i] }, { onConflict: 'league_id,participant_id' })
    if (!error) membersAdded++
  }

  const created = results.filter(r => r.startsWith('opprettet')).length
  return NextResponse.json({
    ok: true,
    created,
    total: participantIds.length,
    membersAdded,
    leagues: leagues.map(l => l.name),
    details: results,
  })
}
