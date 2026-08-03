'use client'

import { useEffect, useState } from 'react'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

interface DayRec { day: string; base: number; last: number }

export default function PointsDelta({ participantId, totalPoints }: { participantId: string; totalPoints: number }) {
  const [delta, setDelta] = useState<number | null>(null)

  useEffect(() => {
    // «Siden i går»: baseline = poengnivå ved forrige dags siste besøk.
    // Baseline holdes fast gjennom hele dagen, så gjentatte besøk samme dag
    // nullstiller IKKE deltaet — det viser akkumulert endring siden i går.
    const today = new Date().toISOString().slice(0, 10)
    const key = `vm_delta_${participantId}`
    try {
      const raw = localStorage.getItem(key)
      const rec: DayRec | null = raw ? JSON.parse(raw) : null

      if (!rec || typeof rec.day !== 'string') {
        // Første besøk noensinne — ingen baseline ennå.
        localStorage.setItem(key, JSON.stringify({ day: today, base: totalPoints, last: totalPoints }))
        setDelta(null)
      } else if (rec.day === today) {
        // Samme dag: baseline uendret, vis endring siden i går.
        setDelta(totalPoints - rec.base)
        localStorage.setItem(key, JSON.stringify({ ...rec, last: totalPoints }))
      } else {
        // Ny dag: gårsdagens siste verdi blir ny baseline.
        setDelta(totalPoints - rec.last)
        localStorage.setItem(key, JSON.stringify({ day: today, base: rec.last, last: totalPoints }))
      }
    } catch {}
  }, [participantId, totalPoints])

  if (delta === null || delta === 0) return null

  return (
    <span style={{
      fontFamily: SPORT,
      fontSize: 9,
      fontWeight: 700,
      color: delta > 0 ? '#f59e0b' : 'rgba(255,255,255,0.3)',
      background: delta > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${delta > 0 ? 'rgba(245,158,11,0.28)' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: 4,
      padding: '2px 6px',
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>
      {delta > 0 ? `+${delta}p` : `${delta}p`} siden i går
    </span>
  )
}
