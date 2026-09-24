'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePageVisible } from '@/lib/usePageVisible'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'
const KICKOFF = new Date('2026-12-11T19:00:00Z')

function getTimeUntil(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
  }
}

function pad(n: number) { return String(n).padStart(2, '0') }

/** Før VM: leaderboardet er tomt — vis nedtelling, antall påmeldte og påmeldingsknapp. */
export default function LeaderboardCountdown({ participants }: { participants: number }) {
  const [cd, setCd] = useState(getTimeUntil(KICKOFF))
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const visible = usePageVisible()

  useEffect(() => {
    if (!visible) return
    // Fanen ble synlig igjen — oppdater straks, ikke vent på neste tikk.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCd(getTimeUntil(KICKOFF))
    const t = setInterval(() => setCd(getTimeUntil(KICKOFF)), 30_000)
    return () => clearInterval(t)
  }, [visible])

  useEffect(() => {
    // localStorage finnes ikke under SSR — sjekkes med vilje etter mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { if (localStorage.getItem('vm_participant_id')) setIsLoggedIn(true) } catch {}
  }, [])

  return (
    <div style={{ background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)', borderRadius: 20, padding: '28px 20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.12)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)' }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
        Første poeng deles ut om
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
        {[
          { value: cd.days, label: 'dager' },
          { value: cd.hours, label: 'timer' },
          { value: cd.minutes, label: 'min' },
        ].map(({ value, label }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            {/* suppressHydrationWarning: minuttet kan ha tikket mellom SSR og hydrering */}
            <div suppressHydrationWarning style={{
              fontFamily: SPORT, fontSize: 40, fontWeight: 900, color: '#fff',
              lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
              background: 'rgba(255,255,255,0.06)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
              padding: '10px 14px', minWidth: 64, boxSizing: 'border-box',
            }}>
              {pad(value)}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: isLoggedIn ? 0 : 20, lineHeight: 1.5 }}>
        Dart-VM starter 11. desember. {participants > 0 ? `${participants} ${participants === 1 ? 'deltaker er' : 'deltakere er'} påmeldt så langt.` : 'Bli den første som melder seg på.'}
      </div>

      {!isLoggedIn && (
        <Link href="/tipp" className="cta-btn" style={{ display: 'inline-block', padding: '12px 26px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 999, textDecoration: 'none', fontFamily: SPORT, boxShadow: '0 4px 16px rgba(220,38,38,0.3)' }}>
          Meld deg på →
        </Link>
      )}
    </div>
  )
}
