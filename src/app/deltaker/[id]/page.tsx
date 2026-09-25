import Link from 'next/link'
import { notFound } from 'next/navigation'
import BrandBanner from '@/components/BrandBanner'
import ShareButton from '@/components/ShareButton'
import { getParticipantPageData } from '@/lib/participantData'
import { STAGE_ORDER, STAGE_LABELS, type Stage } from '@/config/scoring'
import CountUp from './CountUp'
import PointsDelta from './PointsDelta'
import LogoutButton from './LogoutButton'
import Countdown from '@/components/Countdown'
import type { Metadata } from 'next'
import DemoBanner from './DemoBanner'
import MyTeam from './MyTeam'
import LeagueSection from '@/components/LeagueSection'
import { SPORT, CARD_GRADIENT, CARD_SHADOW } from '@/config/theme'

const STAGE_INDEX: Record<string, number> = Object.fromEntries(STAGE_ORDER.map((s, i) => [s, i]))

const CARD: React.CSSProperties = {
  background: CARD_GRADIENT,
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 16,
  boxShadow: CARD_SHADOW,
}
const LABEL: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0 8px' }}>
      <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
      {action}
    </div>
  )
}

export const revalidate = 30

export async function generateMetadata({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ fase?: string }>
}): Promise<Metadata> {
  const { id } = await params
  const { fase } = await searchParams
  // cache() i datalaget gjør at siden ikke spør databasen én gang til.
  const data = await getParticipantPageData(id, fase)
  return { title: data ? data.participant.name : 'Min side' }
}

export default async function DeltakerPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string; fase?: string }>
}) {
  const { id } = await params
  const { from, fase } = await searchParams

  const data = await getParticipantPageData(id, fase)
  if (!data) notFound()
  const { participant: p, picks, matchResults, totalPoints, rank, totalParticipants, vmStarted, demo } = data

  // Kontekst-bevisst tilbake-lenke: kom man fra en liga/leaderboard, gå dit — ellers startside.
  const back = from?.startsWith('liga-')
    ? { href: `/liga/${from.slice(5)}`, label: '← Ligaen' }
    : from === 'leaderboard'
      ? { href: '/leaderboard', label: '← Leaderboard' }
      : { href: '/', label: '← Hjem' }

  const editable = !vmStarted && !demo

  // Turneringens gjeldende fase — høyeste runde med registrert kampresultat,
  // eller «avgjort» dersom finalen er spilt.
  const finalWon = matchResults.some(m => m.stage === 'final' && m.winner != null)
  let maxIdx = -1
  for (const m of matchResults) {
    const idx = STAGE_INDEX[m.stage ?? 'r1']
    if (idx !== undefined && idx > maxIdx) maxIdx = idx
  }
  const displayStage: Stage | 'winner' | null = finalWon ? 'winner' : maxIdx >= 0 ? STAGE_ORDER[maxIdx] : null

  return (
    <div className="page-bg app-frame" style={{ minHeight: '100vh', color: '#fff', padding: '16px 20px 40px', position: 'relative' }}>
      {demo && <DemoBanner phase={demo} participantId={p.id} />}

      <BrandBanner compact />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '6px 0 14px' }}>
        <Link href={back.href} className="back-btn">{back.label}</Link>
      </div>

      {/* Navn */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ ...LABEL, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.15em', marginBottom: 2 }}>Min side</div>
        <h1 style={{ fontFamily: SPORT, fontSize: 28, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1, margin: 0, letterSpacing: '-0.01em', overflowWrap: 'anywhere' }}>{p.name}</h1>
      </div>

      {vmStarted ? (
        <>
          {/* ── Poeng og plassering ── */}
          <div style={{ ...CARD, display: 'flex', alignItems: 'stretch' }}>
            <div style={{ flex: 1, padding: '12px 14px', minWidth: 0 }}>
              <div style={{ ...LABEL, marginBottom: 6 }}>Totalpoeng</div>
              <CountUp value={totalPoints} size={46} />
              <div style={{ marginTop: 6, minHeight: 22 }}><PointsDelta participantId={p.id} totalPoints={totalPoints} /></div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '10px 0' }} />
            <Link href="/leaderboard" className="pick-row" style={{ flex: '0 0 auto', padding: '12px 14px', textAlign: 'right', textDecoration: 'none', color: 'inherit', minWidth: 118 }}>
              <div style={{ ...LABEL, marginBottom: 6 }}>Plassering</div>
              <div style={{ fontFamily: SPORT, fontSize: 46, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: rank === 1 ? '#4ade80' : '#fff' }}>#{rank}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>av {totalParticipants} deltakere ›</div>
            </Link>
          </div>

          {displayStage && (
            <Link href="/vm-info?tab=kamper" className="guide-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8, padding: '9px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', textDecoration: 'none', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
              <span>
                {displayStage === 'winner'
                  ? <>VM er <span style={{ color: '#fff', fontWeight: 700 }}>avgjort</span></>
                  : <>VM er i <span style={{ color: '#fff', fontWeight: 700 }}>{STAGE_LABELS[displayStage].toLowerCase()}</span></>}
              </span>
              <span style={{ fontWeight: 700, color: '#fff' }}>Alle kamper →</span>
            </Link>
          )}
        </>
      ) : (
        /* ── Før VM: nedtelling + endre laget ── */
        <div style={{ ...CARD, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ ...LABEL, marginBottom: 6 }}>VM starter om</div>
            <Countdown size={26} />
          </div>
          {editable && (
            <Link href={`/tipp?edit=${p.id}`} className="cta-btn" style={{ padding: '10px 18px', borderRadius: 999, background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontFamily: SPORT, fontSize: 14, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(220,38,38,0.3)' }}>
              Endre laget →
            </Link>
          )}
        </div>
      )}

      {/* ── Laget ── */}
      <SectionTitle>Laget ditt</SectionTitle>
      <MyTeam picks={picks} matchResults={matchResults} vmStarted={vmStarted} />

      {/* ── Ligaer ── */}
      <SectionTitle>Ligaer</SectionTitle>
      <LeagueSection participantId={p.id} showHeader={false} overallRank={rank} overallTotal={totalParticipants} vmStarted={vmStarted} />

      {/* ── Info, deling, bytt bruker ── */}
      <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
        <Link href="/vm-info" className="guide-btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '13px 14px', textAlign: 'center', background: 'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.05) 100%)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 12px rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: SPORT, textDecoration: 'none' }}>
          VM-guide →
        </Link>
        <ShareButton
          url={`/deltaker/${p.id}`}
          text={vmStarted ? `Jeg er #${rank} av ${totalParticipants} i Dart-VM-spillet!` : 'Bli med i Dart-VM-spillet – velg seks dartspillere og følg dem gjennom VM!'}
          label="Del →"
          variant="pill"
        />
      </div>

      <LogoutButton />
    </div>
  )
}
