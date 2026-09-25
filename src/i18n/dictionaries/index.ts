import type { Locale } from '@/config/i18n'
import { common as noCommon } from './no/common'
import { common as enCommon } from './en/common'
import { players as noPlayers } from './no/players'
import { players as enPlayers } from './en/players'
import { leaderboard as noLeaderboard } from './no/leaderboard'
import { leaderboard as enLeaderboard } from './en/leaderboard'
import { liga as noLiga } from './no/liga'
import { liga as enLiga } from './en/liga'

const dictionaries = {
  no: { common: noCommon, players: noPlayers, leaderboard: noLeaderboard, liga: noLiga },
  en: { common: enCommon, players: enPlayers, leaderboard: enLeaderboard, liga: enLiga },
} as const

export type Dictionary = (typeof dictionaries)['no']

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
