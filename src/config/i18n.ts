// Én kilde for hvilke språk appen støtter. Ingen URL-prefiks (samme URL på
// begge språk) — se src/proxy.ts (deteksjon) og src/lib/i18n/getLocale.ts
// (lesing). Norsk er standard/fallback for alt som ikke er eksplisitt satt.
export const LOCALES = ['no', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'no'

/** Cookie satt av src/proxy.ts (auto-deteksjon) eller LocaleProvider (eget valg). */
export const LOCALE_COOKIE = 'vm_locale'

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value)
}
