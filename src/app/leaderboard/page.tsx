import Link from 'next/link'
import SmartBackButton from '@/components/SmartBackButton'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const supabase = getSupabaseAdmin()
import { POTS } from '@/data/pots'
import { calcParticipantPoints, isPlayerEliminated, isPlayerChampion, furthestStageReached, MatchResult } from '@/lib/scoring'
import { STAGE_ORDER } from '@/config/scoring'
import LeaderboardCountdown from './LeaderboardCountdown'
import LeaderboardMyPage from './LeaderboardMyPage'
import LeaderboardRows, { LeaderboardRow } from './LeaderboardRows'
import LastUpdated from '../deltaker/[id]/LastUpdated'
import { getRankBaseline } from '@/lib/rankSnapshot'

const KICKOFF = new Date('2026-12-11T19:00:00Z')

export const revalidate = 30

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

interface Participant { id: string; name: string }
interface Pick { participant_id: string; pot_number: number; player_name: string }

async function getData() {
  const [{ data: participants }, { data: matches }] = await Promise.all([
    supabase.from('participants').select('id, name').order('created_at'),
    supabase.from('match_results').select('player1, player2, sets1, sets2, stage, winner'),
  ])

  const matchResults = (matches as MatchResult[]) ?? []

  if (!participants?.length) return { rows: [], matchResults, baseline: {} as Record<string, number> }

  const ids = (participants as Participant[]).map((p) => p.id)
  const { data: picks } = await supabase
    .from('picks')
    .select('participant_id, pot_number, player_name')
    .in('participant_id', ids)

  const rows = (participants as Participant[]).map((p) => {
    const playerPicks = ((picks as Pick[]) ?? []).filter((pk) => pk.participant_id === p.id)
    const points = calcParticipantPoints(playerPicks, matchResults)
    // Sum av hver spillers kamper (for underveis-visning av antall spilte kamper).
    const matchesPlayed = playerPicks.reduce((sum, pk) =>
      sum + matchResults.filter(m => m.player1 === pk.player_name || m.player2 === pk.player_name).length, 0)
    return {
      participant: p,
      picks: playerPicks.sort((a, b) => a.pot_number - b.pot_number),
      points,
      matchesPlayed,
    }
  }).sort((a, b) => b.points - a.points)

  // Rang-piler: baseline = siste lagrede rangering (overall)
  const baseline = await getRankBaseline('overall')

  return { rows, matchResults, baseline }
}

export default async function LeaderboardPage() {
  const beforeKickoff = new Date() < KICKOFF
  const { rows, matchResults, baseline } = await getData()
  const vmStarted = !beforeKickoff

  const enrichedRows: LeaderboardRow[] = rows.map(({ participant, picks: playerPicks, points, matchesPlayed }, i) => {
    const prevRank = baseline[participant.id]
    return {
      id: participant.id,
      name: participant.name,
      points,
      matchesPlayed,
      rankDelta: vmStarted && prevRank != null ? prevRank - (i + 1) : undefined,
      flags: playerPicks.map(pk => {
        const pot = POTS.find(p => p.potNumber === pk.pot_number)
        const iso2 = pot?.players.find(pl => pl.name === pk.player_name)?.iso2 ?? ''
        const stageReached = furthestStageReached(pk.player_name, matchResults, STAGE_ORDER)
        const champion = isPlayerChampion(pk.player_name, matchResults)
        const medal = champion ? 'gold' : stageReached === 'final' ? 'silver' : undefined
        return { iso2, eliminated: isPlayerEliminated(pk.player_name, matchResults), medal }
      }),
    }
  })

  return (
    <div className="page-bg" style={{ minHeight: '100vh', color: '#fff', padding: '32px 16px 56px', position: 'relative' }}>

      <div style={{ marginBottom: 12, position: 'relative', zIndex: 1 }}>
        <SmartBackButton />
      </div>

      {/* Brand banner */}
      <div style={{ position: 'relative', height: 145, marginBottom: 16, pointerEvents: 'none', zIndex: 1 }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.3, paddingTop: 4, whiteSpace: 'nowrap', background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)' }}>
            — PDC World Championship —
          </div>
          <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: 52, letterSpacing: '-1px', lineHeight: 1, whiteSpace: 'nowrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.38)' }}>DART-VM-</span>
            <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: SPORT, fontSize: 56, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 6, whiteSpace: 'nowrap' }}>
          <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Leader</span><span style={{ color: '#dc2626' }}>board</span>
        </div>
        {!beforeKickoff && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{rows.length} deltakere</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)' }}>·</span>
            <LastUpdated fetchedAt={new Date().toISOString()} />
          </div>
        )}
      </div>

      <LeaderboardMyPage />

      {beforeKickoff ? (
        <LeaderboardCountdown />
      ) : rows.length === 0 ? (
        <div style={{ background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)', borderRadius: 16, padding: '40px 20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.12)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Ingen deltakere ennå</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>
            Vises her når dart-VM starter 11. desember
          </div>
          <Link href="/tipp" className="cta-btn" style={{ display: 'inline-block', padding: '13px 28px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 10, textDecoration: 'none', fontFamily: SPORT }}>
            Meld deg på →
          </Link>
        </div>
      ) : (
        <LeaderboardRows rows={enrichedRows} vmStarted={vmStarted} />
      )}

    </div>
  )
}
