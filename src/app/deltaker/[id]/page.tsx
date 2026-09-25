import Link from 'next/link'
import { notFound } from 'next/navigation'
import BrandBanner from '@/components/BrandBanner'
import ShareButton from '@/components/ShareButton'
import { getParticipantPageData } from '@/lib/participantData'
import { STAGE_ORDER, type Stage } from '@/config/scoring'
import CountUp from './CountUp'
import PointsDelta from './PointsDelta'
import LogoutButton from './LogoutButton'
import Countdown from '@/components/Countdown'
import type { Metadata } from 'next'
import DemoBanner from './DemoBanner'
import MyTeam from './MyTeam'
import NextMatches from './NextMatches'
import LeagueSection from '@/components/LeagueSection'
import SectionHeader from '@/components/SectionHeader'
import LocaleSwitch from '@/components/LocaleSwitch'
import { IconTarget, IconNextMatch, IconTrophy } from '@/components/icons'
import { SPORT, CARD_GRADIENT, CARD_SHADOW } from '@/config/theme'
import { getLocale } from '@/lib/i18n/getLocale'
import { getDictionary } from '@/i18n/dictionaries'

const STAGE_INDEX: Record<string, number> = Object.fromEntries(STAGE_ORDER.map((s, i) => [s, i]))

// Én farge per seksjon — sammen med ikonet gjør dette det umiddelbart tydelig
// hvilken del av Min side man ser på.
const TEAM_COLOR = '#f3d576' // gull — samme farge som «Laget ditt»-finalen i intro-animasjonen
const MATCH_COLOR = '#60a5fa' // blå — «neste kamper»
const LEAGUE_COLOR = '#4ade80' // grønn — samme som leaderboard/plassering

const CARD: React.CSSProperties = {
  background: CARD_GRADIENT,
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 16,
  boxShadow: CARD_SHADOW,
}
const LABEL: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }

export const revalidate = 30

export async function generateMetadata({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ fase?: string }>
}): Promise<Metadata> {
  const { id } = await params
  const { fase } = await searchParams
  // cache() i datalaget gjør at siden ikke spør databasen én gang til.
  const [data, locale] = await Promise.all([getParticipantPageData(id, fase), getLocale()])
  return { title: data ? data.participant.name : getDictionary(locale).deltaker.page.myPage }
}

export default async function DeltakerPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string; fase?: string }>
}) {
  const { id } = await params
  const { from, fase } = await searchParams

  const data = await getParticipantPageData(id, fase)
  if (!data) notFound()
  const locale = await getLocale()
  const { deltaker, common, players } = getDictionary(locale)
  const { participant: p, picks, matchResults, totalPoints, rank, totalParticipants, vmStarted, demo } = data

  // Kontekst-bevisst tilbake-lenke: kom man fra en liga/leaderboard, gå dit — ellers startside.
  const back = from?.startsWith('liga-')
    ? { href: `/liga/${from.slice(5)}`, label: deltaker.page.backLeague }
    : from === 'leaderboard'
      ? { href: '/leaderboard', label: deltaker.page.backLeaderboard }
      : { href: '/', label: common.nav.home }

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
        <LocaleSwitch />
      </div>

      {/* Navn */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ ...LABEL, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.15em', marginBottom: 2 }}>{deltaker.page.myPage}</div>
        <h1 style={{ fontFamily: SPORT, fontSize: 28, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1, margin: 0, letterSpacing: '-0.01em', overflowWrap: 'anywhere' }}>{p.name}</h1>
      </div>

      {vmStarted ? (
        /* ── Poeng og plassering — kompakt, dette er en oppslagsboks, ikke en hovedvisning ── */
        <div style={{ ...CARD, display: 'flex', alignItems: 'stretch' }}>
          <div style={{ flex: 1, padding: '10px 14px', minWidth: 0 }}>
            <div style={{ ...LABEL, marginBottom: 4 }}>{deltaker.page.totalPoints}</div>
            <CountUp value={totalPoints} size={34} />
            <div style={{ marginTop: 4, minHeight: 20 }}><PointsDelta participantId={p.id} totalPoints={totalPoints} /></div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />
          <Link href="/leaderboard" className="pick-row" style={{ flex: '0 0 auto', padding: '10px 16px', textAlign: 'center', textDecoration: 'none', color: 'inherit', minWidth: 88 }}>
            <div style={{ ...LABEL, marginBottom: 4 }}>{deltaker.page.rank}</div>
            <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: rank === 1 ? '#4ade80' : '#fff' }}>
              {rank} <span aria-hidden style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>›</span>
            </div>
          </Link>
        </div>
      ) : (
        /* ── Før VM: nedtelling + endre laget ── */
        <div style={{ ...CARD, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ ...LABEL, marginBottom: 6 }}>{deltaker.page.startsIn}</div>
            <Countdown size={26} />
          </div>
          {editable && (
            <Link href={`/tipp?edit=${p.id}`} className="cta-btn" style={{ padding: '10px 18px', borderRadius: 999, background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontFamily: SPORT, fontSize: 14, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(220,38,38,0.3)' }}>
              {deltaker.page.editTeam}
            </Link>
          )}
        </div>
      )}

      {/* ── Mitt lag ── */}
      <SectionHeader icon={<IconTarget />} color={TEAM_COLOR} title={deltaker.page.myTeamHeader} />
      <MyTeam picks={picks} matchResults={matchResults} vmStarted={vmStarted} />

      {vmStarted && displayStage && (
        <Link href="/vm-info?tab=kamper" className="guide-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 10, padding: '9px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', textDecoration: 'none', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
          <span>
            {displayStage === 'winner'
              ? <>{deltaker.page.vmDecidedPrefix} <span style={{ color: '#fff', fontWeight: 700 }}>{deltaker.page.vmDecided}</span></>
              : <>{deltaker.page.vmInStagePrefix} <span style={{ color: '#fff', fontWeight: 700 }}>{players.stages[displayStage].toLowerCase()}</span></>}
          </span>
          <span style={{ fontWeight: 700, color: '#fff' }}>{deltaker.page.allMatches}</span>
        </Link>
      )}

      {/* ── Neste kamper ── */}
      <SectionHeader icon={<IconNextMatch />} color={MATCH_COLOR} title={deltaker.page.nextMatchesHeader} />
      <NextMatches picks={picks} matchResults={matchResults} />

      {/* ── Ligaer ── */}
      <SectionHeader icon={<IconTrophy />} color={LEAGUE_COLOR} title={deltaker.page.leaguesHeader} />
      <LeagueSection participantId={p.id} showHeader={false} showInviteInline={false} overallRank={rank} overallTotal={totalParticipants} vmStarted={vmStarted} />

      {/* ── Info, deling, bytt bruker ── */}
      <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
        <Link href="/vm-info" className="guide-btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '13px 14px', textAlign: 'center', background: 'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.05) 100%)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 12px rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: SPORT, textDecoration: 'none' }}>
          {deltaker.page.vmGuide}
        </Link>
        <ShareButton
          url={`/deltaker/${p.id}`}
          text={vmStarted ? deltaker.page.shareText(rank, totalParticipants) : deltaker.page.shareTextClosed}
          label={deltaker.page.shareLabel}
          variant="pill"
        />
      </div>

      <LogoutButton />
    </div>
  )
}
