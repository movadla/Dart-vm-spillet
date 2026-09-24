'use client'

import { useRouter } from 'next/navigation'
import { DEMO_COOKIE } from '@/lib/demo'

export default function LogoutButton() {
  const router = useRouter()

  function handleLogout() {
    try {
      localStorage.removeItem('vm_participant_id')
      // Demo-verdenen (leaderboard/liga) skal ikke henge igjen etter utlogging.
      document.cookie = `${DEMO_COOKIE}=; path=/; max-age=0`
    } catch {}
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-link"
      style={{
        display: 'block',
        margin: '28px auto 0',
        fontSize: 12,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.55)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px 12px',
        letterSpacing: '0.04em',
      }}
    >
      Bytt bruker
    </button>
  )
}
