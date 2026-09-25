export interface CommonDict {
  appName: string
  appDescription: string
  nav: {
    home: string
    myPage: string
  }
  loading: string
  networkError: string
  localeSwitch: {
    switchToNo: string
    switchToEn: string
  }
  brandBanner: {
    eyebrow: string
  }
  countdown: {
    days: string
    hours: string
    minutes: string
  }
  lastUpdated: string
}

export const common: CommonDict = {
  appName: 'Dart-VM-spillet',
  appDescription: 'Velg 6 dartspillere. Følg dem gjennom dart-VM. Vinn potten.',
  nav: {
    home: '← Hjem',
    myPage: '← Min side',
  },
  loading: 'Laster...',
  networkError: 'Nettverksfeil — prøv igjen',
  localeSwitch: {
    switchToNo: 'Bytt til norsk',
    switchToEn: 'Switch to English',
  },
  brandBanner: {
    eyebrow: '— PDC World Championship —',
  },
  countdown: {
    days: 'dager',
    hours: 'timer',
    minutes: 'min',
  },
  lastUpdated: 'Oppdatert {time}',
}
