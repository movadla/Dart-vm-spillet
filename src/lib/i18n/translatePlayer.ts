import type { PlayersDict } from '@/i18n/dictionaries/no/players'

/** player.nationality/pot.name/PLAYER_STATS.bestAchievement er norsk i kildedataene
 * (src/data/pots.ts, src/data/playerStats.ts) — disse slår opp riktig visningstekst
 * for gjeldende språk, med det norske originalordet som fallback for ukjente verdier
 * (nye spillere lagt til uten oppdatert oversettelsestabell). */
export function translateNationality(dict: PlayersDict, nationality: string): string {
  return dict.nationalities[nationality] ?? nationality
}

export function translatePotName(dict: PlayersDict, potNumber: number, fallback: string): string {
  return dict.potNames[potNumber] ?? fallback
}

export function translateBestAchievement(dict: PlayersDict, playerName: string, fallback: string): string {
  return dict.bestAchievements[playerName] ?? fallback
}
