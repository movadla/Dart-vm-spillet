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
  appDescription: 'Velg 6 dartspillere. Følg dem gjennom dart-VM. Vinn potten.',
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
    labelUntilStart: 'VM starter om',
    labelUntilFirstPoints: 'Første poeng deles ut om',
  },
  lastUpdated: 'Oppdatert {time}',
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
