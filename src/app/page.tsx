'use client'

import React from 'react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import LiveMatchesBar from '@/components/LiveMatchesBar'

function getTimeUntil(target: Date) {
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

const KICKOFF = new Date('2026-06-11T19:00:00Z')

function IconBall() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="9" stroke="white" strokeWidth="1.5" strokeOpacity="0.85"/>
      <path d="M11 2 L13.2 6.8 L11 10 L8.8 6.8 Z" fill="white" fillOpacity="0.7"/>
      <path d="M19.8 9.5 L16.2 9 L13.8 11.8 L15.5 15.8 L19.2 13.5 Z" fill="white" fillOpacity="0.7"/>
      <path d="M2.2 9.5 L5.8 13.5 L7.5 11.8 L5.2 9 L2.2 9.5 Z" fill="white" fillOpacity="0.7"/>
      <path d="M6.8 16.5 L8.5 12 L11 10.5 L13.5 12 L15.2 16.5 L11 18.5 Z" fill="white" fillOpacity="0.35"/>
    </svg>
  )
}

function IconChart() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <polyline points="2,17 7,11 12,13.5 20,4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9"/>
      <polyline points="16,4 20,4 20,8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9"/>
      <line x1="2" y1="20" x2="20" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.3"/>
    </svg>
  )
}

function IconTrophy() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M7 2 H15 V12 C15 14.2 13.2 16 11 16 C8.8 16 7 14.2 7 12 Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" strokeOpacity="0.9"/>
      <path d="M7 5 H3.5 C3.5 5 3.5 10.5 7 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9"/>
      <path d="M15 5 H18.5 C18.5 5 18.5 10.5 15 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9"/>
      <line x1="11" y1="16" x2="11" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.9"/>
      <line x1="7" y1="20" x2="15" y2="20" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.9"/>
    </svg>
  )
}

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number }
type MyStats = { name: string; points: number; rank: number; totalParticipants: number }
type PreviewRow = { id: string; name: string; points: number }
type UpcomingMatch = { id: number; date: string; time: string; home: string; away: string; stage: string }

