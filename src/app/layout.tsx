import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://dartvmspillet.com'),
  title: 'Dart-VM-spillet',
  description: 'Velg 5 dartspillere. Følg dem gjennom dart-VM. Vinn potten.',
  manifest: '/manifest.json',
  icons: {
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Dart-VM-spillet',
  },
  openGraph: {
    title: 'Dart-VM-spillet',
    description: 'Velg 5 dartspillere. Følg dem gjennom dart-VM. Vinn potten.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dart-VM-spillet',
    description: 'Velg 5 dartspillere. Følg dem gjennom dart-VM. Vinn potten.',
  },
}

export const viewport: Viewport = {
  themeColor: '#080808',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no" className={`${inter.variable} ${condensed.variable}`}>
      <body style={{ margin: 0, minHeight: '100vh', background: '#0d1117', color: '#fff', fontFamily: 'var(--font-inter), -apple-system, sans-serif' }}>
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(ellipse 80% 55% at 15% 0%, rgba(10,40,100,0.5) 0%, transparent 60%), radial-gradient(ellipse 80% 55% at 85% 0%, rgba(100,10,20,0.45) 0%, transparent 60%)',
        }} />
        <div className="app-container" style={{ maxWidth: 'var(--app-width)', margin: '0 auto', minHeight: '100vh', position: 'relative', zIndex: 1, boxShadow: '0 0 80px rgba(0,0,0,0.6)' }}>
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}
