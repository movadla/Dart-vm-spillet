'use client'

import { useContext } from 'react'
import { LocaleContext } from '@/components/i18n/LocaleProvider'

/** Kun for Client Components — se src/lib/i18n/getLocale.ts for Server Components. */
export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale() må brukes inne i <LocaleProvider> (satt opp i src/app/layout.tsx)')
  return ctx
}
