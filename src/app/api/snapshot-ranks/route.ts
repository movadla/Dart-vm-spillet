import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { calcParticipantPoints, MatchResult } from '@/lib/scoring'

// Ligaer som skal ha rang-piler (i tillegg til 'overall'). Bruk invite_code.
const SNAPSHOT_LEAGUES = ['4B86F9', 'QTXXCF']

interface Pick { participant_id: string; pot_number: number; player_name: string }

// Lagrer dagens rangering (overall + utvalgte ligaer) i rank_snapshot.
// Kjøres daglig (GitHub Actions). Pilene på leaderboard/liga = snapshot-rang − dagens rang.
export async function GET(req: Request) {
  // Klienten lages per kall — manglende Supabase-konfigurasjon skal gi et
  // forståelig svar fra handleren, ikke crash ved import av ruten.
  const supabase = getSupabaseAdmin()
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')
  if (secret !== process.env.SYNC_SECRET && req.headers.get('x-vercel-cron') !== '1') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [{ data: participants }, { data: matches }] = await Promise.all([
    supabase.from('participants').select('id'),
    supabase.from('match_results').select('player1, player2, sets1, sets2, stage, winner'),
  ])
  if (!participants?.length) return NextResponse.json({ ok: true, snapshotted: 0, note: 'ingen deltakere' })

  const matchResults = (matches as MatchResult[]) ?? []

  // Hent alle picks (paginert, unngå 1000-rad-grensen)
  const allPicks: Pick[] = []
  for (let from = 0; ; from += 1000) {
    const { data } = await supabase.from('picks').select('participant_id, pot_number, player_name').range(from, from + 999)
    if (!data?.length) break
    allPicks.push(...(data as Pick[]))
    if (data.length < 1000) break
  }

  const picksByParticipant: Record<string, Pick[]> = {}
  for (const p of allPicks) (picksByParticipant[p.participant_id] ??= []).push(p)
  const pointsOf = (id: string) => calcParticipantPoints(picksByParticipant[id] ?? [], matchResults)

  const today = new Date().toISOString().slice(0, 10)
  const rows: { scope: string; participant_id: string; rank_pos: number; snapshot_date: string }[] = []

  const rankInto = (scope: string, ids: string[]) => {
    ids.map(id => ({ id, pts: pointsOf(id) }))
      .sort((a, b) => b.pts - a.pts)
      .forEach((r, i) => rows.push({ scope, participant_id: r.id, rank_pos: i + 1, snapshot_date: today }))
  }

  // Overall (alle deltakere)
  rankInto('overall', participants.map(p => p.id))

  // Utvalgte ligaer
  for (const code of SNAPSHOT_LEAGUES) {
    const { data: league } = await supabase.from('leagues').select('id').eq('invite_code', code).maybeSingle()
    if (!league) continue
    const { data: members } = await supabase.from('league_members').select('participant_id').eq('league_id', league.id)
    rankInto(code, (members ?? []).map(m => m.participant_id as string))
  }

  const { error } = await supabase.from('rank_snapshot').upsert(rows, { onConflict: 'scope,participant_id,snapshot_date' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, snapshotted: rows.length, date: today })
}
