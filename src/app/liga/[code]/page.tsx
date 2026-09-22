import { notFound } from 'next/navigation'
import SmartBackButton from '@/components/SmartBackButton'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const supabase = getSupabaseAdmin()
import { POTS } from '@/data/pots'
import { calcParticipantPoints, isPlayerEliminated, MatchResult, AdvancementRow } from '@/lib/scoring'
import CopyCode from '@/components/CopyCode'
import DeadlineCountdown from '@/app/deltaker/[id]/DeadlineCountdown'
import RankList, { RankEntry } from '@/components/RankList'
import { getRankBaseline, RANK_ARROW_LEAGUES } from '@/lib/rankSnapshot'

export const revalidate = 30

const KICKOFF = new Date('2026-12-11T19:00:00Z')
const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

interface Pick { participant_id: string; pot_number: number; player_name: string }

async function getData(code: string) {
  const { data: league } = await supabase
    .from('leagues')
    .select('id, name, invite_code, created_by, hidden_until_kickoff')
    .eq('invite_code', code.toUpperCase())
    .maybeSingle()

  if (!league) return null

  const { data: members } = await supabase
    .from('league_members')
    .select('participant:participants(id, name)')
    .eq('league_id', league.id)

  if (!members?.length) return { league, rows: [], matchResults: [], advRows: [] }

  const ids = members
    .map((m) => (m.participant as unknown as { id: string; name: string } | null)?.id)
    .filter(Boolean) as string[]

  const [{ data: picks }, { data: matches }, { data: advancement }] = await Promise.all([
    supabase.from('picks').select('participant_id, pot_number, player_name').in('participant_id', ids),
    supabase.from('match_results').select('player1, player2, sets1, sets2, stage'),
    supabase.from('advancement').select('player_name, stage_reached'),
  ])

  const matchResults = (matches as MatchResult[]) ?? []
  const advRows = (advancement as AdvancementRow[]) ?? []

  const rows = members
    .map((m) => {
      const p = m.participant as unknown as { id: string; name: string } | null
      if (!p) return null
      const playerPicks = ((picks as Pick[]) ?? []).filter((pk) => pk.participant_id === p.id)
      const points = calcParticipantPoints(playerPicks, advRows)
      // Sum av hver spillers kamper (for underveis-visning av antall spilte kamper).
      const matchesPlayed = playerPicks.reduce((sum, pk) =>
        sum + matchResults.filter((mt) => mt.player1 === pk.player_name || mt.player2 === pk.player_name).length, 0)
      return { id: p.id, name: p.name, points, matchesPlayed, picks: playerPicks.sort((a, b) => a.pot_number - b.pot_number) }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.points - a.points)

  return { league, rows, matchResults, advRows }
}

export default async function LigaPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const data = await getData(code)
  if (!data) notFound()

  const { league, rows, matchResults, advRows } = data
  const vmStarted = new Date() >= KICKOFF

  // Rang-piler kun for utvalgte ligaer (f.eks. Ståle Solbakken Fan Club)
  const showArrows = RANK_ARROW_LEAGUES.includes(league.invite_code)
  const baseline = showArrows ? await getRankBaseline(league.invite_code) : {}
  const hidden = !vmStarted && !!league.hidden_until_kickoff

  return (
    <div className="page-bg" style={{ minHeight: '100vh', color: '#fff', padding: '32px 16px 56px', position: 'relative' }}>

      {/* Brand banner */}
      <div style={{ position: 'relative', height: 150, marginBottom: 16, pointerEvents: 'none', zIndex: 1 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'auto' }}>
          <SmartBackButton />
        </div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.3, paddingTop: 4, whiteSpace: 'nowrap', background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)' }}>
            — PDC World Championship —
          </div>
          <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: 52, letterSpacing: '-1px', lineHeight: 1 }}>
            <span style={{ color: 'rgba(255,255,255,0.38)' }}>DART-VM-</span>
            <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        {!vmStarted && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 8 }}>
            <CopyCode code={league.invite_code} fontSize={14} color="rgba(255,255,255,0.5)" letterSpacing="0.18em" />
          </div>
        )}
        <div style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.05, textAlign: 'center', letterSpacing: '0.06em' }}>
          <span style={{ color: 'rgba(255,255,255,0.22)' }}>— </span>
          <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{league.name}</span>
          <span style={{ color: 'rgba(255,255,255,0.22)' }}> —</span>
        </div>
      </div>

      {hidden ? (
        <div style={{ background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)', padding: '40px 20px', textAlign: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)' }}>
          <div style={{ fontSize: 22, marginBottom: 10 }}>🔒</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Deltakerlisten er skjult</div>
          <DeadlineCountdown />
        </div>
      ) : rows.length === 0 ? (
        <div style={{ background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)', padding: '40px 20px', textAlign: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Ingen deltakere ennå</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Del ligakoden med venner så de kan bli med</div>
        </div>
      ) : (
        <RankList
          rows={rows.map(({ id, name, points, matchesPlayed, picks: playerPicks }, i): RankEntry => ({
            id,
            name,
            points,
            matchesPlayed,
            rankDelta: vmStarted && baseline[id] != null ? baseline[id] - (i + 1) : undefined,
            flags: playerPicks.map((pk) => {
              const pot = POTS.find((p) => p.potNumber === pk.pot_number)
              const iso2 = pot?.players.find((pl) => pl.name === pk.player_name)?.iso2 ?? ''
              const stageReached = advRows.find((a) => a.player_name === pk.player_name)?.stage_reached
              const medal = stageReached === 'winner' ? 'gold' : stageReached === 'final' ? 'silver' : undefined
              return { iso2, eliminated: isPlayerEliminated(pk.player_name, matchResults), medal }
            }),
          }))}
          vmStarted={vmStarted}
          kick={{ leagueId: league.id, createdBy: league.created_by }}
          scrollToMe={false}
          backRef={`liga-${league.invite_code}`}
        />
      )}
    </div>
  )
}
