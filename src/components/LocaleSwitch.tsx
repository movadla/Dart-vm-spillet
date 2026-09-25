'use client'

import { useLocale } from '@/lib/i18n/useLocale'

/** Liten NO/EN-bryter — limt inn i hver sides eksisterende nav-rad (samme sted
 * som SmartBackButton), se AGENTS.md-planen for i18n. Samme visuelle språk
 * som .back-btn (pille, dempet), men egen styling siden den har to segmenter. */
export default function LocaleSwitch() {
  const { locale, dict, setLocale } = useLocale()

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.11)', padding: 2, flexShrink: 0 }}>
      {(['no', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-label={l === 'no' ? dict.common.localeSwitch.switchToNo : dict.common.localeSwitch.switchToEn}
          aria-pressed={locale === l}
          style={{
            border: 'none',
            borderRadius: 16,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.02em',
            cursor: 'pointer',
            background: locale === l ? 'rgba(255,255,255,0.14)' : 'transparent',
            color: locale === l ? '#fff' : 'rgba(255,255,255,0.5)',
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
