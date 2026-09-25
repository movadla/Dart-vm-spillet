'use client'

import { useEffect, useState } from 'react'
import { formatPoints } from '@/lib/format'
import { useLocale } from '@/lib/i18n/useLocale'

interface DayRec { day: string; base: number; last: number }

/** «+5 p siden i går»-chip. Baseline lagres lokalt per deltaker (se kommentar under). */
export default function PointsDelta({ participantId, totalPoints }: { participantId: string; totalPoints: number }) {
  const { locale, dict } = useLocale()
  const [delta, setDelta] = useState<number | null>(null)

  // localStorage finnes ikke under SSR — leses/skrives med vilje etter mount for å unngå
  // hydration-mismatch mellom server og klient.
  /* eslint-disable react-hooks/set-state-in-effect */
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
  /* eslint-enable react-hooks/set-state-in-effect */

  if (delta === null || delta === 0) return null

  return (
    <span style={{
      fontSize: 11,
      fontWeight: 700,
      color: delta > 0 ? '#f59e0b' : 'rgba(255,255,255,0.6)',
      background: delta > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${delta > 0 ? 'rgba(245,158,11,0.28)' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: 6,
      padding: '3px 7px',
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      fontVariantNumeric: 'tabular-nums',
    }}>
      {delta > 0 ? `+${formatPoints(delta, locale)}` : formatPoints(delta, locale)} {dict.deltaker.pointsDelta.sinceYesterday}
    </span>
  )
}
