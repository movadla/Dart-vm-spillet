export interface HomeDict {
  miniLeaderboard: { seeAll: (total: number) => string }
  stickyHeader: { brand: string; info: string; leaderboard: string; myPage: string; join: string }
  closedCta: {
    signupClosed: string
    myPage: string
    thanks: string
    emailPlaceholder: string
    notifyMe: string
    sending: string
  }
  hero: {
    myPage: string
    switchUser: string
    getStarted: string
    alreadySignedUp: string
    scrollHint: string
    tagline: string
  }
  howItWorks: {
    eyebrow: string
    title: string
    subtitle: string
    cards: { title: string; desc: string }[]
  }
  footer: { myPage: string; join: string; infoAndRules: string; privacy: string }
}

export const home: HomeDict = {
  miniLeaderboard: {
    seeAll: (total) => `Se alle ${total} →`,
  },
  stickyHeader: {
    brand: 'GRAND SLAM',
    info: 'Info',
    leaderboard: 'Leaderboard',
    myPage: 'Min side',
    join: 'Bli med →',
  },
  closedCta: {
    signupClosed: 'Påmelding er stengt',
    myPage: 'Min side →',
    thanks: 'Takk! Vi varsler deg til neste spill.',
    emailPlaceholder: 'din@epost.no',
    notifyMe: 'Varsle meg om neste spill',
    sending: '…',
  },
  hero: {
    myPage: 'Min side →',
    switchUser: 'Bytt bruker',
    getStarted: 'Meld deg på →',
    alreadySignedUp: 'Allerede påmeldt? Finn siden din →',
    scrollHint: 'Mer info',
    tagline: 'Velg 4 spillere. Treffer en av dem vinneren, deler du premien.',
  },
  howItWorks: {
    eyebrow: 'Slik fungerer det',
    title: 'De 4 pottene',
    subtitle: 'Velg 4 spillere – én fra hver pott',
    cards: [
      { title: 'Velg 4 spillere', desc: 'Velg én dartspiller fra hver av de 4 pottene — ingen kunnskap om dart nødvendig' },
      { title: 'Treff vinneren', desc: 'Vinner en av spillerne dine turneringen, deler du premien med alle som har valgt samme spiller' },
      { title: 'Spill mot venner', desc: 'Opprett private ligaer og sammenlign deg med andre på leaderboardet' },
    ],
  },
  footer: {
    myPage: 'Min side',
    join: 'Meld deg på',
    infoAndRules: 'Info og regler',
    privacy: 'Personvern',
  },
}
