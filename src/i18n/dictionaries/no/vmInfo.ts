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
  rulesTab: {
    inShort: string
    bullets: string[]
    prizeTitle: string
    prizeSteps: { label: string; value: string }[]
    photoCredit: { summary: string; intro: string }
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
    empty: 'Ingen kamper registrert ennå — resultatene fylles ut etter hvert som de legges inn.',
    notPlayed: 'Ikke spilt',
    notDecided: 'Ikke avgjort',
  },
  rulesTab: {
    inShort: 'Kort fortalt',
    bullets: [
      'Du velger én spiller fra hver av 4 potter',
      'Pottene er satt etter vinnerodds: de 4 største favorittene, de neste 4, deretter 6, og resten av feltet',
      'Vinner en av spillerne dine turneringen, deler du premien med alle andre som har valgt samme spiller',
      'Har ingen valgt vinneren, går premien til dem som har spilleren som kom lengst',
      'Du kan ikke bytte spillere etter at turneringen har startet',
    ],
    prizeTitle: 'Slik deles premien',
    prizeSteps: [
      { label: 'Du har turneringsvinneren', value: 'Delt likt med de som har ham' },
      { label: 'Ingen har vinneren', value: 'Finalisten' },
      { label: 'Heller ingen har finalisten', value: 'Semifinalistene' },
      { label: 'Og så videre', value: 'Kvartfinalistene …' },
    ],
    photoCredit: {
      summary: 'Fotokreditering',
      intro: 'Spillerfotoene er hentet fra Wikimedia Commons under Creative Commons-lisenser og beskåret/frilagt for kortene. Fotograf og lisens per bilde:',
    },
  },
}
