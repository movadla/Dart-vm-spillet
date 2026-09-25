'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { SPORT } from '@/config/theme'
import { useLocale } from '@/lib/i18n/useLocale'

/** Snarvei til egen side for innloggede — plassen holdes av under SSR så listen ikke hopper. */
export default function LeaderboardMyPage() {
  const { dict } = useLocale()
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

  if (!ready) return <div className="skeleton" style={{ height: 44, borderRadius: 14, marginBottom: 12 }} />
  if (!id) return null

  return (
    <Link href={`/deltaker/${id}`} className="lb-card" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '11px 16px', marginBottom: 12,
      background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(96,165,250,0.3)',
      borderRadius: 14, textDecoration: 'none',
    }}>
      <span style={{ fontFamily: SPORT, fontSize: 14, fontWeight: 900, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {dict.common.nav.myPageShort}
      </span>
      <span aria-hidden style={{ fontSize: 14, color: 'rgba(147,197,253,0.7)' }}>→</span>
    </Link>
  )
}
