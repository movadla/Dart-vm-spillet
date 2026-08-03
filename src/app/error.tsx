'use client'

import Link from 'next/link'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="page-bg" style={{ minHeight: '100vh', color: '#fff', padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 24 }}>
        <div style={{ fontSize: 48, color: '#fff' }}>Noe gikk</div>
        <div style={{ fontSize: 48, color: '#dc2626' }}>galt</div>
      </div>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 32, maxWidth: 280 }}>
        En uventet feil oppstod. Last siden på nytt eller gå tilbake til start.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{ padding: '14px 24px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: SPORT, boxShadow: '0 4px 20px rgba(220,38,38,0.3)' }}
        >
          Prøv igjen
        </button>
        <Link
          href="/"
          style={{ display: 'inline-block', padding: '14px 24px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 14, letterSpacing: '0.04em', textTransform: 'uppercase', borderRadius: 12, textDecoration: 'none', fontFamily: SPORT, border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Gå hjem
        </Link>
      </div>
    </div>
  )
}
