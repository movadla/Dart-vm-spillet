'use client'

import { formatKickoffDateTime } from '@/config/tournament'
import { useLocale } from '@/lib/i18n/useLocale'

/**
 * Påmeldingsfristen i en tydelig boks. Teksten bygges alltid av KICKOFF
 * (src/config/tournament.ts), så den kan aldri avvike fra når påmeldingen faktisk stenger.
 * showNoChanges legger til «etter fristen kan du ikke endre valgene».
 */
export default function DeadlineNote({ showNoChanges = false }: { showNoChanges?: boolean }) {
  const { locale, dict } = useLocale()
  return (
    <div style={{ border: '1px solid rgba(251,191,36,0.35)', background: 'rgba(251,191,36,0.07)', borderRadius: 12, padding: '9px 12px', fontSize: 13, lineHeight: 1.45, color: 'rgba(255,255,255,0.88)' }}>
      <strong style={{ fontWeight: 700 }}>{dict.common.deadline.label(formatKickoffDateTime(locale))}</strong>
      {showNoChanges && <div style={{ marginTop: 2, color: 'rgba(255,255,255,0.7)' }}>{dict.common.deadline.noChanges}</div>}
    </div>
  )
}
