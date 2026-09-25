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

/**
 * Får kun `initialLocale` (en ren streng) fra RootLayout, ALDRI en ordbok som
 * prop — ordbøkene inneholder funksjoner (pluralisering/maler), og React
 * Server Components kan ikke serialisere funksjoner over server→klient-
 * grensen. getDictionary() er ren, avhengighetsfri data-oppslag, så den kan
 * trygt kjøres på nytt her i klienten fra den samme locale-strengen i stedet.
 */
export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: ReactNode
}) {
  const router = useRouter()
  const [locale, setLocaleState] = useState(initialLocale)
  const [dict, setDict] = useState<Dictionary>(() => getDictionary(initialLocale))

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
