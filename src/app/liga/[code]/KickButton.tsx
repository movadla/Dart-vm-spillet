'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  leagueId: string
  memberId: string
  memberName: string
  createdBy: string
}

export default function KickButton({ leagueId, memberId, memberName, createdBy }: Props) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [kicking, setKicking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // localStorage finnes ikke under SSR — sjekkes med vilje etter mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const myId = localStorage.getItem('vm_participant_id')
      setIsAdmin(myId === createdBy && myId !== memberId)
    } catch {}
  }, [createdBy, memberId])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isAdmin) return null

  async function handleKick(e: React.MouseEvent) {
    e.stopPropagation()
    if (!window.confirm(`Fjerne ${memberName} fra ligaen?`)) return
    setKicking(true)
    setError(null)
    try {
      // adminId sendes ikke lenger her — /api/league/kick henter identitet fra
      // den verifiserte vm_auth-cookien (se route.ts). localStorage-verdien
      // over er kun en UX-hint for om knappen skal vises, ikke reell auth.
      const res = await fetch('/api/league/kick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId, kickId: memberId }),
      })
      if (res.ok) { router.refresh(); return }
      const data = await res.json().catch(() => null)
      setError(res.status === 401 ? 'Økten din er utløpt — gå til «Min side» og be om en ny innloggingslenke.' : (data?.error ?? 'Kunne ikke fjerne medlemmet'))
    } catch {
      setError('Noe gikk galt')
    }
    setKicking(false)
  }

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={handleKick}
        disabled={kicking}
        style={{
          padding: '3px 8px',
          background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.2)',
          borderRadius: 6,
          color: '#f87171',
          fontSize: 11,
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          flexShrink: 0,
        }}
      >
        {kicking ? '…' : 'Kick'}
      </button>
      {error && (
        <div role="alert" style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 5,
          width: 160, padding: '6px 9px', borderRadius: 6, textAlign: 'left',
          background: '#1a1015', border: '1px solid rgba(239,68,68,0.3)',
          color: '#fca5a5', fontSize: 11, fontWeight: 600, lineHeight: 1.4,
          textTransform: 'none', letterSpacing: 'normal',
        }}>
          {error}
        </div>
      )}
    </div>
  )
}
