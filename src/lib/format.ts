import type { Locale } from '@/config/i18n'

// Norsk: komma som desimaltegn, og et smalt hardt mellomrom (U+202F) mellom
// tall og enhet («41 p», «12 %»), så tall og enhet aldri brytes fra
// hverandre og ser likt ut overalt. Engelsk bruker punktum-desimal og et
// vanlig «pts»-suffiks i stedet for «p».
const NNBSP = ' '

const INTL_LOCALE: Record<Locale, string> = { no: 'nb-NO', en: 'en-US' }
/** Eksportert for steder som trenger «p»/«pts»-suffikset separat fra tallet
 * (egen styling på suffikset), f.eks. MiniLeaderboard på forsiden. */
export const POINTS_SUFFIX: Record<Locale, string> = { no: 'p', en: 'pts' }

export function formatPoints(n: number, locale: Locale = 'no'): string {
  return `${n.toLocaleString(INTL_LOCALE[locale])}${NNBSP}${POINTS_SUFFIX[locale]}`
}

export function formatPercent(n: number, locale: Locale = 'no'): string {
  return `${Math.round(n).toLocaleString(INTL_LOCALE[locale])}${NNBSP}%`
}

/** Odds «2.5» → «2,50» (norsk) / «2.50» (engelsk). Ukjent format vises som det er. */
export function formatOdds(odds: string, locale: Locale = 'no'): string {
  const n = Number.parseFloat(odds)
  return Number.isFinite(n)
    ? n.toLocaleString(INTL_LOCALE[locale], { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : odds
}

export function formatAvg(avg: number | undefined, locale: Locale = 'no'): string {
  return avg == null ? '—' : avg.toLocaleString(INTL_LOCALE[locale], { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
