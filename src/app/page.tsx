'use client'

import React from 'react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import TeamBuildAnimation from '@/components/TeamBuildAnimation'
import Countdown from '@/components/Countdown'
import LocaleSwitch from '@/components/LocaleSwitch'
import { KICKOFF } from '@/config/tournament'
import { SPORT, CARD_GRADIENT } from '@/config/theme'
import { IconTarget, IconChart, IconTrophy } from '@/components/icons'
import { useLocale } from '@/lib/i18n/useLocale'
import { POINTS_SUFFIX, formatPoints } from '@/lib/format'
import { SCORING } from '@/config/scoring'

type MyStats = { name: string; points: number; rank: number; totalParticipants: number }
type PreviewRow = { id: string; name: string; points: number }

function MiniDashboard({ participantId }: { participantId: string }) {
  const { dict } = useLocale()
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
      background: CARD_GRADIENT,
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 16,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 20px rgba(0,0,0,0.25)',
      display: 'flex',
      overflow: 'hidden',
      marginBottom: 20,
    }}>
      <div style={{ flex: 1, padding: '14px 18px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 4 }}>{dict.home.miniDashboard.points}</div>
        <div style={{ fontFamily: SPORT, fontSize: 40, fontWeight: 900, color: '#f59e0b', lineHeight: 1, letterSpacing: '-1.5px' }}>{stats.points}</div>
      </div>
      <div style={{ width: 1, background: 'rgba(255,255,255,0.07)', alignSelf: 'stretch' }} />
      <div style={{ padding: '14px 18px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(251,191,36,0.5)', marginBottom: 2 }}>{dict.home.miniDashboard.rank}</div>
        <div style={{ fontFamily: SPORT, fontSize: 40, fontWeight: 900, color: '#fbbf24', lineHeight: 1, letterSpacing: '-1.5px' }}>#{stats.rank}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 2 }}>{dict.home.miniDashboard.ofTotal(stats.totalParticipants)}</div>
      </div>
    </div>
  )
}

function MiniLeaderboard() {
  const { dict, locale } = useLocale()
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
      background: CARD_GRADIENT,
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 20,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 20px rgba(0,0,0,0.25)',
    }}>
      <div style={{ padding: '10px 16px 9px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{dict.home.stickyHeader.leaderboard}</span>
        <Link href="/leaderboard" className="text-link" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontWeight: 600 }}>{dict.home.miniLeaderboard.seeAll(data.total)}</Link>
      </div>
      {data.rows.map((row, i) => (
        <Link key={row.id} href={`/deltaker/${row.id}?from=leaderboard`} className="lb-card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', textDecoration: 'none' }}>
          <span style={{ fontFamily: SPORT, fontSize: 14, fontWeight: 900, color: i === 0 ? '#fbbf24' : 'rgba(255,255,255,0.22)', width: 20, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#fff', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
          <span style={{ fontFamily: SPORT, fontSize: 18, fontWeight: 900, color: '#f59e0b', flexShrink: 0, lineHeight: 1 }}>{row.points}<span style={{ fontSize: 11, color: 'rgba(245,158,11,0.5)' }}>{POINTS_SUFFIX[locale]}</span></span>
        </Link>
      ))}
    </div>
  )
}

function StickyHeader({ visible, isLive }: { visible: boolean; isLive: boolean }) {
  const { dict } = useLocale()
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
        {dict.home.stickyHeader.brand} <span style={{ color: '#dc2626' }}>2026</span>
      </span>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', whiteSpace: 'nowrap' }}>
        <Link href="/vm-info" className="text-link" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', letterSpacing: '0.03em' }}>
          {dict.home.stickyHeader.info}
        </Link>
        <Link href="/leaderboard" className="text-link" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', letterSpacing: '0.03em' }}>
          {dict.home.stickyHeader.leaderboard}
        </Link>
        <Link href="/finn" className="text-link" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', letterSpacing: '0.03em' }}>
          {dict.home.stickyHeader.myPage}
        </Link>
        {!isLive && (
          <Link href="/tipp" className="btn-hover" style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', textDecoration: 'none', letterSpacing: '0.03em' }}>
            {dict.home.stickyHeader.join}
          </Link>
        )}
        <LocaleSwitch />
      </div>
    </div>
  )
}

