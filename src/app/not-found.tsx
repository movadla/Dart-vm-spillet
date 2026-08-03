import Link from 'next/link'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

export default function NotFound() {
  return (
    <div className="page-bg" style={{ minHeight: '100vh', color: '#fff', padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 24 }}>
        <div style={{ fontSize: 120, color: 'rgba(255,255,255,0.06)', letterSpacing: '-4px' }}>404</div>
        <div style={{ fontSize: 48, color: '#fff', marginTop: -16 }}>Siden</div>
        <div style={{ fontSize: 48, color: '#dc2626' }}>finnes ikke</div>
      </div>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 32, maxWidth: 280 }}>
        Lenken er ugyldig eller siden har blitt fjernet.
      </p>
      <Link
        href="/"
        style={{ display: 'inline-block', padding: '14px 28px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 12, textDecoration: 'none', fontFamily: SPORT, boxShadow: '0 4px 20px rgba(220,38,38,0.3)' }}
      >
        Gå hjem →
      </Link>
    </div>
  )
}
