import type { Locale } from '@/config/i18n'
import { common as noCommon } from './no/common'
import { common as enCommon } from './en/common'
import { players as noPlayers } from './no/players'
import { players as enPlayers } from './en/players'

const dictionaries = {
  no: { common: noCommon, players: noPlayers },
  en: { common: enCommon, players: enPlayers },
} as const

export type Dictionary = (typeof dictionaries)['no']

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
