'use client'

import Link from 'next/link'
import BrandBanner from '@/components/BrandBanner'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="page-bg app-frame" style={{ minHeight: '100vh', color: '#fff', padding: '16px 20px 40px', display: 'flex', flexDirection: 'column' }}>
      <BrandBanner compact />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingBottom: 60 }}>
        <h1 style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.95, margin: '0 0 14px', fontSize: 40 }}>
          <span style={{ color: '#fff' }}>Noe gikk </span>
          <span style={{ color: '#dc2626' }}>galt</span>
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: '0 0 24px', maxWidth: 280, lineHeight: 1.5 }}>
          En uventet feil oppstod. Prøv igjen, eller gå tilbake til forsiden.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={reset}
            className="cta-btn"
            style={{ padding: '13px 24px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: SPORT, boxShadow: '0 4px 20px rgba(220,38,38,0.3)' }}
          >
            Prøv igjen
          </button>
          <Link href="/" className="back-btn" style={{ padding: '13px 20px', fontSize: 14 }}>
            Til forsiden
          </Link>
        </div>
      </div>
    </div>
  )
}
