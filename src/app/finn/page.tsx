'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

const KICKOFF = new Date('2026-12-11T19:00:00Z')

export default function FinnPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  // localStorage finnes ikke under SSR — sjekkes med vilje etter mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vm_participant_id')
      if (saved) { router.replace(`/deltaker/${saved}`); return }
    } catch {}
    setChecking(false)
  }, [router])
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/finn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Noe gikk galt')
      } else {
        try { localStorage.setItem('vm_participant_id', data.id) } catch {}
        router.push(`/deltaker/${data.id}`)
      }
    } catch {
      setError('Noe gikk galt. Prøv igjen.')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = email.includes('@') && !loading

  if (checking) return null

  return (
    <div className="page-bg" style={{ minHeight: '100vh', color: '#fff', padding: '40px 20px 56px', position: 'relative' }}>
      <div style={{ marginBottom: 12, position: 'relative', zIndex: 1 }}>
        <Link href="/" className="back-btn">← Hjem</Link>
      </div>

      {/* Brand banner */}
      <div style={{ position: 'relative', height: 145, marginBottom: 16, pointerEvents: 'none', zIndex: 1 }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.3, paddingTop: 4, whiteSpace: 'nowrap', background: 'linear-gradient(125deg, #f0fff4 0%, #86efac 12%, #22c55e 42%, #15803d 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 18px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.5)' }}>
            — PDC World Championship —
          </div>
          <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', fontSize: 52, letterSpacing: '-1px', lineHeight: 1 }}>
            <span style={{ color: 'rgba(255,255,255,0.38)' }}>DART-VM-</span>
            <span style={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPILLET</span>
          </div>
        </div>
      </div>

      <div style={{ fontFamily: SPORT, fontSize: 46, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 8 }}>
        <div style={{ color: '#fff' }}>Min</div>
        <div style={{ color: '#dc2626' }}>side</div>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 32, fontSize: 14 }}>
        Skriv inn e-posten du registrerte deg med
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
        <div style={{ background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)', border: `1px solid ${error ? 'rgba(220,38,38,0.3)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 20, padding: '20px', marginBottom: 12, transition: 'border-color 0.2s', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)' }}>
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 8 }}>
            E-post
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null) }}
            placeholder="ola@example.com"
            required
            autoComplete="email"
            style={{
              width: '100%', padding: '13px 14px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, color: '#fff', fontSize: 16,
              boxSizing: 'border-box' as const,
            }}
          />
        </div>

        {error && (
          <div style={{ padding: '13px 16px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#ef4444', fontWeight: 700, marginBottom: 3 }}>Fant ingen konto med denne e-posten</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
              {new Date() >= KICKOFF ? (
                'Sjekk stavemåten og prøv igjen. Påmeldingen er stengt.'
              ) : (
                <>
                  Sjekk stavemåten, eller{' '}
                  <Link href="/tipp" className="btn-hover" style={{ color: '#dc2626', textDecoration: 'none', fontWeight: 700 }}>
                    registrer deg her
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="cta-btn"
          disabled={!canSubmit}
          style={{
            display: 'block', width: '100%', padding: '16px',
            background: canSubmit ? '#dc2626' : 'rgba(255,255,255,0.07)',
            color: canSubmit ? '#fff' : 'rgba(255,255,255,0.25)',
            border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            fontFamily: SPORT, letterSpacing: '0.06em', textTransform: 'uppercase' as const,
            boxShadow: canSubmit ? '0 4px 20px rgba(220,38,38,0.35)' : 'none',
            transition: 'background 0.15s, box-shadow 0.15s',
          }}
        >
          {loading ? 'Søker...' : 'Finn min side →'}
        </button>
      </form>

    </div>
  )
}
