'use client'

import { useEffect, useState } from 'react'
import { usePageVisible } from '@/lib/usePageVisible'

const DEADLINE = new Date('2026-12-11T19:00:00Z')
const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

function getTimeLeft() {
  const diff = DEADLINE.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
  }
}

const UNITS = ['dager', 'timer', 'min'] as const

/** Nedtelling til VM-start (dager/timer/min — sekunder er støy her). */
export default function DeadlineCountdown({ size = 22 }: { size?: number }) {
  const [t, setT] = useState(getTimeLeft)
  const visible = usePageVisible()
  useEffect(() => {
    if (!visible) return
    // Fanen ble synlig igjen — oppdater straks, ikke vent på neste tikk.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setT(getTimeLeft())
    const id = setInterval(() => setT(getTimeLeft()), 30_000)
    return () => clearInterval(id)
  }, [visible])
  if (!t) return null

  const values = [t.days, t.hours, t.minutes]

  return (
    <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 10, flexShrink: 0 }}>
      {UNITS.map((l, i) => (
        <div key={l} style={{ textAlign: 'center', minWidth: 34 }}>
          {/* suppressHydrationWarning: minuttet kan ha tikket mellom SSR og hydrering */}
          <div suppressHydrationWarning style={{ fontFamily: SPORT, fontSize: size, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
            {String(values[i]).padStart(2, '0')}
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>{l}</div>
        </div>
      ))}
    </div>
  )
}
