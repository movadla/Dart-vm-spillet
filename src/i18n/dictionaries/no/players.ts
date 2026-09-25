import type { Stage } from '@/config/scoring'

export interface PlayersDict {
  stages: Record<Stage, string>
  champion: string
  /** Nøkkel = pot.potNumber fra src/data/pots.ts. */
  potNames: Record<number, string>
  /** Nøkkel = Player.nationality-strengen fra src/data/pots.ts (norsk er kilden,
   * så det norske oppslaget er en identitets-map — se src/lib/i18n/translatePlayer.ts). */
  nationalities: Record<string, string>
  /** Nøkkel = Player.name. Norsk er kilden (samme tekst som PLAYER_STATS). */
  bestAchievements: Record<string, string>
}

export const players: PlayersDict = {
  stages: {
    r1: '1. runde',
    r2: '2. runde',
    r3: '3. runde',
    r4: '4. runde',
    qf: 'Kvartfinale',
    sf: 'Semifinale',
    final: 'Finale',
  },
  champion: 'VM-vinner',
  potNames: {
    1: 'Favorittene',
    2: 'Toppseedet',
    3: 'Storfavoritter',
    4: 'Seedet outsidere',
    5: 'Kvalifiserte',
    6: 'Resten',
  },
  nationalities: {
    England: 'England',
    Nederland: 'Nederland',
    Wales: 'Wales',
    'Nord-Irland': 'Nord-Irland',
    Skottland: 'Skottland',
    Australia: 'Australia',
    Belgia: 'Belgia',
    Tyskland: 'Tyskland',
    Polen: 'Polen',
    Østerrike: 'Østerrike',
    Irland: 'Irland',
    Latvia: 'Latvia',
    Kroatia: 'Kroatia',
  },
  bestAchievements: {
    'Luke Littler': 'VM-vinner 2025',
    'Luke Humphries': 'VM-vinner 2024',
    'Gian van Veen': 'PDC World Youth Champion 2023',
    'Michael van Gerwen': 'VM-vinner 2014, 2017 og 2019',
    'Gerwyn Price': 'VM-vinner 2021',
    'Jonny Clayton': 'Premier League-vinner 2021',
    'James Wade': 'World Matchplay-vinner 2007',
    'Josh Rock': 'World Cup-vinner 2023 (Nord-Irland)',
    'Stephen Bunting': 'BDO-verdensmester 2014',
    'Wessel Nijman': 'Players Championship-vinner 2024',
    'Gary Anderson': 'VM-vinner 2015 og 2016',
    'Ryan Searle': 'Players Championship-vinner',
    'Ross Smith': 'European Championship-vinner 2022',
    'Rob Cross': 'VM-vinner 2018',
    'Jermaine Wattimena': 'Players Championship-vinner',
    'Luke Woodhouse': 'Players Championship-vinner',
    'Martin Schindler': 'European Tour-vinner 2024',
    'Krzysztof Ratajski': 'World Grand Prix-semifinalist 2020',
  },
}