function ClosedCTA({ ctaRef }: { ctaRef: React.RefObject<HTMLAnchorElement | null> }) {
  const { dict } = useLocale()
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
        {dict.home.closedCta.signupClosed}
      </div>
      <Link
        ref={ctaRef}
        href="/finn"
        className="cta-pulse cta-btn"
        style={{ display: 'block', padding: '20px', background: 'linear-gradient(180deg, #ff4444 0%, #c81e1e 100%)', color: '#fff', fontFamily: SPORT, fontWeight: 900, fontSize: 20, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 14, textDecoration: 'none', marginBottom: 20, boxShadow: '0 6px 36px rgba(220,38,38,0.75)' }}
      >
        {dict.home.closedCta.myPage}
      </Link>
      {sent ? (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>{dict.home.closedCta.thanks}</div>
      ) : (
        <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={dict.home.closedCta.emailPlaceholder}
            required
            style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none' }}
          />
          <button type="submit" className="btn-hover" disabled={sending} style={{ width: '100%', padding: '11px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: '0.04em' }}>
            {sending ? dict.home.closedCta.sending : dict.home.closedCta.notifyMe}
          </button>
        </form>
      )}
    </div>
  )
}

export default function HomePage() {
  const { dict, locale } = useLocale()
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [headerVisible, setHeaderVisible] = useState(false)
  const ctaRef = useRef<HTMLAnchorElement>(null)

  const isLive = KICKOFF <= new Date()

  // localStorage finnes ikke under SSR — sjekkes med vilje etter mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vm_participant_id')
      if (saved) setParticipantId(saved)
    } catch {}
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const onScroll = () => setHeaderVisible(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', backgroundImage: 'radial-gradient(ellipse 80% 40% at 50% 25%, rgba(255,255,255,0.025) 0%, transparent 70%)', color: '#fff' }}>
      <StickyHeader visible={headerVisible} isLive={isLive} />

      {/* ── FIRST SCREEN: countdown pill + hero fill 100svh ── */}
      <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {/* Bakgrunn dekker hele 100svh inkl. nedtelling. Foto: PDC World Darts
            Championship, semifinalescenen på Alexandra Palace 2016 —
            © dom fellowes, CC BY 2.0 (se PLAYER_PHOTO_DATABANK.md). Farge-
            laget over toner bildet (mixBlendMode: 'color') i stedet for å
            ligge som separate fargeklatter oppå.
            MIDLERTIDIG (2026-09-27): to blånyanser i stedet for blå/rød mens
            appen peker mot World Grand Prix (jf. BrandBanner.tsx/globals.css
            page-bg) — bytt tilbake til #c41230 på høyre side når det nærmer
            seg VM i desember. */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url(/hero/worldchamp-stage.webp)',
            backgroundSize: 'cover', backgroundPosition: 'center 38%',
            opacity: 0.5, filter: 'saturate(0.8) brightness(0.85)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 140% 90% at 10% 0%, #1d4ed8 0%, transparent 52%), radial-gradient(ellipse 140% 90% at 90% 0%, #0a1e4a 0%, transparent 52%)',
            mixBlendMode: 'color', opacity: 0.9,
          }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 220, background: 'linear-gradient(to bottom, transparent, #0a0a0a)' }} />
          {/* Litt mørkere og bredere enn før (0.55/65% → 0.68/75%) — teksten i
              midtsonen (tittel/nedtelling/CTA) hadde for lav kontrast mot
              scenebildet der det var lysest. */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0.68) 0%, transparent 75%)' }} />
        </div>

      {/* ── HERO ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', padding: '24px 20px 72px', textAlign: 'center' }}>

        <div style={{ position: 'relative' }}>
          {/* Tittel */}
          <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', marginBottom: 16, lineHeight: 1 }}>
            {/* Grønn var et tredje signalfarge ved siden av rødt/blått — leste
                underbevisst som et resultat/suksess-signal (samme grønt som
                poeng og seiere ellers i appen) i stedet for en nøytral
                overskrift. Nøytral hvit/dempet holder oppmerksomheten på
                selve tittelen og CTA-en. */}
            <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.3, paddingTop: 4, marginBottom: 6, whiteSpace: 'nowrap', color: 'rgba(191,219,254,0.55)' }}>
              — PDC World Grand Prix —
            </div>
            <div style={{ fontSize: 'clamp(34px, 9.5vw, 64px)', letterSpacing: '-2px', lineHeight: 1.05, whiteSpace: 'nowrap' }}>
              <span style={{ color: 'rgba(147,197,253,0.4)' }}>WORLD GRAND PRIX-</span>
              <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, #bfdbfe 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
            </div>
          </div>

          {/* Konsept-setning — uten denne var «hva er dette» ikke lesbart før
              man hadde scrollet forbi hele første skjermbilde. */}
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 20, letterSpacing: '0.01em' }}>
            {dict.home.hero.tagline}
          </div>

          {/* Nedtelling — mindre enn før (var 38) så den ikke konkurrerer
              visuelt med CTA-knappen om førsteblikket. */}
          <div style={{ marginTop: 16 }} />
          {!isLive && <div style={{ marginBottom: 24, textAlign: 'center' }}><Countdown size={26} label={dict.common.countdown.labelUntilStart} align="center" /></div>}

          {/* CTA */}
          <div style={{ marginTop: 40 }} />
          {participantId ? (
            <>
              <Link
                ref={ctaRef}
                href={`/deltaker/${participantId}`}
                className="cta-pulse cta-btn"
                style={{ display: 'block', padding: '18px', background: 'linear-gradient(180deg, #ff1a1a 0%, #cc0000 100%)', color: '#fff', fontFamily: SPORT, fontWeight: 900, fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 14, textDecoration: 'none', marginBottom: 10, boxShadow: '0 6px 40px rgba(220,38,38,0.8), 0 2px 0 rgba(255,100,100,0.3) inset' }}
              >
                {dict.home.hero.myPage}
              </Link>
              <button
                className="text-link"
                onClick={() => { try { localStorage.removeItem('vm_participant_id') } catch {} setParticipantId(null) }}
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 20, letterSpacing: '0.04em' }}
              >
                {dict.home.hero.switchUser}
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
                {dict.home.hero.getStarted}
              </Link>
              <Link href="/finn" className="btn-hover" style={{ display: 'inline-block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', marginBottom: 20, padding: '9px 16px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', letterSpacing: '0.01em' }}>
                {dict.home.hero.alreadySignedUp}
              </Link>
            </>
          )}

        </div>

        {/* Scroll-indikator — hevet fra 0.65 opasitet siden seksjonen under
            («Slik fungerer det») er usynlig helt til man scroller, og dette
            er det eneste signalet om at det finnes mer innhold. */}
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '10px 16px', opacity: 0.85, pointerEvents: 'none', userSelect: 'none' }}>
          <svg className="bounce-arrow" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 8l6 6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff' }}>{dict.home.hero.scrollHint}</span>
        </div>
      </div>
      </div>{/* end first-screen wrapper */}

      {/* ── SLIK FUNGERER DET ── */}
      <div className="gradient-divider" />
      <div style={{ padding: '48px 20px 40px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 8, textAlign: 'center' }}>
          {dict.home.howItWorks.eyebrow}
        </div>
        <div style={{ fontFamily: SPORT, fontSize: 22, fontWeight: 900, textTransform: 'uppercase', color: '#fff', textAlign: 'center', lineHeight: 1 }}>
          {dict.home.howItWorks.title}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textAlign: 'center', margin: '8px 0 24px', lineHeight: 1.5 }}>
          {dict.home.howItWorks.subtitle}
        </div>
        {/* Selvspillende demo av valget (samme som intro-sliden i /tipp) —
            starter først når den er skrollet inn i bildet, siden den ligger
            under 100svh-heroen. */}
        <div style={{ maxWidth: 420, margin: '0 auto 40px' }}>
          <TeamBuildAnimation startOnView />
        </div>
        <div className="how-it-works-grid">
        {[
          { icon: <IconTarget />, glow: 'rgba(34,197,94,0.22)' },
          { icon: <IconChart />,  glow: 'rgba(245,158,11,0.22)' },
          { icon: <IconTrophy />, glow: 'rgba(251,191,36,0.22)' },
        ].map(({ icon, glow }, i) => {
          const { title, desc } = dict.home.howItWorks.cards[i]
          // Kort 2 («Poeng underveis») bytter den abstrakte teksten ut med
          // konkrete tall fra selve poengsystemet — konkrete tall overbeviser
          // raskere enn en generell påstand.
          const body = i === 1
            ? dict.home.howItWorks.pointsDesc(formatPoints(SCORING.perSetWon, locale), formatPoints(SCORING.perAdvancement, locale))
            : desc
          return (
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
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)', lineHeight: 1.55 }}>{body}</div>
            </div>
          </div>
          )
        })}
        </div>
      </div>

      {/* ── FOOTER-LENKER ── */}
      <div style={{ padding: '32px 20px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
        <Link href={participantId ? `/deltaker/${participantId}` : '/finn'} className="cta-btn" style={{ fontSize: 15, fontWeight: 700, color: '#fff', textDecoration: 'none', letterSpacing: '0.04em', padding: '12px 28px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', borderRadius: 24, fontFamily: SPORT, textTransform: 'uppercase' }}>
          {participantId ? dict.home.footer.myPage : dict.home.footer.join}
        </Link>
        <Link href="/vm-info" className="guide-btn" style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', letterSpacing: '0.02em', padding: '12px 24px', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 24 }}>
          {dict.home.footer.infoAndRules}
        </Link>
      </div>

      {/* ── KONTAKT ── */}
      <div style={{ padding: '0 20px 48px', textAlign: 'center' }}>
        <a href="mailto:kontakt@dart-vm-spillet.no" className="text-link" style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', textDecoration: 'none', letterSpacing: '0.02em' }}>
          kontakt@dart-vm-spillet.no
        </a>
        <span style={{ color: 'rgba(255,255,255,0.12)', margin: '0 8px' }}>·</span>
        <Link href="/personvern" className="text-link" style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', textDecoration: 'none', letterSpacing: '0.02em' }}>
          {dict.home.footer.privacy}
        </Link>
      </div>
    </div>
  )
}
