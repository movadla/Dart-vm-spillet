// Rene navnehjelpere — egen fil (ikke i TeamTile.tsx) fordi TeamTile er
// 'use client': ALLE eksporter fra en 'use client'-fil blir klient-referanser,
// selv rene funksjoner. Denne fila har ingen 'use client' og kan importeres
// fra både server- og klient-komponenter.

/** Kun det siste ordet i navnet — «Dirk van Duijvenbode» → «Duijvenbode»,
 * «Michael van Gerwen» → «Gerwen», ikke «van Duijvenbode»/«van Gerwen» (var
 * forrige versjon, som fortsatt var for langt i trange rader). */
export function lastName(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean)
  return parts[parts.length - 1] ?? name
}

export function initials(name: string): string {
  const parts = name.split(' ').filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
}
