'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  function handleLogout() {
    try { localStorage.removeItem('vm_participant_id') } catch {}
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-link"
      style={{
        display: 'block',
        margin: '32px auto 0',
        fontSize: 11,
        color: 'rgba(255,255,255,0.2)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px 0',
        letterSpacing: '0.06em',
      }}
    >
      Bytt bruker
    </button>
  )
}
