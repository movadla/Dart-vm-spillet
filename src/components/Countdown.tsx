'use client'

import { useEffect, useState } from 'react'
import { KICKOFF } from '@/config/tournament'
import { usePageVisible } from '@/lib/usePageVisible'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

function getTimeLeft() {
  const diff = KICKOFF.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
  }
}

const UNITS = ['dager', 'timer', 'min'] as const

/**
 * Den ene nedtellingen til VM-start (dager/timer/min — sekunder er støy) som
 * brukes på forsiden, Min side, leaderboardet og skjulte ligaer. Oppdateres
 * hvert 30. sekund, og straks fanen blir synlig igjen. Returnerer null når VM
 * har startet.
 */
export default function Countdown({ size = 22, label, boxed = false, align = 'left' }: {
  /** Skriftstørrelse på tallene */
  size?: number
  /** Liten overskrift over tallene, f.eks. «VM starter om» */
  label?: string
  /** Tall i egne bokser (leaderboard-kortet) */
  boxed?: boolean
  align?: 'left' | 'center'
}) {
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
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start' }}>
      {label && (
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: boxed ? 14 : 6 }}>
          {label}
        </div>
      )}
      <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: boxed ? 8 : 10 }}>
        {UNITS.map((u, i) => (
          <div key={u} style={{ textAlign: 'center', minWidth: boxed ? 64 : Math.max(34, size * 1.5) }}>
            {/* suppressHydrationWarning: minuttet kan ha tikket mellom SSR og hydrering */}
            <div
              suppressHydrationWarning
              style={{
                fontFamily: SPORT, fontSize: size, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
                ...(boxed ? { background: 'rgba(255,255,255,0.06)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', boxSizing: 'border-box' as const } : {}),
              }}
            >
              {String(values[i]).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: boxed ? 6 : 3 }}>{u}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
