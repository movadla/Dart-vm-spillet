'use client'

import { useEffect, useRef, useState } from 'react'
import { formatPoints } from '@/lib/format'
import { SPORT } from '@/config/theme'
import { useLocale } from '@/lib/i18n/useLocale'

/** Teller opp til `value` (900 ms, ease-out) — grønn gradient som resten av poengene. */
export default function CountUp({ value, size = 56 }: { value: number; size?: number }) {
  const { locale } = useLocale()
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (value === 0) return
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    // Redusert bevegelse: hopp rett til sluttverdien (bevisst synkron setState).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (reduce) { setDisplayed(value); return }
    const duration = 900
    const start = performance.now()

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * value))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value])

  return (
    <span style={{
      fontFamily: SPORT, fontSize: size, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em',
      fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
      background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)',
      WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
      textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)',
    }}>{formatPoints(displayed, locale)}</span>
  )
}
