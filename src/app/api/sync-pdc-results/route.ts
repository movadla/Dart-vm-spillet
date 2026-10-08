import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { upsertMatchResult } from '@/lib/upsertMatchResult'
import { logAdminAction } from '@/lib/adminAudit'

// MIDLERTIDIG (2026-10-08): henter resultater automatisk fra PDC sin egen
// offentlige, uautentiserte turnerings-API (samme data som pdc.tv sin
// «Tournament Hub»). Tournament-ID-en er SPESIFIKK for Grand Slam of Darts
// 2026 (10871, funnet ved å lese PDC-APIet direkte 2026-10-08); World Grand
// Prix var 10869. Må byttes til riktig ID for det ekte VM i desember (se
// WGP_PIVOT_REVERT.md) — finn den via pdc.tv/calendar → «Tournament Hub».
const PDC_TOURNAMENT_ID = '10871'
const PDC_API_URL = `https://tournaments.darts.web.gc.pdcservices.co.uk/v2/${PDC_TOURNAMENT_ID}`

// PDC sine stadienavn → våre interne stage-nøkler (config/scoring.ts STAGE_ORDER).
// UVERIFISERT: stages-listen for 10871 var TOM 2026-10-08 (ingen trekning ennå),
// så disse navnene er hentet fra Grand Prix-oppsettet og et antatt gruppenavn.
// Sjekk faktiske stage-navn mot API-et så snart turneringen er trukket, og
// rett opp her — ukjente stadienavn hoppes trygt over (se løkken under), så
// feil navn gir manglende resultater, ikke feil data.
const STAGE_NAME_MAP: Record<string, string> = {
  'Last 16': 'r16',
  'Quarter-Final': 'qf',
  'Semi-Final': 'sf',
  'Final': 'final',
}
function stageKeyFor(name: string): string | undefined {
  if (STAGE_NAME_MAP[name]) return STAGE_NAME_MAP[name]
  if (/group/i.test(name)) return 'group'
  return undefined
}

// Kryssjekket 2026-09-28: alle 32 spillernavn fra PDC sin API matcher våre
// EKSAKT, bortsett fra dette ene diakritisk-avviket. Legg til flere her hvis
// PDC sin API og vår egen stavemåte (src/data/pots.ts) skulle divergere for
// andre spillere senere (f.eks. hvis navnene i pots.ts endres for VM).
const NAME_FIXUPS: Record<string, string> = {
  'Sebastian Bialecki': 'Sebastian Białecki',
}
function normalizeName(firstName: string, lastName: string): string {
  const full = `${firstName} ${lastName}`
  return NAME_FIXUPS[full] ?? full
}

interface PdcFixture {
  fixtureID: string
  status: string
  participant1Score: number | null
  participant2Score: number | null
  participant1: { firstName: string; lastName: string } | null
  participant2: { firstName: string; lastName: string } | null
}
interface PdcStage {
  stage: { name: string }
  fixtures: PdcFixture[]
}
interface PdcTournamentResponse {
  data: { attributes: { stages: PdcStage[] } }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')
  if (secret !== process.env.SYNC_SECRET && req.headers.get('x-vercel-cron') !== '1') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  let json: PdcTournamentResponse
  try {
    const res = await fetch(PDC_API_URL, { cache: 'no-store' })
    if (!res.ok) return NextResponse.json({ error: `PDC-API svarte ${res.status}` }, { status: 502 })
    json = await res.json()
  } catch (e) {
    return NextResponse.json({ error: `Kunne ikke nå PDC-API: ${e instanceof Error ? e.message : String(e)}` }, { status: 502 })
  }

  const synced: string[] = []
  const skipped: string[] = []
  const errors: string[] = []

  for (const stage of json.data.attributes.stages) {
    const stageKey = stageKeyFor(stage.stage.name)
    if (!stageKey) continue // ukjent stadienavn — ikke noe vi kjenner igjen, hopp over trygt

    for (const fixture of stage.fixtures) {
      if (fixture.status !== 'Result') continue // kun ferdigspilte kamper
      if (!fixture.participant1 || !fixture.participant2) continue
      if (fixture.participant1Score == null || fixture.participant2Score == null) continue
      if (fixture.participant1Score === fixture.participant2Score) continue // bør ikke skje i darts, men vær trygg

      const player1 = normalizeName(fixture.participant1.firstName, fixture.participant1.lastName)
      const player2 = normalizeName(fixture.participant2.firstName, fixture.participant2.lastName)
      const winner = fixture.participant1Score > fixture.participant2Score ? player1 : player2

      const { error } = await upsertMatchResult(supabase, {
        player1, player2, sets1: fixture.participant1Score, sets2: fixture.participant2Score,
        stage: stageKey, winner,
      })
      if (error) errors.push(`${player1} vs ${player2}: ${error}`)
      else synced.push(`${player1} ${fixture.participant1Score}-${fixture.participant2Score} ${player2}`)
    }
  }

  if (synced.length > 0) await logAdminAction('pdc-sync.upsert', { synced, errors })

  return NextResponse.json({ ok: errors.length === 0, synced: synced.length, results: synced, errors })
}
