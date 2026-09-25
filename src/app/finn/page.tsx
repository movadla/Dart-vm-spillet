'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BrandBanner from '@/components/BrandBanner'
import { DEMO_EMAIL } from '@/lib/demo'
import { KICKOFF } from '@/config/tournament'
import { SPORT, CARD_GRADIENT, CARD_SHADOW } from '@/config/theme'

// Demo-snarveien vises kun lokalt — i produksjon er demo-e-posten fortsatt
// gyldig, men ikke annonsert.
const SHOW_DEMO_HINT = process.env.NODE_ENV !== 'production'

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

  async function submit(value: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/finn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value.trim() }),
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

  const notFound = error?.startsWith('Fant ingen')

  return (
    <div className="page-bg app-frame" style={{ minHeight: '100vh', color: '#fff', padding: '16px 20px 40px', position: 'relative' }}>
      <BrandBanner compact />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '6px 0 22px' }}>
        <Link href="/" className="back-btn">← Hjem</Link>
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>Allerede påmeldt?</div>
      <h1 style={{ fontFamily: SPORT, fontSize: 36, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1, margin: '0 0 8px' }}>
        Finn <span style={{ color: '#dc2626' }}>min side</span>
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.65)', margin: '0 0 22px', fontSize: 14, lineHeight: 1.5 }}>
        Skriv inn e-posten du registrerte deg med, så finner vi laget ditt.
      </p>

      <form onSubmit={(e) => { e.preventDefault(); submit(email) }} noValidate>
        <div style={{ background: CARD_GRADIENT, border: `1px solid ${error ? 'rgba(220,38,38,0.4)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 16, padding: 16, marginBottom: 10, transition: 'border-color 0.2s', boxShadow: CARD_SHADOW }}>
          <label htmlFor="finn-epost" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>
            E-post
          </label>
          <input
            id="finn-epost"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null) }}
            placeholder="ola@example.com"
            required
            autoComplete="email"
            inputMode="email"
            autoFocus
            aria-invalid={!!error}
            aria-describedby={error ? 'finn-feil' : undefined}
            style={{
              width: '100%', padding: '13px 14px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 10, color: '#fff', fontSize: 16,
              boxSizing: 'border-box' as const,
            }}
          />

        {/* Feilen står rett under feltet den gjelder, inne i samme kort */}
        {error && (
          <div id="finn-feil" role="alert" style={{ padding: '12px 14px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 12, marginTop: 10 }}>
            <div style={{ fontSize: 13, color: '#f87171', fontWeight: 700, marginBottom: 3 }}>{notFound ? 'Fant ingen deltaker med denne e-posten' : error}</div>
            {notFound && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                {new Date() >= KICKOFF ? (
                  'Sjekk stavemåten og prøv igjen. Påmeldingen er stengt.'
                ) : (
                  <>
                    Sjekk stavemåten, eller{' '}
                    <Link href="/tipp" className="text-link" style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                      meld deg på her
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}
        </div>

        <button
          type="submit"
          className="cta-btn"
          disabled={!canSubmit}
          style={{
            display: 'block', width: '100%', padding: '15px',
            background: canSubmit ? 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)' : 'rgba(255,255,255,0.07)',
            color: canSubmit ? '#fff' : 'rgba(255,255,255,0.4)',
            border: 'none', borderRadius: 999, fontSize: 15, fontWeight: 800,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            fontFamily: SPORT, letterSpacing: '0.06em', textTransform: 'uppercase' as const,
            boxShadow: canSubmit ? '0 4px 20px rgba(220,38,38,0.35)' : 'none',
            transition: 'background 0.15s, box-shadow 0.15s',
          }}
        >
          {loading ? 'Søker …' : 'Finn min side →'}
        </button>
      </form>

      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 16, lineHeight: 1.5 }}>
        Ikke påmeldt ennå?{' '}
        <Link href="/tipp" className="text-link" style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 }}>Velg laget ditt →</Link>
      </p>

      {SHOW_DEMO_HINT && (
        <button
          type="button"
          onClick={() => { setEmail(DEMO_EMAIL); submit(DEMO_EMAIL) }}
          disabled={loading}
          className="btn-hover"
          style={{ display: 'block', margin: '24px auto 0', padding: '8px 14px', borderRadius: 999, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em' }}
        >
          Prøv demo-deltakeren ({DEMO_EMAIL}) →
        </button>
      )}
    </div>
  )
}
