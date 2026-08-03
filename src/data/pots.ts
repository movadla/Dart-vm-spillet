export interface Team {
  name: string
  flag: string
  iso2: string
  fifaRanking: number
  vmGroup: string
  odds: string
  wikipedia?: string
}

export interface Pot {
  potNumber: number
  name: string
  emoji: string
  teams: Team[]
}

export const POT_NAMES = [
  '⭐ Stjernene',
  '💪 Gigantene',
  '🏆 Outsiderne',
  '🔥 Jokerne',
  '🌍 Underdogs',
  '🔍 Overraskelsene',
  '⚔️ Langskuddene',
  '🎲 Miraklene',
]

export const POTS: Pot[] = [
  {
    potNumber: 1,
    name: '⭐ Stjernene',
    emoji: '⭐',
    teams: [
      { name: 'Frankrike',         flag: '🇫🇷', iso2: 'fr',     fifaRanking: 1,  vmGroup: 'I', odds: '5.5',    wikipedia: 'https://en.wikipedia.org/wiki/France_national_football_team' },
      { name: 'Spania',            flag: '🇪🇸', iso2: 'es',     fifaRanking: 2,  vmGroup: 'H', odds: '6.0',    wikipedia: 'https://en.wikipedia.org/wiki/Spain_national_football_team' },
      { name: 'England',           flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', iso2: 'gb-eng', fifaRanking: 4,  vmGroup: 'L', odds: '7.5',    wikipedia: 'https://en.wikipedia.org/wiki/England_national_football_team' },
    ],
  },
  {
    potNumber: 2,
    name: '💪 Gigantene',
    emoji: '💪',
    teams: [
      { name: 'Brasil',    flag: '🇧🇷', iso2: 'br', fifaRanking: 6,  vmGroup: 'C', odds: '9.0',  wikipedia: 'https://en.wikipedia.org/wiki/Brazil_national_football_team' },
      { name: 'Argentina', flag: '🇦🇷', iso2: 'ar', fifaRanking: 3,  vmGroup: 'J', odds: '9.5',  wikipedia: 'https://en.wikipedia.org/wiki/Argentina_national_football_team' },
      { name: 'Portugal',  flag: '🇵🇹', iso2: 'pt', fifaRanking: 5,  vmGroup: 'K', odds: '11.0', wikipedia: 'https://en.wikipedia.org/wiki/Portugal_national_football_team' },
      { name: 'Tyskland',  flag: '🇩🇪', iso2: 'de', fifaRanking: 10, vmGroup: 'E', odds: '15.0', wikipedia: 'https://en.wikipedia.org/wiki/Germany_national_football_team' },
    ],
  },
  {
    potNumber: 3,
    name: '🏆 Outsiderne',
    emoji: '🏆',
    teams: [
      { name: 'Nederland', flag: '🇳🇱', iso2: 'nl', fifaRanking: 8,  vmGroup: 'F', odds: '21.0', wikipedia: 'https://en.wikipedia.org/wiki/Netherlands_national_football_team' },
      { name: 'Norge',     flag: '🇳🇴', iso2: 'no', fifaRanking: 37, vmGroup: 'I', odds: '26.0', wikipedia: 'https://en.wikipedia.org/wiki/Norway_national_football_team' },
      { name: 'Belgia',    flag: '🇧🇪', iso2: 'be', fifaRanking: 9,  vmGroup: 'G', odds: '34.0', wikipedia: 'https://en.wikipedia.org/wiki/Belgium_national_football_team' },
      { name: 'USA',       flag: '🇺🇸', iso2: 'us', fifaRanking: 16, vmGroup: 'D', odds: '41.0', wikipedia: 'https://en.wikipedia.org/wiki/United_States_men%27s_national_soccer_team' },
      { name: 'Colombia',  flag: '🇨🇴', iso2: 'co', fifaRanking: 13, vmGroup: 'K', odds: '41.0', wikipedia: 'https://en.wikipedia.org/wiki/Colombia_national_football_team' },
    ],
  },
  {
    potNumber: 4,
    name: '🔥 Jokerne',
    emoji: '🔥',
    teams: [
      { name: 'Uruguay', flag: '🇺🇾', iso2: 'uy', fifaRanking: 17, vmGroup: 'H', odds: '51.0', wikipedia: 'https://en.wikipedia.org/wiki/Uruguay_national_football_team' },
      { name: 'Marokko', flag: '🇲🇦', iso2: 'ma', fifaRanking: 7,  vmGroup: 'C', odds: '51.0', wikipedia: 'https://en.wikipedia.org/wiki/Morocco_national_football_team' },
      { name: 'Japan',   flag: '🇯🇵', iso2: 'jp', fifaRanking: 18, vmGroup: 'F', odds: '51.0', wikipedia: 'https://en.wikipedia.org/wiki/Japan_national_football_team' },
      { name: 'Mexico',  flag: '🇲🇽', iso2: 'mx', fifaRanking: 15, vmGroup: 'A', odds: '76.0', wikipedia: 'https://en.wikipedia.org/wiki/Mexico_national_football_team' },
      { name: 'Sverige', flag: '🇸🇪', iso2: 'se', fifaRanking: 23, vmGroup: 'F', odds: '76.0', wikipedia: 'https://en.wikipedia.org/wiki/Sweden_national_football_team' },
      { name: 'Kroatia', flag: '🇭🇷', iso2: 'hr', fifaRanking: 11, vmGroup: 'L', odds: '81.0', wikipedia: 'https://en.wikipedia.org/wiki/Croatia_national_football_team' },
    ],
  },
  {
    potNumber: 5,
    name: '🌍 Underdogs',
    emoji: '🌍',
    teams: [
      { name: 'Sveits',    flag: '🇨🇭', iso2: 'ch', fifaRanking: 19, vmGroup: 'B', odds: '81.0',  wikipedia: 'https://en.wikipedia.org/wiki/Switzerland_national_football_team' },
      { name: 'Ecuador',   flag: '🇪🇨', iso2: 'ec', fifaRanking: 23, vmGroup: 'E', odds: '91.0',  wikipedia: 'https://en.wikipedia.org/wiki/Ecuador_national_football_team' },
      { name: 'Senegal',   flag: '🇸🇳', iso2: 'sn', fifaRanking: 14, vmGroup: 'I', odds: '101.0', wikipedia: 'https://en.wikipedia.org/wiki/Senegal_national_football_team' },
      { name: 'Tyrkia',    flag: '🇹🇷', iso2: 'tr', fifaRanking: 22, vmGroup: 'D', odds: '101.0', wikipedia: 'https://en.wikipedia.org/wiki/Turkey_national_football_team' },
      { name: 'Østerrike', flag: '🇦🇹', iso2: 'at', fifaRanking: 24, vmGroup: 'J', odds: '101.0', wikipedia: 'https://en.wikipedia.org/wiki/Austria_national_football_team' },
      { name: 'Canada',    flag: '🇨🇦', iso2: 'ca', fifaRanking: 30, vmGroup: 'B', odds: '151.0', wikipedia: 'https://en.wikipedia.org/wiki/Canada_men%27s_national_soccer_team' },
      { name: 'Paraguay',  flag: '🇵🇾', iso2: 'py', fifaRanking: 40, vmGroup: 'D', odds: '151.0', wikipedia: 'https://en.wikipedia.org/wiki/Paraguay_national_football_team' },
    ],
  },
  {
    potNumber: 6,
    name: '🔍 Overraskelsene',
    emoji: '🔍',
    teams: [
      { name: 'Algerie',          flag: '🇩🇿', iso2: 'dz',     fifaRanking: 26, vmGroup: 'J', odds: '201.0', wikipedia: 'https://en.wikipedia.org/wiki/Algeria_national_football_team' },
      { name: 'Tsjekkia',         flag: '🇨🇿', iso2: 'cz',     fifaRanking: 41, vmGroup: 'A', odds: '201.0', wikipedia: 'https://en.wikipedia.org/wiki/Czech_Republic_national_football_team' },
      { name: 'Elfenbenskysten',  flag: '🇨🇮', iso2: 'ci',     fifaRanking: 34, vmGroup: 'E', odds: '201.0', wikipedia: 'https://en.wikipedia.org/wiki/Ivory_Coast_national_football_team' },
      { name: 'Sør-Korea',        flag: '🇰🇷', iso2: 'kr',     fifaRanking: 25, vmGroup: 'A', odds: '251.0', wikipedia: 'https://en.wikipedia.org/wiki/South_Korea_national_football_team' },
      { name: 'Egypt',            flag: '🇪🇬', iso2: 'eg',     fifaRanking: 29, vmGroup: 'G', odds: '251.0', wikipedia: 'https://en.wikipedia.org/wiki/Egypt_national_football_team' },
      { name: 'Skottland',        flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', iso2: 'gb-sct', fifaRanking: 36, vmGroup: 'C', odds: '251.0', wikipedia: 'https://en.wikipedia.org/wiki/Scotland_national_football_team' },
      { name: 'Ghana',            flag: '🇬🇭', iso2: 'gh',     fifaRanking: 74, vmGroup: 'L', odds: '251.0', wikipedia: 'https://en.wikipedia.org/wiki/Ghana_national_football_team' },
    ],
  },
  {
    potNumber: 7,
    name: '⚔️ Langskuddene',
    emoji: '⚔️',
    teams: [
      { name: 'Bosnia-Hercegovina', flag: '🇧🇦', iso2: 'ba', fifaRanking: 41, vmGroup: 'B', odds: '251.0',  wikipedia: 'https://en.wikipedia.org/wiki/Bosnia_and_Herzegovina_national_football_team' },
      { name: 'Iran',               flag: '🇮🇷', iso2: 'ir', fifaRanking: 21, vmGroup: 'G', odds: '501.0',  wikipedia: 'https://en.wikipedia.org/wiki/Iran_national_football_team' },
      { name: 'Australia',          flag: '🇦🇺', iso2: 'au', fifaRanking: 27, vmGroup: 'D', odds: '501.0',  wikipedia: 'https://en.wikipedia.org/wiki/Australia_national_football_team' },
      { name: 'Tunisia',            flag: '🇹🇳', iso2: 'tn', fifaRanking: 44, vmGroup: 'F', odds: '501.0',  wikipedia: 'https://en.wikipedia.org/wiki/Tunisia_national_football_team' },
      { name: 'Congo DR',           flag: '🇨🇩', iso2: 'cd', fifaRanking: 48, vmGroup: 'K', odds: '751.0',  wikipedia: 'https://en.wikipedia.org/wiki/DR_Congo_national_football_team' },
      { name: 'Saudi-Arabia',       flag: '🇸🇦', iso2: 'sa', fifaRanking: 61, vmGroup: 'H', odds: '1001.0', wikipedia: 'https://en.wikipedia.org/wiki/Saudi_Arabia_national_football_team' },
      { name: 'New Zealand',        flag: '🇳🇿', iso2: 'nz', fifaRanking: 85, vmGroup: 'G', odds: '1001.0', wikipedia: 'https://en.wikipedia.org/wiki/New_Zealand_national_football_team' },
      { name: 'Qatar',              flag: '🇶🇦', iso2: 'qa', fifaRanking: 55, vmGroup: 'B', odds: '1001.0', wikipedia: 'https://en.wikipedia.org/wiki/Qatar_national_football_team' },
    ],
  },
  {
    potNumber: 8,
    name: '🎲 Miraklene',
    emoji: '🎲',
    teams: [
      { name: 'Irak',       flag: '🇮🇶', iso2: 'iq', fifaRanking: 34, vmGroup: 'I', odds: '1001.0', wikipedia: 'https://en.wikipedia.org/wiki/Iraq_national_football_team' },
      { name: 'Jordan',     flag: '🇯🇴', iso2: 'jo', fifaRanking: 39, vmGroup: 'J', odds: '1001.0', wikipedia: 'https://en.wikipedia.org/wiki/Jordan_national_football_team' },
      { name: 'Kapp Verde', flag: '🇨🇻', iso2: 'cv', fifaRanking: 42, vmGroup: 'H', odds: '1001.0', wikipedia: 'https://en.wikipedia.org/wiki/Cape_Verde_national_football_team' },
      { name: 'Usbekistan', flag: '🇺🇿', iso2: 'uz', fifaRanking: 46, vmGroup: 'K', odds: '1001.0', wikipedia: 'https://en.wikipedia.org/wiki/Uzbekistan_national_football_team' },
      { name: 'Panama',     flag: '🇵🇦', iso2: 'pa', fifaRanking: 33, vmGroup: 'L', odds: '1001.0', wikipedia: 'https://en.wikipedia.org/wiki/Panama_national_football_team' },
      { name: 'Sør-Afrika', flag: '🇿🇦', iso2: 'za', fifaRanking: 43, vmGroup: 'A', odds: '1001.0', wikipedia: 'https://en.wikipedia.org/wiki/South_Africa_national_football_team' },
      { name: 'Curaçao',   flag: '🇨🇼', iso2: 'cw', fifaRanking: 44, vmGroup: 'E', odds: '2501.0', wikipedia: 'https://en.wikipedia.org/wiki/Cura%C3%A7ao_national_football_team' },
      { name: 'Haiti',      flag: '🇭🇹', iso2: 'ht', fifaRanking: 45, vmGroup: 'C', odds: '2501.0', wikipedia: 'https://en.wikipedia.org/wiki/Haiti_national_football_team' },
    ],
  },
]

/** Slår opp iso2-kode (for flagcdn.com) fra lagnavn. Returnerer '' ved ukjent lag. */
export function getIso2(teamName: string): string {
  for (const pot of POTS) {
    const team = pot.teams.find(t => t.name === teamName)
    if (team) return team.iso2
  }
  return ''
}
