export interface CommonDict {
  appName: string
  appDescription: string
  nav: {
    home: string
    myPage: string
    myPageShort: string
  }
  loading: string
  networkError: string
  localeSwitch: {
    switchToNo: string
    switchToEn: string
  }
  countdown: {
    days: string
    hours: string
    minutes: string
    labelUntilStart: string
    labelUntilFirstPoints: string
  }
  lastUpdated: string
  share: {
    defaultLabel: string
    copied: string
  }
  copyCode: {
    pressToCopy: string
  }
  teamTile: {
    level: (n: number) => string
  }
  playerCard: {
    rank: string
    odds: string
    avg: string
    ariaLabel: (name: string, rank: number, odds: string) => string
  }
  yourTeam: string
  skipToFinishedTeam: string
  qualifiedFillerLabel: string
  teamBuild: { pickOne: string; players: (n: number) => string; youPick: (name: string) => string; joins: (name: string) => string; ready: string; hook: string }
  deadline: { label: (when: string) => string; short: (when: string) => string; noChanges: string }
  bottomNav: { aria: string; home: string; mine: string; board: string; guide: string }
  rankList: {
    you: string
    rankUp: (n: number) => string
    rankDown: (n: number) => string
    rankUnchanged: string
    allEliminated: string
    /** Visning av «nivå» i leaderboard-raden: turneringsvinner / ikke spilt ennå. */
    champion: string
    notPlayed: string
    /** Gruppeoverskrift i leaderboardet (alle med samme nivå). */
    groupParticipants: (n: number) => string
    sharesLead: string
    leads: string
    notPlayedYet: string
    remaining: (left: number, total: number) => string
    showMore: (shown: number, total: number) => string
  }
}

export const common: CommonDict = {
  appName: 'Grand Slam-Spillet',
  appDescription: 'Velg 4 dartspillere. Følg dem gjennom turneringen. Treff vinneren og del premien.',
  nav: {
    home: '← Hjem',
    myPage: '← Min side',
    myPageShort: 'Min side',
  },
  loading: 'Laster...',
  networkError: 'Nettverksfeil — prøv igjen',
  localeSwitch: {
    switchToNo: 'Bytt til norsk',
    switchToEn: 'Switch to English',
  },
  countdown: {
    days: 'dager',
    hours: 'timer',
    minutes: 'min',
    labelUntilStart: 'Turneringen starter om',
    labelUntilFirstPoints: 'Første resultater kommer om',
  },
  lastUpdated: 'Oppdatert {time}',
  share: {
    defaultLabel: 'Del med venner',
    copied: '✓ Kopiert',
  },
  copyCode: {
    pressToCopy: 'Trykk for å kopiere',
  },
  teamTile: {
    level: (n) => `Pott ${n}`,
  },
  playerCard: {
    rank: 'RANK',
    odds: 'ODDS',
    avg: 'SNITT',
    ariaLabel: (name, rank, odds) => `${name} – ranking ${rank}, odds ${odds}`,
  },
  yourTeam: 'Laget ditt',
  skipToFinishedTeam: 'Spol fram til ferdig lag',
  qualifiedFillerLabel: 'Kvalifisert',
  teamBuild: {
    pickOne: 'Velg én spiller',
    players: (n) => `${n} spillere`,
    youPick: (name) => `Du velger ${name}`,
    joins: (name) => `${name} går i laget ditt`,
    ready: 'Laget ditt er klart',
    hook: 'Vinner en av dem turneringen, deler du premien',
  },
  deadline: { label: (when) => `Påmeldingsfrist: ${when}`, short: (when) => `Frist ${when}`, noChanges: 'Etter fristen kan du ikke endre valgene.' },
  bottomNav: { aria: 'Hovedmeny', home: 'Hjem', mine: 'Min side', board: 'Leaderboard', guide: 'Guide' },
  rankList: {
    you: 'deg',
    rankUp: (n) => `opp ${n}`,
    rankDown: (n) => `ned ${n}`,
    rankUnchanged: 'uendret',
    allEliminated: 'alle ute',
    champion: 'Mester',
    notPlayed: '–',
    groupParticipants: (n) => (n === 1 ? '1 deltaker' : `${n} deltakere`),
    sharesLead: 'deler ledelsen',
    leads: 'leder',
    notPlayedYet: 'Ikke spilt ennå',
    remaining: (left, total) => `${left} av ${total} igjen`,
    showMore: (shown, total) => `Vis flere (${shown} av ${total}) →`,
  },
}
