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
  rankList: {
    you: string
    rankUp: (n: number) => string
    rankDown: (n: number) => string
    rankUnchanged: string
    allEliminated: string
    remaining: (left: number, total: number) => string
    showMore: (shown: number, total: number) => string
  }
}

export const common: CommonDict = {
  appName: 'Dart-VM-spillet',
  appDescription: 'Velg 6 dartspillere. Følg dem gjennom turneringen. Vinn potten.',
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
    labelUntilFirstPoints: 'Første poeng deles ut om',
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
    level: (n) => `Nivå ${n}`,
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
  rankList: {
    you: 'deg',
    rankUp: (n) => `opp ${n}`,
    rankDown: (n) => `ned ${n}`,
    rankUnchanged: 'uendret',
    allEliminated: 'alle ute',
    remaining: (left, total) => `${left} av ${total} igjen`,
    showMore: (shown, total) => `Vis flere (${shown} av ${total}) →`,
  },
}
