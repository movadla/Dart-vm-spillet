import Link from 'next/link'
import { notFound } from 'next/navigation'
import SmartBackButton from '@/components/SmartBackButton'
import BrandBanner from '@/components/BrandBanner'
import CopyCode from '@/components/CopyCode'
import RankList from '@/components/RankList'
import Countdown from '@/components/Countdown'
import type { Metadata } from 'next'
import LastUpdated from '@/components/LastUpdated'
import ShareButton from '@/components/ShareButton'
import LocaleSwitch from '@/components/LocaleSwitch'
import { getLeagueData } from '@/lib/participantData'
import { SPORT, CARD_GRADIENT, CARD_SHADOW } from '@/config/theme'
import { getLocale } from '@/lib/i18n/getLocale'
import { getDictionary } from '@/i18n/dictionaries'
import { formatKickoffDate } from '@/config/tournament'

export const revalidate = 30

export async function generateMetadata({ params, searchParams }: {
  params: Promise<{ code: string }>
  searchParams: Promise<{ fase?: string }>
}): Promise<Metadata> {
  const { code } = await params
  const { fase } = await searchParams
  const [data, locale] = await Promise.all([getLeagueData(code, fase), getLocale()])
  const { liga } = getDictionary(locale)
  return { title: data ? `${data.league.name} – ${liga.metaFallback.toLowerCase()}` : liga.metaFallback }
}

const CARD: React.CSSProperties = {
  background: CARD_GRADIENT,
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: CARD_SHADOW,
}

export default async function LigaPage({ params, searchParams }: {
  params: Promise<{ code: string }>
  searchParams: Promise<{ fase?: string }>
}) {
  const { code } = await params
  const { fase } = await searchParams
  const data = await getLeagueData(code, fase)
  if (!data) notFound()
  const locale = await getLocale()
  const { liga, leaderboard, common } = getDictionary(locale)

  const { league, rows, vmStarted, demo } = data
  const hidden = !vmStarted && !!league.hidden_until_kickoff

  return (
    <div className="page-bg app-frame" style={{ minHeight: '100vh', color: '#fff', padding: '16px 20px 40px', position: 'relative' }}>
      <BrandBanner compact />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '6px 0 14px' }}>
        <SmartBackButton />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {demo && (
            <Link href="/deltaker/demo" style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 999, padding: '5px 10px', textDecoration: 'none' }}>
              {leaderboard.demoBadge}
            </Link>
          )}
          <LocaleSwitch />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>{liga.sectionLabel}</div>
        <h1 style={{ fontFamily: SPORT, fontSize: 28, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1, margin: 0, letterSpacing: '-0.01em', overflowWrap: 'anywhere' }}>{league.name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap' }}>
          <span>{liga.participants(rows.length)}</span>
          {vmStarted && (
            <>
              <span aria-hidden style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
              <LastUpdated fetchedAt={new Date().toISOString()} />
            </>
          )}
        </div>
      </div>

      {/* Før VM: invitasjonskode + deling, så ligaen kan fylles opp */}
      {!vmStarted && (
        <div style={{ ...CARD, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 12px 10px 14px', marginBottom: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 3 }}>{liga.inviteCode.label}</div>
            <CopyCode code={league.invite_code} fontSize={22} color="#fff" letterSpacing="0.14em" />
          </div>
          <ShareButton
            url={`/liga/${league.invite_code}`}
            title={`${league.name} – Dart-VM-spillet`}
            text={liga.shareLeague.inviteText(league.name, league.invite_code)}
            label={`${liga.shareLeague.label} →`}
            variant="pill"
          />
        </div>
      )}

      {hidden ? (
        <div style={{ ...CARD, padding: '32px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{liga.hidden.title}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>{liga.hidden.body}</div>
          <Countdown align="center" label={common.countdown.labelUntilStart} />
        </div>
      ) : rows.length === 0 ? (
        <div style={{ ...CARD, padding: '32px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{liga.empty.title}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{liga.empty.bodyBefore}<strong style={{ color: '#fff', letterSpacing: '0.1em' }}>{league.invite_code}</strong>{liga.empty.bodyAfter}</div>
        </div>
      ) : (
        <>
          {!vmStarted && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 10, lineHeight: 1.5 }}>
              {liga.pointsComingWhenStarts(formatKickoffDate(locale))}
            </div>
          )}
          <RankList
            rows={rows}
            vmStarted={vmStarted}
            kick={demo ? undefined : { leagueId: league.id, createdBy: league.created_by }}
            scrollToMe={false}
            backRef={`liga-${league.invite_code}`}
          />
        </>
      )}
    </div>
  )
}
