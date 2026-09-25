'use client'

import { useState } from 'react'
import { SPORT } from '@/config/theme'
import { useLocale } from '@/lib/i18n/useLocale'

interface Props {
  code: string
  fontSize?: number
  color?: string
  letterSpacing?: string
}

export default function CopyCode({ code, fontSize = 18, color = '#dc2626', letterSpacing = '0.12em' }: Props) {
  const { dict } = useLocale()
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
    } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      title={dict.common.copyCode.pressToCopy}
      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
    >
      <span style={{
        fontFamily: SPORT, fontSize, fontWeight: 900,
        color: copied ? '#22c55e' : color,
        letterSpacing: copied ? '0.04em' : letterSpacing,
        transition: 'color 0.15s, letter-spacing 0.15s',
        lineHeight: 1,
      }}>
        {copied ? dict.common.share.copied : code}
      </span>
    </button>
  )
}
