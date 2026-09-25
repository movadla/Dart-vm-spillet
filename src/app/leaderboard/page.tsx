import Link from 'next/link'
import type { Metadata } from 'next'
import SmartBackButton from '@/components/SmartBackButton'
import BrandBanner from '@/components/BrandBanner'
import LocaleSwitch from '@/components/LocaleSwitch'
import { getLeaderboardData } from '@/lib/participantData'
import LeaderboardCountdown from './LeaderboardCountdown'
import LeaderboardMyPage from './LeaderboardMyPage'
import RankList from '@/components/RankList'
import LastUpdated from '@/components/LastUpdated'
import { SPORT, CARD_GRADIENT, CARD_SHADOW } from '@/config/theme'
import { getLocale } from '@/lib/i18n/getLocale'
import { getDictionary } from '@/i18n/dictionaries'

export const revalidate = 30
export const metadata: Metadata = { title: 'Leaderboard' }

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ fase?: string }> }) {
  const { fase } = await searchParams
  const { rows, vmStarted, demo } = await getLeaderboardData(fase)
  const dict = getDictionary(await getLocale())

  return (
    <div className="page-bg app-frame" style={{ minHeight: '100vh', color: '#fff', padding: '16px 20px 40px', position: 'relative' }}>
      <BrandBanner compact />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '6px 0 14px' }}>
        <SmartBackButton />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {demo && (
            <Link href="/deltaker/demo" style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 999, padding: '5px 10px', textDecoration: 'none' }}>
              {dict.leaderboard.demoBadge}
            </Link>
          )}
          <LocaleSwitch />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <h1 style={{ fontFamily: SPORT, fontSize: 36, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1, margin: 0, whiteSpace: 'nowrap' }}>
          <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Leader</span><span style={{ color: '#dc2626' }}>board</span>
        </h1>
        {vmStarted && (
          <div style={{ marginTop: 6 }}>
            <LastUpdated fetchedAt={new Date().toISOString()} />
          </div>
        )}
      </div>

      <LeaderboardMyPage />

      {!vmStarted ? (
        <LeaderboardCountdown participants={rows.length} />
      ) : rows.length === 0 ? (
        <div style={{ background: CARD_GRADIENT, borderRadius: 16, padding: '36px 20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.12)', boxShadow: CARD_SHADOW }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{dict.leaderboard.empty.title}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{dict.leaderboard.empty.body}</div>
        </div>
      ) : (
        <RankList rows={rows} vmStarted={vmStarted} backRef="leaderboard" />
      )}
    </div>
  )
}
