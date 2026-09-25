import Link from 'next/link'
import type { Metadata } from 'next'
import SmartBackButton from '@/components/SmartBackButton'
import BrandBanner from '@/components/BrandBanner'
import LocaleSwitch from '@/components/LocaleSwitch'
import { SPORT, CARD_GRADIENT, CARD_SHADOW } from '@/config/theme'
import { getLocale } from '@/lib/i18n/getLocale'
import { getDictionary } from '@/i18n/dictionaries'

export async function generateMetadata(): Promise<Metadata> {
  const { legal } = getDictionary(await getLocale())
  return { title: legal.privacy.metaTitle }
}

const CARD: React.CSSProperties = {
  background: CARD_GRADIENT,
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: CARD_SHADOW,
  padding: '16px 18px',
  marginBottom: 12,
}

const H: React.CSSProperties = {
  fontSize: 12, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.6)', marginBottom: 10,
}

const P: React.CSSProperties = { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }

export default async function PersonvernPage() {
  const { legal } = getDictionary(await getLocale())
  const t = legal.privacy
  return (
    <div className="page-bg app-frame" style={{ minHeight: '100vh', color: '#fff', padding: '16px 20px 40px', position: 'relative' }}>
      <BrandBanner compact />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '6px 0 14px' }}>
        <SmartBackButton />
        <LocaleSwitch />
      </div>

      <h1 style={{ fontFamily: SPORT, fontSize: 28, fontWeight: 900, textTransform: 'uppercase', margin: '0 0 16px', lineHeight: 1 }}>
        {t.title}
      </h1>

      <div style={CARD}>
        <div style={H}>{t.whatWeStore.h}</div>
        <p style={P}>{t.whatWeStore.p}</p>
      </div>

      <div style={CARD}>
        <div style={H}>{t.whatWeUseItFor.h}</div>
        <p style={P}>{t.whatWeUseItFor.p}</p>
      </div>

      <div style={CARD}>
        <div style={H}>{t.cookies.h}</div>
        <p style={P}>{t.cookies.intro}</p>
        <ul style={{ ...P, margin: '10px 0 0', paddingLeft: 18 }}>
          <li style={{ marginBottom: 6 }}>{t.cookies.vmAuth}</li>
          <li style={{ marginBottom: 6 }}>{t.cookies.adminSession}</li>
          <li>{t.cookies.vmDemo}</li>
        </ul>
        <p style={{ ...P, marginTop: 10 }}>{t.cookies.localStorageNote}</p>
      </div>

      <div style={CARD}>
        <div style={H}>{t.howLong.h}</div>
        <p style={P}>{t.howLong.p}</p>
      </div>

      <div style={CARD}>
        <div style={H}>{t.controller.h}</div>
        <p style={P}>
          {/* TODO (se TODO.md): fyll inn navn/foretaksnavn og adresse her før spillet
              åpnes for ekte deltakere — påkrevd etter GDPR art. 13, og spesielt viktig
              for et internasjonalt publikum utenfor Norge. */}
          {t.controller.placeholder}
        </p>
        <p style={{ ...P, marginTop: 10 }}>
          {t.controller.complaintBefore}{' '}
          <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}>{t.controller.complaintLink}</a>
          {t.controller.complaintAfter}
        </p>
      </div>

      <div style={CARD}>
        <div style={H}>{t.rights.h}</div>
        <p style={P}>{t.rights.p1}</p>
        <p style={{ ...P, marginTop: 10 }}>
          {t.rights.p2Before}{' '}
          <a href={`mailto:${t.rights.email}`} style={{ color: '#fff' }}>{t.rights.email}</a>{' '}
          {t.rights.p2After}
        </p>
      </div>

      <Link href="/" className="back-btn" style={{ marginTop: 8 }}>
        {t.back}
      </Link>
    </div>
  )
}
