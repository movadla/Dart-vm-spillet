import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { getLocale } from '@/lib/i18n/getLocale'
import { getDictionary } from '@/i18n/dictionaries'
import { LocaleProvider } from '@/components/i18n/LocaleProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const condensed = Barlow_Condensed({
  weight: ['600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-condensed',
})

// Metadata leser språk-cookien (via getLocale()) og kan derfor ikke lenger
// være et statisk objekt — Next kjører generateMetadata() på nytt per
// forespørsel i stedet. Selve merkenavnet oversettes bevisst ikke.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const { common } = getDictionary(locale)
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://dartvmspillet.com'),
    // Undersider setter eget navn («Leaderboard», deltakerens navn, liganavn) —
    // malen legger på merkevaren, så fanen/historikken skiller sidene fra hverandre.
    title: { default: common.appName, template: `%s – ${common.appName}` },
    description: common.appDescription,
    manifest: '/manifest.json',
    icons: {
      apple: '/icon.svg',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: common.appName,
    },
    openGraph: {
      title: common.appName,
      description: common.appDescription,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: common.appName,
      description: common.appDescription,
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#080808',
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  return (
    <html lang={locale} className={`${inter.variable} ${condensed.variable}`}>
      <body style={{ margin: 0, minHeight: '100vh', background: '#0d1117', color: '#fff', fontFamily: 'var(--font-inter), -apple-system, sans-serif' }}>
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(ellipse 80% 55% at 15% 0%, rgba(10,40,100,0.5) 0%, transparent 60%), radial-gradient(ellipse 80% 55% at 85% 0%, rgba(100,10,20,0.45) 0%, transparent 60%)',
        }} />
        <div className="app-container" style={{ maxWidth: 'var(--app-width)', margin: '0 auto', minHeight: '100vh', position: 'relative', zIndex: 1, boxShadow: '0 0 80px rgba(0,0,0,0.6)' }}>
          <LocaleProvider initialLocale={locale}>
            {children}
          </LocaleProvider>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
