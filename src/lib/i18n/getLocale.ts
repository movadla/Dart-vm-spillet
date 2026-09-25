import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from '@/config/i18n'

/**
 * Leser gjeldende språk fra cookien src/proxy.ts setter (auto-deteksjon fra
 * Accept-Language, eller brukerens eget valg fra LocaleProvider). Brukes i
 * Server Components og route handlers — IKKE i Client Components, se
 * src/lib/i18n/useLocale.ts der.
 */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : DEFAULT_LOCALE
}
