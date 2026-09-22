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
    try {
      const adminId = localStorage.getItem('vm_participant_id')
      const res = await fetch('/api/league/kick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId, kickId: memberId, adminId }),
      })
      if (res.ok) router.refresh()
    } catch {}
    setKicking(false)
  }

  return (
    <button
      onClick={handleKick}
      disabled={kicking}
      style={{
        padding: '3px 8px',
        background: 'rgba(220,38,38,0.08)',
        border: '1px solid rgba(220,38,38,0.2)',
        borderRadius: 6,
        color: 'rgba(239,68,68,0.6)',
        fontSize: 10,
        fontWeight: 700,
        cursor: 'pointer',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        flexShrink: 0,
      }}
    >
      {kicking ? '…' : 'Kick'}
    </button>
  )
}
