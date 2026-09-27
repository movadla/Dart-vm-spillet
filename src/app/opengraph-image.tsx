import { ImageResponse } from 'next/og'
import { getLocale } from '@/lib/i18n/getLocale'
import { getDictionary } from '@/i18n/dictionaries'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const { legal } = getDictionary(await getLocale())
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
          background: '#070b16',
          padding: '72px 80px',
          fontFamily: 'Arial Narrow, Arial, sans-serif',
        }}
      >
        {/* Background accent line */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 6,
          background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)',
          display: 'flex',
        }} />

        {/* Large ghost number */}
        <div style={{
          position: 'absolute',
          right: 60,
          top: '50%',
          fontSize: 520,
          fontWeight: 900,
          color: 'rgba(59,130,246,0.06)',
          lineHeight: 1,
          letterSpacing: '-20px',
          display: 'flex',
        }}>
          6
        </div>

        {/* Main text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16, display: 'flex' }}>
            {legal.ogImage.brandLine}
          </div>
          <div style={{ fontSize: 92, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9, letterSpacing: '-2px', color: '#93c5fd', display: 'flex' }}>
            WORLD GRAND PRIX
          </div>
          <div style={{ fontSize: 160, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.85, letterSpacing: '-4px', color: '#ffffff', display: 'flex' }}>
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
          {legal.ogImage.tagline}
        </div>
      </div>
    ),
    { ...size }
  )
}
