// Delte design-tokens. Tidligere lå SPORT-fonten kopiert i 29 filer og
// kort-gradienten/-skyggen i 13 — endre KUN her.

/** Sport-condensed skrift: kun titler, navn og tall (aldri løpende tekst). */
export const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

/** Bakgrunn på alle «kort» (mørk, svak vertikal gradient). */
export const CARD_GRADIENT = 'linear-gradient(180deg, #161b27 0%, #12161f 100%)'
/** Standard kortskygge med lys topplinje. */
export const CARD_SHADOW = 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)'
export const CARD_BORDER = '1px solid rgba(255,255,255,0.12)'

/** Ferdig kortstil — bruk `{ ...CARD, borderRadius: 14 }` for avvik. */
export const CARD = {
  background: CARD_GRADIENT,
  border: CARD_BORDER,
  borderRadius: 16,
  boxShadow: CARD_SHADOW,
} as const

// Tekstkontrast: dempet tekst skal aldri under 0.55 alfa, brødtekst ≥ 12 px,
// etiketter ≥ 11 px (Lighthouse + lesbarhet på mobil).
export const MUTED = 'rgba(255,255,255,0.6)'
export const MUTED_STRONG = 'rgba(255,255,255,0.75)'
