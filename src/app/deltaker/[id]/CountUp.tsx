'use client'

import { useEffect, useRef, useState } from 'react'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

export default function CountUp({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (value === 0) return
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
      fontFamily: SPORT, fontSize: 56, fontWeight: 900, lineHeight: 1, letterSpacing: '-2px',
      background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)',
      WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
      textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)',
    }}>{displayed}</span>
  )
}
