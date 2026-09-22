'use client'

import { useEffect, useState } from 'react'

const DEADLINE = new Date('2026-12-11T19:00:00Z')
const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

function getTimeLeft() {
  const diff = DEADLINE.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

const UNITS = ['Dager', 'Timer', 'Min', 'Sek'] as const

export default function DeadlineCountdown() {
  const [t, setT] = useState(getTimeLeft)
  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])
  if (!t) return null

  const values = [t.days, t.hours, t.minutes, t.seconds]

  return (
    <div style={{ display: 'inline-flex', alignItems: 'flex-start', flexShrink: 0 }}>
      {UNITS.map((l, i) => (
        <div key={l} style={{ display: 'flex', alignItems: 'flex-start' }}>
          {i > 0 && (
            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)', margin: '3px 4px 0', flexShrink: 0 }} />
          )}
          <div style={{ textAlign: 'center', minWidth: 28 }}>
            <div style={{ fontFamily: SPORT, fontSize: 20, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>
              {String(values[i]).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>{l}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
