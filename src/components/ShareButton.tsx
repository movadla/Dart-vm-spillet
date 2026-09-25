'use client'

import { useState } from 'react'
import { SPORT } from '@/config/theme'

interface Props {
  /** Absolutt URL eller relativ sti (løses mot window.location.origin) */
  url: string
  title?: string
  text?: string
  label?: string
  /** pill = samme form som de andre pill-knappene på Min side */
  variant?: 'default' | 'primary' | 'compact' | 'pill'
}

export default function ShareButton({
  url,
  title = 'Dart-VM-spillet',
  text,
  label = 'Del med venner',
  variant = 'default',
}: Props) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    if (typeof navigator === 'undefined') return
    // Relativ sti («/liga/ABC123») løses mot det domenet siden faktisk kjører
    // på — så delingslenker er riktige lokalt, via tunnel og i produksjon uten
    // å være avhengige av NEXT_PUBLIC_BASE_URL.
    const abs = /^https?:\/\//.test(url) ? url : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: abs })
      } catch {
        // Brukeren avbrøt delingen — ignorer
      }
    } else {
      try { await navigator.clipboard.writeText(text ? `${text}\n${abs}` : abs) } catch {}
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isPrimary = variant === 'primary'
  const isCompact = variant === 'compact'
  const isPill = variant === 'pill'

  return (
    <button
      onClick={handleShare}
      className={isPill ? 'guide-btn' : undefined}
      aria-live="polite"
      style={{
        display: isPrimary ? 'flex' : 'inline-flex',
        width: isPrimary ? '100%' : undefined,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 7,
        padding: isPrimary ? '14px 22px' : isCompact ? '4px 10px' : isPill ? '13px 20px' : '12px 22px',
        background: copied ? 'rgba(34,197,94,0.1)' : isPrimary ? '#dc2626' : isPill ? 'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.05) 100%)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : isPrimary ? 'rgba(220,38,38,0.5)' : isPill ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.14)'}`,
        borderRadius: isCompact ? 6 : isPill ? 999 : 12,
        color: copied ? '#4ade80' : isPrimary ? '#fff' : isPill ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.75)',
        fontSize: isCompact ? 11 : 14,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        fontFamily: SPORT,
        transition: 'background 0.15s, color 0.15s, border-color 0.15s',
        boxShadow: isPrimary && !copied ? '0 4px 16px rgba(220,38,38,0.3)' : isPill ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 12px rgba(0,0,0,0.3)' : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? '✓ Kopiert' : label}
    </button>
  )
}
