'use client'

import { useState } from 'react'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

interface Props {
  url: string
  title?: string
  text?: string
  label?: string
  variant?: 'default' | 'primary' | 'compact'
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
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch {
        // User cancelled share — ignore
      }
    } else {
      await navigator.clipboard.writeText(text ? `${text}\n${url}` : url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isPrimary = variant === 'primary'
  const isCompact = variant === 'compact'

  return (
    <button
      onClick={handleShare}
      style={{
        display: isPrimary ? 'flex' : 'inline-flex',
        width: isPrimary ? '100%' : undefined,
        justifyContent: isPrimary ? 'center' : undefined,
        alignItems: 'center',
        gap: 7,
        padding: isPrimary ? '14px 22px' : isCompact ? '4px 10px' : '12px 22px',
        background: copied ? 'rgba(34,197,94,0.08)' : isPrimary ? '#dc2626' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${copied ? 'rgba(34,197,94,0.25)' : isPrimary ? 'rgba(220,38,38,0.5)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: isCompact ? 6 : 12,
        color: copied ? '#22c55e' : isPrimary ? '#fff' : 'rgba(255,255,255,0.55)',
        fontSize: isCompact ? 10 : 14,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        fontFamily: SPORT,
        transition: 'background 0.15s, color 0.15s, border-color 0.15s',
        boxShadow: isPrimary && !copied ? '0 4px 16px rgba(220,38,38,0.3)' : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? '✓' : label}
    </button>
  )
}
