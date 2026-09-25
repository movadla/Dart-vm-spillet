// Rene navnehjelpere — egen fil (ikke i TeamTile.tsx) fordi TeamTile er
// 'use client': ALLE eksporter fra en 'use client'-fil blir klient-referanser,
// selv rene funksjoner, og kan da ikke kalles fra en server-komponent (som
// NextMatches.tsx). Denne filen har ingen 'use client' og kan importeres fra begge.

export function lastName(name: string): string {
  const i = name.indexOf(' ')
  return i < 0 ? name : name.slice(i + 1)
}

export function initials(name: string): string {
  const parts = name.split(' ').filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
}
