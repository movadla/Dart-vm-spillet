export interface Player {
  name: string
  nationality: string
  iso2: string
  pdcRanking: number
  seedNumber: number | null
  odds: string
}

export interface Pot {
  potNumber: number
  name: string
  emoji: string
  players: Player[]
}

export const POT_NAMES = [
  '⭐ Toppseedet',
  '💪 Storfavoritter',
  '🏆 Seedet outsidere',
  '🔥 Kvalifiserte',
  '🎲 Wildcards',
]

// Seed 1–32 hentet fra PDC Order of Merit (Wikipedia, snapshot 2026-09-13).
// Pott 4/5 (useedede) er en illustrativ liste over kjente PDC-profesjonelle —
// oppdater med det faktiske deltakerfeltet når PDC publiserer trekningen for
// sesongens VM (vanligvis medio november).
export const POTS: Pot[] = [
  {
    potNumber: 1,
    name: '⭐ Toppseedet',
    emoji: '⭐',
    players: [
      { name: 'Luke Littler',      nationality: 'England',     iso2: 'gb-eng', pdcRanking: 1, seedNumber: 1, odds: '2.5' },
      { name: 'Luke Humphries',    nationality: 'England',     iso2: 'gb-eng', pdcRanking: 2, seedNumber: 2, odds: '3.5' },
      { name: 'Gian van Veen',     nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 3, seedNumber: 3, odds: '9.0' },
      { name: 'Gerwyn Price',      nationality: 'Wales',       iso2: 'gb-wls', pdcRanking: 4, seedNumber: 4, odds: '11.0' },
      { name: 'Jonny Clayton',     nationality: 'Wales',       iso2: 'gb-wls', pdcRanking: 5, seedNumber: 5, odds: '13.0' },
      { name: 'James Wade',        nationality: 'England',     iso2: 'gb-eng', pdcRanking: 6, seedNumber: 6, odds: '15.0' },
      { name: 'Michael van Gerwen',nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 7, seedNumber: 7, odds: '9.0' },
      { name: 'Josh Rock',         nationality: 'Nord-Irland', iso2: 'gb-nir', pdcRanking: 8, seedNumber: 8, odds: '17.0' },
    ],
  },
  {
    potNumber: 2,
    name: '💪 Storfavoritter',
    emoji: '💪',
    players: [
      { name: 'Stephen Bunting',   nationality: 'England',     iso2: 'gb-eng', pdcRanking: 9,  seedNumber: 9,  odds: '21.0' },
      { name: 'Danny Noppert',     nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 10, seedNumber: 10, odds: '26.0' },
      { name: 'Gary Anderson',     nationality: 'Skottland',   iso2: 'gb-sct', pdcRanking: 11, seedNumber: 11, odds: '34.0' },
      { name: 'Wessel Nijman',     nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 12, seedNumber: 12, odds: '26.0' },
      { name: 'Ryan Searle',       nationality: 'England',     iso2: 'gb-eng', pdcRanking: 13, seedNumber: 13, odds: '34.0' },
      { name: 'Ross Smith',        nationality: 'England',     iso2: 'gb-eng', pdcRanking: 14, seedNumber: 14, odds: '41.0' },
      { name: 'Chris Dobey',       nationality: 'England',     iso2: 'gb-eng', pdcRanking: 15, seedNumber: 15, odds: '41.0' },
      { name: 'Nathan Aspinall',   nationality: 'England',     iso2: 'gb-eng', pdcRanking: 16, seedNumber: 16, odds: '34.0' },
    ],
  },
  {
    potNumber: 3,
    name: '🏆 Seedet outsidere',
    emoji: '🏆',
    players: [
      { name: 'Jermaine Wattimena',    nationality: 'Nederland',      iso2: 'nl',     pdcRanking: 17, seedNumber: 17, odds: '81.0' },
      { name: 'Luke Woodhouse',        nationality: 'England',        iso2: 'gb-eng', pdcRanking: 18, seedNumber: 18, odds: '81.0' },
      { name: 'Martin Schindler',      nationality: 'Tyskland',       iso2: 'de',     pdcRanking: 19, seedNumber: 19, odds: '81.0' },
      { name: 'Krzysztof Ratajski',    nationality: 'Polen',          iso2: 'pl',     pdcRanking: 20, seedNumber: 20, odds: '101.0' },
      { name: 'Rob Cross',             nationality: 'England',        iso2: 'gb-eng', pdcRanking: 21, seedNumber: 21, odds: '51.0' },
      { name: 'Damon Heta',            nationality: 'Australia',      iso2: 'au',     pdcRanking: 22, seedNumber: 22, odds: '101.0' },
      { name: 'Dirk van Duijvenbode',  nationality: 'Nederland',      iso2: 'nl',     pdcRanking: 23, seedNumber: 23, odds: '101.0' },
      { name: 'Mike De Decker',        nationality: 'Belgia',         iso2: 'be',     pdcRanking: 24, seedNumber: 24, odds: '101.0' },
      { name: 'Ryan Joyce',            nationality: 'England',        iso2: 'gb-eng', pdcRanking: 25, seedNumber: 25, odds: '151.0' },
      { name: 'Cameron Menzies',       nationality: 'Skottland',      iso2: 'gb-sct', pdcRanking: 26, seedNumber: 26, odds: '151.0' },
      { name: 'Andrew Gilding',        nationality: 'England',        iso2: 'gb-eng', pdcRanking: 27, seedNumber: 27, odds: '151.0' },
      { name: 'Kevin Doets',           nationality: 'Nederland',      iso2: 'nl',     pdcRanking: 28, seedNumber: 28, odds: '151.0' },
      { name: 'Daryl Gurney',          nationality: 'Nord-Irland',    iso2: 'gb-nir', pdcRanking: 29, seedNumber: 29, odds: '151.0' },
      { name: 'Dave Chisnall',         nationality: 'England',        iso2: 'gb-eng', pdcRanking: 30, seedNumber: 30, odds: '201.0' },
      { name: 'Joe Cullen',            nationality: 'England',        iso2: 'gb-eng', pdcRanking: 31, seedNumber: 31, odds: '151.0' },
      { name: 'Ritchie Edhouse',       nationality: 'England',        iso2: 'gb-eng', pdcRanking: 32, seedNumber: 32, odds: '201.0' },
    ],
  },
  {
    potNumber: 4,
    name: '🔥 Kvalifiserte',
    emoji: '🔥',
    players: [
      { name: 'Ryan Meikle',        nationality: 'England',     iso2: 'gb-eng', pdcRanking: 33, seedNumber: null, odds: '251.0' },
      { name: 'Callan Rydz',        nationality: 'England',     iso2: 'gb-eng', pdcRanking: 34, seedNumber: null, odds: '251.0' },
      { name: 'Ricardo Pietreczko', nationality: 'Tyskland',    iso2: 'de',     pdcRanking: 35, seedNumber: null, odds: '251.0' },
      { name: 'Niels Zonneveld',    nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 36, seedNumber: null, odds: '251.0' },
      { name: 'Ian White',         nationality: 'England',     iso2: 'gb-eng', pdcRanking: 37, seedNumber: null, odds: '301.0' },
      { name: 'Mensur Suljović',    nationality: 'Østerrike',   iso2: 'at',     pdcRanking: 38, seedNumber: null, odds: '301.0' },
      { name: 'Vincent van der Voort', nationality: 'Nederland', iso2: 'nl',    pdcRanking: 39, seedNumber: null, odds: '301.0' },
      { name: 'Kim Huybrechts',     nationality: 'Belgia',      iso2: 'be',     pdcRanking: 40, seedNumber: null, odds: '301.0' },
      { name: 'Brendan Dolan',      nationality: 'Nord-Irland', iso2: 'gb-nir', pdcRanking: 41, seedNumber: null, odds: '301.0' },
      { name: 'Keane Barry',        nationality: 'Irland',      iso2: 'ie',     pdcRanking: 42, seedNumber: null, odds: '301.0' },
      { name: 'Connor Scutt',       nationality: 'England',     iso2: 'gb-eng', pdcRanking: 43, seedNumber: null, odds: '351.0' },
      { name: 'William Borland',    nationality: 'Skottland',   iso2: 'gb-sct', pdcRanking: 44, seedNumber: null, odds: '351.0' },
      { name: 'Alan Soutar',        nationality: 'Skottland',   iso2: 'gb-sct', pdcRanking: 45, seedNumber: null, odds: '351.0' },
      { name: 'Scott Williams',     nationality: 'Wales',       iso2: 'gb-wls', pdcRanking: 46, seedNumber: null, odds: '351.0' },
      { name: 'Adam Hunt',          nationality: 'England',     iso2: 'gb-eng', pdcRanking: 47, seedNumber: null, odds: '351.0' },
      { name: "William O'Connor",   nationality: 'Irland',      iso2: 'ie',     pdcRanking: 48, seedNumber: null, odds: '351.0' },
    ],
  },
  {
    potNumber: 5,
    name: '🎲 Wildcards',
    emoji: '🎲',
    players: [
      { name: 'Steve Beaton',      nationality: 'England',     iso2: 'gb-eng', pdcRanking: 49, seedNumber: null, odds: '501.0' },
      { name: 'Jeffrey de Zwaan',  nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 50, seedNumber: null, odds: '501.0' },
      { name: 'Madars Razma',      nationality: 'Latvia',      iso2: 'lv',     pdcRanking: 51, seedNumber: null, odds: '501.0' },
      { name: 'Robert Owen',       nationality: 'Wales',       iso2: 'gb-wls', pdcRanking: 52, seedNumber: null, odds: '501.0' },
      { name: 'Jim Williams',      nationality: 'Wales',       iso2: 'gb-wls', pdcRanking: 53, seedNumber: null, odds: '501.0' },
      { name: 'Jason Lowe',        nationality: 'England',     iso2: 'gb-eng', pdcRanking: 54, seedNumber: null, odds: '501.0' },
      { name: 'Ryan Murray',       nationality: 'Skottland',   iso2: 'gb-sct', pdcRanking: 55, seedNumber: null, odds: '501.0' },
      { name: 'Chris Landman',     nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 56, seedNumber: null, odds: '751.0' },
      { name: 'Danny van Trijp',   nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 57, seedNumber: null, odds: '751.0' },
      { name: 'Jamie Hughes',      nationality: 'England',     iso2: 'gb-eng', pdcRanking: 58, seedNumber: null, odds: '751.0' },
      { name: 'Niko Springer',     nationality: 'Tyskland',    iso2: 'de',     pdcRanking: 59, seedNumber: null, odds: '751.0' },
      { name: 'Florian Hempel',    nationality: 'Tyskland',    iso2: 'de',     pdcRanking: 60, seedNumber: null, odds: '751.0' },
      { name: 'Boris Krčmar',      nationality: 'Kroatia',     iso2: 'hr',     pdcRanking: 61, seedNumber: null, odds: '1001.0' },
      { name: 'Gabriel Clemens',   nationality: 'Tyskland',    iso2: 'de',     pdcRanking: 62, seedNumber: null, odds: '751.0' },
      { name: 'Owen Bates',        nationality: 'England',     iso2: 'gb-eng', pdcRanking: 63, seedNumber: null, odds: '1001.0' },
      { name: 'Nathan Girvan',     nationality: 'Nord-Irland', iso2: 'gb-nir', pdcRanking: 64, seedNumber: null, odds: '1001.0' },
    ],
  },
]

/** Slår opp iso2-kode (for flagcdn.com) fra spillernavn. Returnerer '' ved ukjent spiller. */
export function getIso2(playerName: string): string {
  for (const pot of POTS) {
    const player = pot.players.find(p => p.name === playerName)
    if (player) return player.iso2
  }
  return ''
}
