'use client'

import { createContext, useCallback, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { LOCALE_COOKIE, type Locale } from '@/config/i18n'
import { getDictionary, type Dictionary } from '@/i18n/dictionaries'

export interface LocaleContextValue {
  locale: Locale
  dict: Dictionary
  setLocale: (locale: Locale) => void
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

/** Ett år — samme varighet som andre bevisste bruker-valg-cookies i appen. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function LocaleProvider({
  initialLocale,
  initialDict,
  children,
}: {
  initialLocale: Locale
  initialDict: Dictionary
  children: ReactNode
}) {
  const router = useRouter()
  const [locale, setLocaleState] = useState(initialLocale)
  const [dict, setDict] = useState(initialDict)

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
      // Oppdater klienttilstanden med det samme (ingen "flash" av gammelt språk
      // i client-komponenter), og be Server Components om å re-rendre med den
      // nye cookien for innhold som hentes via getLocale()/getDictionary() server-side.
      setLocaleState(next)
      setDict(getDictionary(next))
      router.refresh()
    },
    [router],
  )

  return <LocaleContext.Provider value={{ locale, dict, setLocale }}>{children}</LocaleContext.Provider>
}
