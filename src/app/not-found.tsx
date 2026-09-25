import Link from 'next/link'
import type { Metadata } from 'next'
import BrandBanner from '@/components/BrandBanner'
import { SPORT } from '@/config/theme'
import { getLocale } from '@/lib/i18n/getLocale'
import { getDictionary } from '@/i18n/dictionaries'

export async function generateMetadata(): Promise<Metadata> {
  const { legal } = getDictionary(await getLocale())
  return { title: legal.notFound.metaTitle }
}

export default async function NotFound() {
  const { legal } = getDictionary(await getLocale())
  return (
    <div className="page-bg app-frame" style={{ minHeight: '100vh', color: '#fff', padding: '16px 20px 40px', display: 'flex', flexDirection: 'column' }}>
      <BrandBanner compact />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingBottom: 60 }}>
        <div style={{ fontFamily: SPORT, fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.55)', marginBottom: 10 }}>{legal.notFound.eyebrow}</div>
        <h1 style={{ fontFamily: SPORT, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.95, margin: '0 0 14px', fontSize: 40 }}>
          <span style={{ color: '#fff' }}>{legal.notFound.title1}</span>
          <span style={{ color: '#dc2626' }}>{legal.notFound.title2}</span>
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: '0 0 24px', maxWidth: 280, lineHeight: 1.5 }}>
          {legal.notFound.body}
        </p>
        <Link
          href="/"
          className="cta-btn"
          style={{ display: 'inline-block', padding: '13px 26px', background: 'linear-gradient(180deg, #e53030 0%, #b91c1c 100%)', color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 999, textDecoration: 'none', fontFamily: SPORT, boxShadow: '0 4px 20px rgba(220,38,38,0.3)' }}
        >
          {legal.notFound.home}
        </Link>
      </div>
    </div>
  )
}
