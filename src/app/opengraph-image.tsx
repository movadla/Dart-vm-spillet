import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          background: '#0a0a0a',
          padding: '72px 80px',
          fontFamily: 'Arial Narrow, Arial, sans-serif',
        }}
      >
        {/* Background accent line */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 6,
          background: '#dc2626',
          display: 'flex',
        }} />

        {/* Large ghost number */}
        <div style={{
          position: 'absolute',
          right: 60,
          top: '50%',
          fontSize: 520,
          fontWeight: 900,
          color: 'rgba(220,38,38,0.04)',
          lineHeight: 1,
          letterSpacing: '-20px',
          display: 'flex',
        }}>
          8
        </div>

        {/* Main text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16, display: 'flex' }}>
            VM 2026
          </div>
          <div style={{ fontSize: 160, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.85, letterSpacing: '-4px', color: '#ffffff', display: 'flex' }}>
            VM-
          </div>
          <div style={{ fontSize: 160, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.85, letterSpacing: '-4px', color: '#dc2626', display: 'flex' }}>
            SPILLET
          </div>
        </div>

        {/* Tagline */}
        <div style={{
          marginTop: 40,
          fontSize: 32,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: '0.02em',
          display: 'flex',
        }}>
          Velg 8 lag. Følg VM. Spill mot venner.
        </div>
      </div>
    ),
    { ...size }
  )
}
