'use client'

import { useLocale } from '@/lib/i18n/useLocale'

/** «Oppdatert 14:32» — tidspunktet siden sist ble hentet fra serveren. */
export default function LastUpdated({ fetchedAt }: { fetchedAt: string }) {
  const { dict } = useLocale()
  const d = new Date(fetchedAt)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return (
    // suppressHydrationWarning: klientens tidssone kan avvike fra serverens.
    <span suppressHydrationWarning style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums' }}>
      {dict.common.lastUpdated.replace('{time}', `${hh}:${mm}`)}
    </span>
  )
}
