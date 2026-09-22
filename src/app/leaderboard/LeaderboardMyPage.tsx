'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

export default function LeaderboardMyPage() {
  const [id, setId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  // localStorage finnes ikke under SSR — sjekkes med vilje etter mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vm_participant_id')
      if (saved) setId(saved)
    } catch {}
    setReady(true)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!ready) return (
    <div className="skeleton" style={{ height: 46, borderRadius: 14, marginBottom: 16 }} />
  )

  if (!id) return null

  return (
    <Link href={`/deltaker/${id}`} className="lb-card" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', marginBottom: 16,
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 14, textDecoration: 'none',
    }}>
      <span style={{ fontFamily: SPORT, fontSize: 14, fontWeight: 900, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Din side
      </span>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>→</span>
    </Link>
  )
}
