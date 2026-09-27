export interface VmInfoDict {
  title: string
  tabsAriaLabel: string
  tabs: { players: string; matches: string; draw: string; rules: string }
  ctaLabel: { yourPage: string; myPage: string; pickPlayers: string }
  playersTab: {
    columnHeaders: { player: string; seed: string; rank: string; odds: string }
    seedLabel: (n: number) => string
    unseeded: string
    pickableCount: (n: number) => string
    others: (n: number) => string
  }
  matchesTab: {
    empty: string
    notPlayed: string
    notDecided: string
  }
  drawTab: {
    disclaimer: { before: string; example: string; after: string }
    selectPlayer: string
    selectPlaceholder: string
    round1: string
    round2: string
    otherSeeded: string
    otherSeededHint: string
    showFullBracket: string
    hideFullBracket: string
    fullBracketLabel: (matches: number, players: number) => string
    matchLabel: (n: number) => string
    winnerMatch1: string
    winnerMatch2: string
  }
  rulesTab: {
    inShort: string
    bullets: string[]
    pointsOverview: string
    perSet: string
    perAdvancement: string
    forWinning: string
    pointsNote: string
    multiplier: string
    multiplierNote: string
    photoCredit: { summary: string; intro: string }
  }
  bracketModal: {
    dialogAriaLabel: (name: string) => string
    title: string
    subtitle: string
    close: string
    pathToFinal: (name: string) => string
    round1Section: string
    section: (n: number) => string
    vs: string
  }
}

export const vmInfo: VmInfoDict = {
  title: 'Turneringsguide',
  tabsAriaLabel: 'Innhold',
  tabs: { players: 'Spillere', matches: 'Kamper', draw: 'Trekning', rules: 'Regler' },
  ctaLabel: { yourPage: 'Din side →', myPage: 'Min side →', pickPlayers: 'Velg spillere →' },
  playersTab: {
    columnHeaders: { player: 'Spiller', seed: 'Seed', rank: 'Rank', odds: 'Odds' },
    seedLabel: (n) => `Seed ${n}`,
    unseeded: 'Useedet',
    pickableCount: (n) => `${n} valgbare`,
    others: (n) => `+${n} andre i feltet (ikke valgbare)`,
  },
  matchesTab: {
    empty: 'Ingen kamper registrert ennå — sluttspilltreet fylles ut etter hvert som resultater legges inn.',
    notPlayed: 'Ikke spilt',
    notDecided: 'Ikke avgjort',
  },
  drawTab: {
    disclaimer: {
      before: 'Dette er en ',
      example: 'eksempel-trekning',
      after: ' — PDC har ikke publisert den faktiske trekningen ennå (kommer normalt medio november). Oppsettet under viser hvordan braketten kunne sett ut, og oppdateres når det ekte oppsettet er kjent.',
    },
    selectPlayer: 'Velg en spiller',
    selectPlaceholder: '— Velg spiller —',
    round1: '1. runde',
    round2: '2. runde',
    otherSeeded: 'Andre seedede spillere i samme del av braketten',
    otherSeededHint: 'Dette er spillere du potensielt kan møte senere i turneringen dersom begge går langt.',
    showFullBracket: 'Vis hele bracketen →',
    hideFullBracket: 'Skjul hele bracketen',
    fullBracketLabel: (matches, players) => `Runde 1 — hele feltet (${matches} kamper, ${players} spillere)`,
    matchLabel: (n) => `Kamp ${n}`,
    winnerMatch1: 'Vinner kamp 1',
    winnerMatch2: 'Vinner kamp 2',
  },
  rulesTab: {
    inShort: 'Kort fortalt',
    bullets: [
      'Du velger én spiller fra hver av 6 potter',
      'Pottene er basert på PDC-ranking og vinnerodds',
      'Valgene kan endres frem til turneringen starter',
      'Du får poeng for hvert sett spilleren din vinner og for hver kampseier — pluss bonus om han vinner hele turneringen',
    ],
    pointsOverview: 'Poengoversikt',
    perSet: 'Per vunnet sett',
    perAdvancement: 'Per kampseier (avansement)',
    forWinning: 'For å vinne hele turneringen',
    pointsNote: 'Alt legges sammen fortløpende gjennom turneringen, og summen ganges med pott-multiplikatoren.',
    multiplier: 'Multiplikator',
    multiplierNote: 'Poeng for spillere fra disse pottene ganges med faktoren — outsidere gir størst gevinst.',
    photoCredit: {
      summary: 'Fotokreditering',
      intro: 'Spillerfotoene er hentet fra Wikimedia Commons under Creative Commons-lisenser og beskåret/frilagt for kortene. Fotograf og lisens per bilde:',
    },
  },
  bracketModal: {
    dialogAriaLabel: (name) => `Trekning for ${name}`,
    title: 'Trekningen',
    subtitle: 'Eksempel-trekning – byttes ut når PDC publiserer den ekte (medio november)',
    close: 'Lukk',
    pathToFinal: (name) => `Potensiell vei til finalen for ${name}`,
    round1Section: 'Runde 1 – din seksjon',
    section: (n) => `Seksjon ${n}`,
    vs: 'vs',
  },
}
