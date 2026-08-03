'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

export default function AdminLogin() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: code }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Feil kode — prøv igjen')
      setCode('')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ fontFamily: SPORT, fontSize: 48, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 32, color: '#fff' }}>
          <div style={{ color: 'rgba(255,255,255,0.3)' }}>VM 2026</div>
          <div>Admin</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            placeholder="Skriv inn koden"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoFocus
            required
            style={{
              width: '100%',
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${error ? 'rgba(220,38,38,0.5)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 12,
              color: '#fff',
              fontSize: 16,
              outline: 'none',
              boxSizing: 'border-box',
              letterSpacing: '0.1em',
            }}
          />
          {error && (
            <div style={{ fontSize: 13, color: '#ef4444', textAlign: 'center' }}>{error}</div>
          )}
          <button
            type="submit"
            disabled={loading || !code}
            style={{
              padding: '14px',
              background: loading || !code ? 'rgba(220,38,38,0.4)' : '#dc2626',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 14,
              fontWeight: 800,
              cursor: loading || !code ? 'default' : 'pointer',
              fontFamily: SPORT,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {loading ? 'Logger inn...' : 'Logg inn'}
          </button>
        </form>
      </div>
    </div>
  )
}
