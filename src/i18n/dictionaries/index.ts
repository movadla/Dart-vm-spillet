import type { Locale } from '@/config/i18n'
import { common as noCommon } from './no/common'
import { common as enCommon } from './en/common'
import { players as noPlayers } from './no/players'
import { players as enPlayers } from './en/players'
import { leaderboard as noLeaderboard } from './no/leaderboard'
import { leaderboard as enLeaderboard } from './en/leaderboard'
import { liga as noLiga } from './no/liga'
import { liga as enLiga } from './en/liga'
import { errors as noErrors } from './no/errors'
import { errors as enErrors } from './en/errors'
import { finn as noFinn } from './no/finn'
import { finn as enFinn } from './en/finn'
import { home as noHome } from './no/home'
import { home as enHome } from './en/home'
import { vmInfo as noVmInfo } from './no/vmInfo'
import { vmInfo as enVmInfo } from './en/vmInfo'
import { tipp as noTipp } from './no/tipp'
import { tipp as enTipp } from './en/tipp'
import { deltaker as noDeltaker } from './no/deltaker'
import { deltaker as enDeltaker } from './en/deltaker'

const dictionaries = {
  no: { common: noCommon, players: noPlayers, leaderboard: noLeaderboard, liga: noLiga, errors: noErrors, finn: noFinn, home: noHome, vmInfo: noVmInfo, tipp: noTipp, deltaker: noDeltaker },
  en: { common: enCommon, players: enPlayers, leaderboard: enLeaderboard, liga: enLiga, errors: enErrors, finn: enFinn, home: enHome, vmInfo: enVmInfo, tipp: enTipp, deltaker: enDeltaker },
} as const

export type Dictionary = (typeof dictionaries)['no']

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
