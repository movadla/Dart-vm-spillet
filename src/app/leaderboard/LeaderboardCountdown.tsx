'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'
const KICKOFF = new Date('2026-12-11T19:00:00Z')

function getTimeUntil(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function pad(n: number) { return String(n).padStart(2, '0') }

export default function LeaderboardCountdown() {
  const [cd, setCd] = useState(getTimeUntil(KICKOFF))
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setCd(getTimeUntil(KICKOFF)), 1000)
    // localStorage finnes ikke under SSR — sjekkes med vilje etter mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { if (localStorage.getItem('vm_participant_id')) setIsLoggedIn(true) } catch {}
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)', borderRadius: 20, padding: '36px 20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.12)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>
        Oppdateres om
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        {[
          { value: cd.days, label: 'dager' },
          { value: cd.hours, label: 'timer' },
          { value: cd.minutes, label: 'min' },
          { value: cd.seconds, label: 'sek' },
        ].map(({ value, label }, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            {/* suppressHydrationWarning: verdien kan ha tikket ett sekund mellom SSR og
                hydrering — begge render-verdiene er korrekte, korrigeres straks av intervallet over */}
            <div key={value} suppressHydrationWarning className="digit-tick" style={{
              fontFamily: SPORT, fontSize: 44, fontWeight: 900, color: '#fff',
              lineHeight: 1, letterSpacing: '-1px',
              background: 'rgba(255,255,255,0.06)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
              padding: '10px 14px', minWidth: 58,
            }}>
              {pad(value)}
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>
        Dart-VM starter 11. desember 2026
      </div>

      {!isLoggedIn && (
        <Link href="/tipp" style={{ display: 'inline-block', padding: '13px 28px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 10, textDecoration: 'none', fontFamily: SPORT, boxShadow: '0 4px 16px rgba(220,38,38,0.3)' }}>
          Meld deg på →
        </Link>
      )}
    </div>
  )
}
