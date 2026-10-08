'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from '@/lib/i18n/useLocale'

// Fane-linje nederst — vises BARE for dem som har meldt seg på (deltaker-id i
// localStorage, satt ved påmelding / «Finn min side») og bare på sidene der den
// hører hjemme. Forsiden, tippe-flyten, «Finn min side», personvern og admin
// har egen navigasjon og får ingen fane-linje.
const SHOW_ON = ['/deltaker', '/leaderboard', '/liga', '/vm-info']

const ICON: React.CSSProperties = { width: 22, height: 22, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

function Icon({ name }: { name: 'home' | 'mine' | 'board' | 'guide' }) {
  if (name === 'home') return <svg viewBox="0 0 24 24" style={ICON} aria-hidden><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>
  if (name === 'mine') return <svg viewBox="0 0 24 24" style={ICON} aria-hidden><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" /></svg>
  if (name === 'board') return <svg viewBox="0 0 24 24" style={ICON} aria-hidden><path d="M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" /><path d="M12 14v4M8 20h8" /></svg>
  return <svg viewBox="0 0 24 24" style={ICON} aria-hidden><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19V5" /></svg>
}

export default function BottomNav() {
  const { dict } = useLocale()
  const pathname = usePathname() ?? ''
  const [myId, setMyId] = useState<string | null>(null)

  // localStorage finnes ikke under SSR — leses etter mount (samme mønster som RankList).
  useEffect(() => {
    const read = () => { try { setMyId(localStorage.getItem('vm_participant_id')) } catch {} }
    read()
    // Id-en kan settes uten sidebytte (demo-deltakeren, innlogging i en annen fane).
    window.addEventListener('vm-participant-changed', read)
    window.addEventListener('storage', read)
    return () => { window.removeEventListener('vm-participant-changed', read); window.removeEventListener('storage', read) }
  }, [pathname])

  const visible = !!myId && SHOW_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  // Gir innholdet bunn-luft så fane-linjen aldri dekker siste rad (se .has-bottom-nav i globals.css).
  useEffect(() => {
    document.body.classList.toggle('has-bottom-nav', visible)
    return () => document.body.classList.remove('has-bottom-nav')
  }, [visible])

  if (!visible) return null

  const t = dict.common.bottomNav
  const items = [
    { key: 'home', label: t.home, href: '/', active: false },
    { key: 'mine', label: t.mine, href: `/deltaker/${myId}`, active: pathname.startsWith('/deltaker') },
    { key: 'board', label: t.board, href: '/leaderboard', active: pathname.startsWith('/leaderboard') || pathname.startsWith('/liga') },
    { key: 'guide', label: t.guide, href: '/vm-info', active: pathname.startsWith('/vm-info') },
  ] as const

  return (
    <nav aria-label={t.aria} className="bottom-nav">
      {items.map((it) => (
        <Link key={it.key} href={it.href} aria-current={it.active ? 'page' : undefined} className="bottom-nav-item" data-active={it.active ? 'true' : undefined}>
          <Icon name={it.key} />
          <span>{it.label}</span>
        </Link>
      ))}
    </nav>
  )
}
