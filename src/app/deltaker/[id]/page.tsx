import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const supabase = getSupabaseAdmin()
import { notFound } from 'next/navigation'
import { calcParticipantPoints, type PickWithPot, type MatchResult } from '@/lib/scoring'
import { STAGE_ORDER, STAGE_LABELS, type Stage } from '@/config/scoring'
import CountUp from './CountUp'
import MinSideAccordions from './MinSideAccordions'
import PicksClient from './PicksClient'
import PointsDelta from './PointsDelta'
import LogoutButton from './LogoutButton'
import ShareButton from '@/app/ShareButton'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

interface Participant { id: string; name: string; email: string; created_at: string }
interface PickRow extends PickWithPot { participant_id: string }

const DEADLINE = new Date('2026-12-11T19:00:00Z')

const STAGE_INDEX: Record<string, number> = Object.fromEntries(STAGE_ORDER.map((s, i) => [s, i]))

export const revalidate = 30

export default async function DeltakerPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ from?: string }> }) {
  const { id } = await params
  const { from } = await searchParams

  // Kontekst-bevisst tilbake-lenke: kom man fra en liga/leaderboard, gå dit — ellers startside.
  const back = from?.startsWith('liga-')
    ? { href: `/liga/${from.slice(5)}`, label: '← Tilbake til ligaen' }
    : from === 'leaderboard'
      ? { href: '/leaderboard', label: '← Leaderboard' }
      : { href: '/', label: '← Startside' }

  const [
    { data: participant },
    { data: picksData },
    { data: matches },
    { data: allPicksData },
  ] = await Promise.all([
    supabase.from('participants').select('id, name, email, created_at').eq('id', id).single(),
    supabase.from('picks').select('pot_number, player_name').eq('participant_id', id).order('pot_number'),
    supabase.from('match_results').select('player1, player2, sets1, sets2, stage, winner'),
    supabase.from('picks').select('participant_id, pot_number, player_name'),
  ])

  if (!participant) notFound()

  const p = participant as Participant
  const picks = (picksData as PickWithPot[]) ?? []
  const matchResults = (matches as MatchResult[]) ?? []

  const totalPoints = calcParticipantPoints(picks, matchResults)
  const editable = new Date() < DEADLINE
  const vmStarted = new Date() >= DEADLINE

  // Turneringens gjeldende fase — høyeste runde med registrert kampresultat,
  // eller "kåret vinner" dersom finalen er avgjort.
  const finalWon = matchResults.some(m => m.stage === 'final' && m.winner != null)
  const displayStage: Stage | 'winner' | null = (() => {
    if (finalWon) return 'winner'
    let maxIdx = -1
    for (const m of matchResults) {
      const idx = STAGE_INDEX[m.stage ?? 'r1']
      if (idx !== undefined && idx > maxIdx) maxIdx = idx
    }
    if (maxIdx >= 0) return STAGE_ORDER[maxIdx]
    return null
  })()

  // Rank-beregning blant alle deltakere
  const allPicksList = (allPicksData as PickRow[]) ?? []
  const byParticipant = new Map<string, PickWithPot[]>()
  for (const pick of allPicksList) {
    if (!byParticipant.has(pick.participant_id)) byParticipant.set(pick.participant_id, [])
    byParticipant.get(pick.participant_id)!.push({ pot_number: pick.pot_number, player_name: pick.player_name })
  }
  const totalParticipants = byParticipant.size
  const rank = Array.from(byParticipant.values())
    .filter(pp => calcParticipantPoints(pp, matchResults) > totalPoints)
    .length + 1

  return (
    <div className="page-bg" style={{ minHeight: '100vh', color: '#fff', padding: '32px 16px 56px', position: 'relative' }}>

      {/* Brand banner — nav + VM-SPILLET */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 60, zIndex: 1 }}>
        <Link href={back.href} className="back-btn">{back.label}</Link>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', lineHeight: 1.3, paddingTop: 4, whiteSpace: 'nowrap', background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)' }}>
            — PDC World Championship —
          </div>
          <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: 32, letterSpacing: '-0.5px', lineHeight: 1, whiteSpace: 'nowrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.38)' }}>DART-VM-</span>
            <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
          </div>
        </div>
        <Link href="/vm-info?fra=minside" className="back-btn">Info →</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18))' }} />
        <div style={{ fontFamily: SPORT, fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.3, paddingTop: 4, background: 'linear-gradient(180deg, #ffffff 0%, #86efac 55%, rgba(34,197,94,0.8) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap', textShadow: '0 0 20px rgba(34,197,94,0.2), 0 0 6px rgba(34,197,94,0.25)' }}>{p.name}</div>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.18))' }} />
      </div>

      {vmStarted ? (
        <>
          {/* ── TOTALPOENG + MINE SPILLERE ── */}
          <div style={{ marginTop: 24, marginBottom: 12 }}>
            {/* Totalpoeng-boks øverst */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', marginBottom: 20, background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', flexShrink: 0 }}>Totalpoeng</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <PointsDelta participantId={p.id} totalPoints={totalPoints} />
                <div style={{ width: 64, textAlign: 'right', flexShrink: 0 }}><CountUp value={totalPoints} /></div>
              </div>
            </div>
            {/* Mine spillere under */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)', flexShrink: 0 }}>Mine spillere</div>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1))' }} />
            </div>
            <PicksClient picks={picks} matchResults={matchResults} totalPoints={totalPoints} vmStarted={vmStarted} pointsAccent="green" pointsColWidth={64} alignPointsTop stageBadgeInline stageBadgeColor="#4ade80" hideTotal />
          </div>

          {/* ── LIGAER (under) ── */}
          <div style={{ marginTop: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', flexShrink: 0 }}>Ligaer</div>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1))' }} />
            </div>
            <MinSideAccordions participantId={p.id} overallRank={rank} overallTotal={totalParticipants} actionsHidden />
          </div>

          {/* ── VM-STATUS ── */}
          {displayStage && (
            <Link href="/vm-info" className="guide-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', marginBottom: 10, marginTop: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, textDecoration: 'none' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                {displayStage === 'winner'
                  ? <>VM er <span style={{ color: '#fff', fontWeight: 700 }}>avgjort</span></>
                  : <>VM er i <span style={{ color: '#fff', fontWeight: 700 }}>{STAGE_LABELS[displayStage]}</span>-fasen</>}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Se bracket →</span>
            </Link>
          )}
        </>
      ) : (
        <>
          {/* ── LIGAER (før VM) ── */}
          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)', flexShrink: 0 }}>Ligaer</div>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1))' }} />
            </div>
            <MinSideAccordions participantId={p.id} overallRank={rank} overallTotal={totalParticipants} />
          </div>

          {/* ── MINE SPILLERE ── */}
          <div style={{ marginTop: 44, marginBottom: 12 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)', flexShrink: 0 }}>Mine spillere</div>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1))' }} />
              {editable && (
                <Link href={`/tipp?edit=${id}`} className="text-link" style={{ position: 'absolute', right: 0, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', letterSpacing: '0.04em' }}>
                  ✏️ Endre
                </Link>
              )}
            </div>
            <PicksClient picks={picks} matchResults={matchResults} totalPoints={totalPoints} vmStarted={vmStarted} pointsAccent="green" pointsColWidth={48} alignPointsTop stageBadgeInline stageBadgeColor="#4ade80" />
          </div>
        </>
      )}

      {/* ── INFO OG VM-GUIDE ── */}
      <Link
        href="/vm-info"
        className="guide-btn"
        style={{
          display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 28,
          padding: '16px 22px', textAlign: 'center',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.05) 100%)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 14,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 12px rgba(0,0,0,0.3)',
          color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: SPORT, textDecoration: 'none',
        }}
      >
        VM-guide og Info →
      </Link>

      {/* ShareButton fantes ferdig bygget men var aldri brukt noe sted —
          «min side» (denne siden) er det mest naturlige stedet å dele fra:
          folk viser gjerne frem plasseringen sin. */}
      <div style={{ marginTop: 12 }}>
        <ShareButton
          url={`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3001'}/deltaker/${p.id}`}
          text={`Jeg er #${rank} av ${totalParticipants} i Dart-VM-spillet!`}
          label="Del min plassering →"
        />
      </div>

      <LogoutButton />

    </div>
  )
}