function MiniDashboard({ participantId }: { participantId: string }) {
  const [stats, setStats] = React.useState<MyStats | null>(null)

  React.useEffect(() => {
    fetch(`/api/my-stats?id=${participantId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d) })
      .catch(() => {})
  }, [participantId])

  if (!stats) return (
    <div className="skeleton" style={{ height: 76, borderRadius: 16, marginBottom: 20 }} />
  )

  return (
    <div style={{
      background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 16,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 20px rgba(0,0,0,0.25)',
      display: 'flex',
      overflow: 'hidden',
      marginBottom: 20,
    }}>
      <div style={{ flex: 1, padding: '14px 18px 12px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 4 }}>Poeng</div>
        <div style={{ fontFamily: SPORT, fontSize: 40, fontWeight: 900, color: '#f59e0b', lineHeight: 1, letterSpacing: '-1.5px' }}>{stats.points}</div>
      </div>
      <div style={{ width: 1, background: 'rgba(255,255,255,0.07)', alignSelf: 'stretch' }} />
      <div style={{ padding: '14px 18px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(251,191,36,0.5)', marginBottom: 2 }}>Plassering</div>
        <div style={{ fontFamily: SPORT, fontSize: 40, fontWeight: 900, color: '#fbbf24', lineHeight: 1, letterSpacing: '-1.5px' }}>#{stats.rank}</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', marginTop: 2 }}>av {stats.totalParticipants}</div>
      </div>
    </div>
  )
}

function MiniLeaderboard() {
  const [data, setData] = React.useState<{ rows: PreviewRow[]; total: number } | null>(null)

  React.useEffect(() => {
    fetch('/api/leaderboard-preview')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d) })
      .catch(() => {})
  }, [])

  if (!data) return <div className="skeleton" style={{ height: 120, borderRadius: 16, marginBottom: 20 }} />

  return (
    <div style={{
      background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 20,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 20px rgba(0,0,0,0.25)',
    }}>
      <div style={{ padding: '10px 16px 9px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Leaderboard</span>
        <Link href="/leaderboard" className="text-link" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontWeight: 600 }}>Se alle {data.total} →</Link>
      </div>
      {data.rows.map((row, i) => (
        <Link key={row.id} href={`/deltaker/${row.id}?from=leaderboard`} className="lb-card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', textDecoration: 'none' }}>
          <span style={{ fontFamily: SPORT, fontSize: 14, fontWeight: 900, color: i === 0 ? '#fbbf24' : 'rgba(255,255,255,0.22)', width: 20, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#fff', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
          <span style={{ fontFamily: SPORT, fontSize: 18, fontWeight: 900, color: '#f59e0b', flexShrink: 0, lineHeight: 1 }}>{row.points}<span style={{ fontSize: 11, color: 'rgba(245,158,11,0.5)' }}>p</span></span>
        </Link>
      ))}
    </div>
  )
}

function CountdownBar({ cd }: { cd: TimeLeft }) {
  return (
    <div style={{ marginBottom: 28, textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 0 }}>
        {([{ v: cd.days, l: 'Dager' }, { v: cd.hours, l: 'Timer' }, { v: cd.minutes, l: 'Min' }, { v: cd.seconds, l: 'Sek' }] as const).map(({ v, l }, i) => (
          <div key={l} style={{ display: 'flex', alignItems: 'flex-start' }}>
            {i > 0 && <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.12)', margin: '5px 8px 0', flexShrink: 0 }} />}
            <div style={{ textAlign: 'center', minWidth: 56 }}>
              <div key={v} className="digit-tick" style={{ fontFamily: SPORT, fontSize: 38, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>{String(v).padStart(2, '0')}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>{l}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StickyHeader({ visible, isLive }: { visible: boolean; isLive: boolean }) {
  if (!visible) return null
  return (
    <div style={{
      position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 'var(--app-width)', zIndex: 100,
      background: 'rgba(13,17,23,0.9)', backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 20px 12px',
    }}>
      <span style={{ fontFamily: SPORT, fontSize: 19, fontWeight: 900, letterSpacing: '-0.5px', textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>
        VM <span style={{ color: '#dc2626' }}>2026</span>
      </span>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <Link href="/vm-info" className="text-link" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', letterSpacing: '0.03em' }}>
          Info
        </Link>
        <Link href="/leaderboard" className="text-link" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', letterSpacing: '0.03em' }}>
          Leaderboard
        </Link>
        <Link href="/finn" className="text-link" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', letterSpacing: '0.03em' }}>
          Min side
        </Link>
        {!isLive && (
          <Link href="/tipp" className="btn-hover" style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', textDecoration: 'none', letterSpacing: '0.03em' }}>
            Kom i gang →
          </Link>
        )}
      </div>
    </div>
  )
}

function ClosedCTA({ ctaRef }: { ctaRef: React.RefObject<HTMLAnchorElement | null> }) {
  const [email, setEmail] = React.useState('')
  const [sent, setSent] = React.useState(false)
  const [sending, setSending] = React.useState(false)

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSending(true)
    await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    setSent(true)
    setSending(false)
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
        Påmelding er stengt
      </div>
      <Link
        ref={ctaRef}
        href="/finn"
        className="cta-pulse cta-btn"
        style={{ display: 'block', padding: '20px', background: 'linear-gradient(180deg, #ff4444 0%, #c81e1e 100%)', color: '#fff', fontFamily: SPORT, fontWeight: 900, fontSize: 20, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 14, textDecoration: 'none', marginBottom: 20, boxShadow: '0 6px 36px rgba(220,38,38,0.75)' }}
      >
        Min side →
      </Link>
      {sent ? (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>Takk! Vi varsler deg til neste spill.</div>
      ) : (
        <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="din@epost.no"
            required
            style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none' }}
          />
          <button type="submit" className="btn-hover" disabled={sending} style={{ width: '100%', padding: '11px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: '0.04em' }}>
            {sending ? '…' : 'Varsle meg om neste spill'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function HomePage() {
  const [cd, setCd] = useState(getTimeUntil(KICKOFF))
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [headerVisible, setHeaderVisible] = useState(false)
  const [nextMatches, setNextMatches] = useState<UpcomingMatch[]>([])
  const ctaRef = useRef<HTMLAnchorElement>(null)

  const isLive = KICKOFF <= new Date()

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vm_participant_id')
      if (saved) setParticipantId(saved)
    } catch {}
  }, [])

  useEffect(() => {
    const t = setInterval(() => setCd(getTimeUntil(KICKOFF)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const onScroll = () => setHeaderVisible(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!isLive) return
    fetch('/api/upcoming-matches?limit=5')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.matches) setNextMatches(d.matches) })
      .catch(() => {})
  }, [isLive])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', backgroundImage: 'radial-gradient(ellipse 80% 40% at 50% 25%, rgba(255,255,255,0.025) 0%, transparent 70%)', color: '#fff' }}>
      <StickyHeader visible={headerVisible} isLive={isLive} />

      {/* ── FIRST SCREEN: countdown pill + hero fill 100svh ── */}
      <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {/* Bakgrunn dekker hele 100svh inkl. nedtelling */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 140% 90% at 10% 0%, #0a3fa8 0%, transparent 52%), radial-gradient(ellipse 140% 90% at 90% 0%, #c41230 0%, transparent 52%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to bottom, transparent, #0a0a0a)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0.45) 0%, transparent 65%)' }} />
        </div>

      {/* ── HERO ── */}
      <div style={{ flex: 1, position: 'relative', padding: '24px 20px 72px', textAlign: 'center' }}>

        <div style={{ position: 'relative' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/snåsamannen.png" alt="" aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '55%', transform: 'translateX(-50%) translateY(-50%)', width: 380, height: 'auto', opacity: 0.24, pointerEvents: 'none', userSelect: 'none', zIndex: 0, filter: 'brightness(1.0) saturate(0.7) contrast(1.05)', maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 0%, black 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 0%, black 30%, transparent 75%)' }} />
          {/* FIFA-label + flagg */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>FIFA World Cup 2026</span>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8, opacity: 0.75 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://flagcdn.com/28x21/us.png" width="28" height="21" alt="" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://flagcdn.com/28x21/ca.png" width="28" height="21" alt="" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://flagcdn.com/28x21/mx.png" width="28" height="21" alt="" />
            </div>
          </div>

          {/* Tittel */}
          <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', marginBottom: 24, lineHeight: 1 }}>
            <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.3, paddingTop: 4, marginBottom: 6, whiteSpace: 'nowrap', background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)' }}>
              — Snåsamannen 2026 —
            </div>
            <div style={{ fontSize: 76, letterSpacing: '-2px', lineHeight: 1 }}>
              <span style={{ color: 'rgba(255,255,255,0.38)' }}>VM-</span>
              <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
            </div>
          </div>

          {/* Nedtelling */}
          <div style={{ marginTop: 24 }} />
          {!isLive && <CountdownBar cd={cd} />}

          {/* CTA */}
          <div style={{ marginTop: 100 }} />
          {participantId ? (
            <>
              <Link
                ref={ctaRef}
                href={`/deltaker/${participantId}`}
                className="cta-pulse cta-btn"
                style={{ display: 'block', padding: '18px', background: 'linear-gradient(180deg, #ff1a1a 0%, #cc0000 100%)', color: '#fff', fontFamily: SPORT, fontWeight: 900, fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 14, textDecoration: 'none', marginBottom: 10, boxShadow: '0 6px 40px rgba(220,38,38,0.8), 0 2px 0 rgba(255,100,100,0.3) inset' }}
              >
                Min side →
              </Link>
              <button
                className="text-link"
                onClick={() => { try { localStorage.removeItem('vm_participant_id') } catch {} setParticipantId(null) }}
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 20, letterSpacing: '0.04em' }}
              >
                Bytt bruker
              </button>
            </>
          ) : isLive ? (
            <>
              <MiniLeaderboard />
              <ClosedCTA ctaRef={ctaRef} />
            </>
          ) : (
            <>
              <Link
                ref={ctaRef}
                href="/tipp"
                className="cta-pulse cta-btn"
                style={{ display: 'block', padding: '18px', background: 'linear-gradient(180deg, #ff4444 0%, #dc2626 100%)', color: '#fff', fontFamily: SPORT, fontWeight: 900, fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 14, textDecoration: 'none', marginBottom: 10, boxShadow: '0 4px 28px rgba(220,38,38,0.55)' }}
              >
                Kom i gang →
              </Link>
              <Link href="/finn" className="text-link" style={{ display: 'inline-block', fontSize: 13, color: 'rgba(255,255,255,0.38)', textDecoration: 'none', marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 1, letterSpacing: '0.01em' }}>
                Allerede påmeldt? Trykk her
              </Link>
            </>
          )}


          {/* Neste kamper (etter kampstart) */}
          {isLive && <LiveMatchesBar />}
          {isLive && nextMatches.length > 0 && (
            <div style={{ marginTop: 12, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 8 }}>Neste kamper</div>
              {nextMatches.map((m, i) => (
                <div key={m.id} style={{ marginTop: i > 0 ? 8 : 0 }}>
                  {(i === 0 || nextMatches[i - 1].stage !== m.stage) && (
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 4, marginTop: i > 0 ? 6 : 0 }}>{m.stage}</div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, width: 32, flexShrink: 0 }}>{m.date.slice(8,10)}.{m.date.slice(5,7)}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#fff', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>–</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.away}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, width: 36, textAlign: 'right', flexShrink: 0 }}>{m.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scroll-indikator */}
        <div style={{ position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, opacity: 0.35, pointerEvents: 'none', userSelect: 'none' }}>
          <svg className="bounce-arrow" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 8l6 6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff' }}>Mer info</span>
        </div>
      </div>
      </div>{/* end first-screen wrapper */}

      {/* ── SLIK FUNGERER DET ── */}
      <div className="gradient-divider" />
      <div style={{ padding: '48px 20px 40px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 32, textAlign: 'center' }}>
          Slik fungerer det
        </div>
        <div className="how-it-works-grid">
        {[
          { icon: <IconBall />,   glow: 'rgba(34,197,94,0.22)',   title: 'Velg 8 lag',        desc: 'Velg ett lag fra hvert av de 8 nivåene' },
          { icon: <IconChart />,  glow: 'rgba(245,158,11,0.22)',  title: 'Poeng underveis',   desc: 'Mål, seiere og avansement gir poeng for hvert av lagene dine' },
          { icon: <IconTrophy />, glow: 'rgba(251,191,36,0.22)',  title: 'Spill mot venner',  desc: 'Opprett private ligaer og sammenlign deg med andre på leaderboardet' },
        ].map(({ icon, glow, title, desc }) => (
          <div key={title} className="how-it-works-card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 18px ${glow}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{icon}</div>
            <div style={{ paddingTop: 2 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{title}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)', lineHeight: 1.55 }}>{desc}</div>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* ── FOOTER-LENKER ── */}
      <div style={{ padding: '32px 20px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
        <Link href={participantId ? `/deltaker/${participantId}` : '/finn'} className="cta-btn" style={{ fontSize: 15, fontWeight: 700, color: '#fff', textDecoration: 'none', letterSpacing: '0.04em', padding: '12px 28px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', borderRadius: 24, fontFamily: SPORT, textTransform: 'uppercase' }}>
          {participantId ? 'Min side' : 'Meld deg på'}
        </Link>
        <Link href="/vm-info" className="guide-btn" style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', letterSpacing: '0.02em', padding: '12px 24px', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 24 }}>
          Info og regler
        </Link>
      </div>

      {/* ── KONTAKT ── */}
      <div style={{ padding: '0 20px 48px', textAlign: 'center' }}>
        <a href="mailto:vmspillet2026@gmail.com" className="text-link" style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', textDecoration: 'none', letterSpacing: '0.02em' }}>
          vmspillet2026@gmail.com
        </a>
      </div>
    </div>
  )
}
