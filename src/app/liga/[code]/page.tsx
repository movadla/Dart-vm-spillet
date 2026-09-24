import Link from 'next/link'
import { notFound } from 'next/navigation'
import SmartBackButton from '@/components/SmartBackButton'
import BrandBanner from '@/components/BrandBanner'
import CopyCode from '@/components/CopyCode'
import RankList from '@/components/RankList'
import DeadlineCountdown from '@/app/deltaker/[id]/DeadlineCountdown'
import LastUpdated from '@/app/deltaker/[id]/LastUpdated'
import ShareButton from '@/app/ShareButton'
import { getLeagueData } from '@/lib/participantData'

export const revalidate = 30

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

const CARD: React.CSSProperties = {
  background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)',
}

export default async function LigaPage({ params, searchParams }: {
  params: Promise<{ code: string }>
  searchParams: Promise<{ fase?: string }>
}) {
  const { code } = await params
  const { fase } = await searchParams
  const data = await getLeagueData(code, fase)
  if (!data) notFound()

  const { league, rows, vmStarted, demo } = data
  const hidden = !vmStarted && !!league.hidden_until_kickoff

  return (
    <div className="page-bg app-frame" style={{ minHeight: '100vh', color: '#fff', padding: '16px 20px 40px', position: 'relative' }}>
      <BrandBanner compact />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '6px 0 14px' }}>
        <SmartBackButton />
        {demo && (
          <Link href="/deltaker/demo" style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 999, padding: '5px 10px', textDecoration: 'none' }}>
            Demo
          </Link>
        )}
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>Liga</div>
        <h1 style={{ fontFamily: SPORT, fontSize: 28, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1, margin: 0, letterSpacing: '-0.01em', overflowWrap: 'anywhere' }}>{league.name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap' }}>
          <span>{rows.length} {rows.length === 1 ? 'deltaker' : 'deltakere'}</span>
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
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 3 }}>Ligakode</div>
            <CopyCode code={league.invite_code} fontSize={22} color="#fff" letterSpacing="0.14em" />
          </div>
          <ShareButton
            url={`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3001'}/liga/${league.invite_code}`}
            title={`${league.name} – Dart-VM-spillet`}
            text={`Bli med i ${league.name} i Dart-VM-spillet! Kode: ${league.invite_code}`}
            label="Inviter →"
            variant="pill"
          />
        </div>
      )}

      {hidden ? (
        <div style={{ ...CARD, padding: '32px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Deltakerlisten er skjult til VM starter</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>Ligaeieren har valgt å holde lagene hemmelige frem til første kamp.</div>
          <DeadlineCountdown />
        </div>
      ) : rows.length === 0 ? (
        <div style={{ ...CARD, padding: '32px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Ingen deltakere ennå</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Del ligakoden <strong style={{ color: '#fff', letterSpacing: '0.1em' }}>{league.invite_code}</strong> med venner så de kan bli med.</div>
        </div>
      ) : (
        <>
          {!vmStarted && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 10, lineHeight: 1.5 }}>
              Poeng og plassering kommer når VM starter 11. desember.
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
