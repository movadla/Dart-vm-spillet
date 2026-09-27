export interface HomeDict {
  miniDashboard: { points: string; rank: string; ofTotal: (total: number) => string }
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
    pointsDesc: (perSet: string, perAdvancement: string) => string
  }
  footer: { myPage: string; join: string; infoAndRules: string; privacy: string }
}

export const home: HomeDict = {
  miniDashboard: {
    points: 'Poeng',
    rank: 'Plassering',
    ofTotal: (total) => `av ${total}`,
  },
  miniLeaderboard: {
    seeAll: (total) => `Se alle ${total} →`,
  },
  stickyHeader: {
    brand: 'DART-VM',
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
    getStarted: 'Kom i gang →',
    alreadySignedUp: 'Allerede påmeldt? Finn siden din →',
    scrollHint: 'Mer info',
    tagline: 'Velg 6 dartspillere. Følg dem gjennom turneringen.',
  },
  howItWorks: {
    eyebrow: 'Slik fungerer det',
    title: 'De 6 pottene',
    subtitle: 'Velg 6 spillere – én fra hvert nivå',
    cards: [
      { title: 'Velg 6 spillere', desc: 'Velg én dartspiller fra hvert av de 6 nivåene' },
      { title: 'Poeng underveis', desc: 'Avansement i sluttspillet gir poeng for hver av spillerne dine' },
      { title: 'Spill mot venner', desc: 'Opprett private ligaer og sammenlign deg med andre på leaderboardet' },
    ],
    pointsDesc: (perSet, perAdvancement) => `${perSet} per vunnet sett, ${perAdvancement} per kampseier i sluttspillet — for hver av spillerne dine`,
  },
  footer: {
    myPage: 'Min side',
    join: 'Meld deg på',
    infoAndRules: 'Info og regler',
    privacy: 'Personvern',
  },
}
