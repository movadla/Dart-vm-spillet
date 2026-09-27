export interface TippDict {
  metaTitle: string
  closed: {
    title1: string
    title2: string
    body: string
    leaderboardCta: string
  }
  loginLink: {
    verifying: string
    back: string
    title1: string
    title2: string
    title3: string
    intro: string
    tokenErrorSuffix: string
    emailLabel: string
    emailPlaceholder: string
    submitIdle: string
    submitSending: string
    sent: { title: string; checkInboxBefore: string; checkInboxAfter: string; validFor: string }
    genericError: string
    invalidLink: string
  }
  confirmation: {
    heading1: string
    heading2: string
    yourPicks: string
    whatsNext: string
    startsOn: (when: string) => string
    canChangeUntilStart: string
    inviteText: string
    inviteLabel: string
    seeMyPage: string
    backToStart: string
  }
  registration: {
    back: string
    lastStep: string
    title1: string
    title2: string
    intro: string
    nameLabel: string
    namePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    notFoundError: string
    genericError: string
    findingPage: string
    goToMyPage: string
    submitFillIn: string
    submitSaving: string
    submitIdle: string
    consentBefore: string
    consentLink: string
    consentAfter: string
  }
  summary: {
    rulesAndPoints: string
    confirmChanges: string
    heading: string
    allPickedAriaLabel: string
    notSelected: string
    change: string
    changeAriaLabel: (n: number) => string
    submitSaving: string
    submitSaveChanges: string
    submitContinue: string
    back: string
  }
  step: {
    multiplierWords: { double: string; triple: string; quadruple: string }
    multiplierNote: (word: string) => string
    scoreInfo: {
      title: string
      perSet: string
      perAdvancement: string
      forWinning: string
      potLabel: (from: number, to?: number) => string
      tieBreak: string
    }
    chooseAriaLabel: (potName: string, row?: number) => string
    avgLabel: string
    details: string
    next: string
    seeSummary: string
    choosePlayer: string
    back: string
  }
  progressDots: {
    stepAriaLabelDone: (n: number, name: string) => string
    stepAriaLabelPending: (n: number) => string
    stepOf: (step: number, total: number) => string
    guide: string
    points: string
  }
  stepSlideshow: {
    tablistAriaLabel: string
    slideAriaLabel: (n: number) => string
    back: string
    next: string
    ctaLabel: string
    skip: string
    intro: {
      title: string
      subtitle: string
      skipHint: string
    }
    example: {
      title: string
      subtitle: string
      exampleLabel: string
      vs: string
      setsUnit: string
      win: string
      setsWon: string
      total: string
    }
    progress: {
      title: string
      leagues: string
      rank: (n: number) => string
      rivals: string[]
    }
  }
}

export const tipp: TippDict = {
  metaTitle: 'Velg spillere',
  closed: {
    title1: 'Påmelding',
    title2: 'stengt',
    body: 'Turneringen er i gang. Påmelding og endring av picks er ikke lenger mulig.',
    leaderboardCta: 'Se leaderboard →',
  },
  loginLink: {
    verifying: 'Verifiserer lenke…',
    back: '← Tilbake',
    title1: 'Endre',
    title2: 'dine',
    title3: 'valg',
    intro: 'Vi sender en innloggingslenke til e-posten din. Klikk lenken for å endre valgene dine.',
    tokenErrorSuffix: '— Send en ny lenke under.',
    emailLabel: 'Din e-postadresse',
    emailPlaceholder: 'din@epost.no',
    submitIdle: 'Send innloggingslenke →',
    submitSending: 'Sender…',
    sent: {
      title: 'Lenke er sendt!',
      checkInboxBefore: 'Sjekk innboksen til',
      checkInboxAfter: '.',
      validFor: 'Lenken er gyldig i 1 time.',
    },
    genericError: 'Noe gikk galt',
    invalidLink: 'Ugyldig lenke',
  },
  confirmation: {
    heading1: 'Du er',
    heading2: 'påmeldt!',
    yourPicks: 'Dine valg',
    whatsNext: 'Hva skjer nå?',
    startsOn: (when) => `Turneringen starter ${when}`,
    canChangeUntilStart: 'Du kan endre valg frem til turneringen begynner',
    inviteText: 'Jeg er påmeldt Dart-VM-spillet — bli med du også!',
    inviteLabel: 'Inviter venner →',
    seeMyPage: 'Se min side →',
    backToStart: '← Tilbake til start',
  },
  registration: {
    back: '← Tilbake',
    lastStep: 'Siste steg',
    title1: 'Registrer ',
    title2: 'deg',
    intro: 'E-posten brukes til å finne siden din igjen.',
    nameLabel: 'Navn',
    namePlaceholder: 'Ola Nordmann',
    emailLabel: 'E-post',
    emailPlaceholder: 'ola@example.com',
    notFoundError: 'Fant ikke siden din. Ta kontakt.',
    genericError: 'Noe gikk galt',
    findingPage: 'Leter...',
    goToMyPage: 'Gå til min side →',
    submitFillIn: 'Fyll inn navn og e-post',
    submitSaving: 'Lagrer…',
    submitIdle: 'Meld meg på →',
    consentBefore: 'Ved å melde deg på godtar du at vi lagrer navn og e-post for å drive spillet. Se',
    consentLink: 'personvernsiden',
    consentAfter: 'for detaljer.',
  },
  summary: {
    rulesAndPoints: 'Regler og poeng →',
    confirmChanges: 'Bekreft endringer',
    heading: 'Oppsummering',
    allPickedAriaLabel: 'Alle seks spillere er valgt',
    notSelected: 'Ikke valgt',
    change: 'Endre',
    changeAriaLabel: (n) => `Endre valg for nivå ${n}`,
    submitSaving: 'Lagrer…',
    submitSaveChanges: 'Lagre endringer →',
    submitContinue: 'Fortsett til registrering →',
    back: '← Tilbake',
  },
  step: {
    multiplierWords: { double: 'Dobbelt', triple: 'Trippelt', quadruple: 'Firedobbelt' },
    multiplierNote: (word) => `${word} poeng i denne potten`,
    scoreInfo: {
      title: 'Poeng',
      perSet: 'Per vunnet sett',
      perAdvancement: 'Per kampseier (avansement)',
      forWinning: 'For å vinne turneringen',
      potLabel: (from, to) => (to != null ? `Pott ${from}–${to}` : `Pott ${from}`),
      tieBreak: 'Ved lik poengsum vinner den som meldte seg på tidligst.',
    },
    chooseAriaLabel: (potName, row) => `Velg spiller fra ${potName}${row != null ? `, rad ${row}` : ''}`,
    avgLabel: 'Snitt',
    details: 'Detaljer →',
    next: 'Neste →',
    seeSummary: 'Se oppsummering →',
    choosePlayer: 'Velg en spiller',
    back: '← Tilbake',
  },
  progressDots: {
    stepAriaLabelDone: (n, name) => `Gå til steg ${n} (${name})`,
    stepAriaLabelPending: (n) => `Steg ${n}`,
    stepOf: (step, total) => `STEG ${step} AV ${total}`,
    guide: 'Guide',
    points: 'Poeng',
  },
  stepSlideshow: {
    tablistAriaLabel: 'Steg i introduksjonen',
    slideAriaLabel: (n) => `Slide ${n} av 3`,
    back: 'Tilbake',
    next: 'Neste →',
    ctaLabel: 'VELG SPILLERE →',
    skip: 'Hopp over',
    intro: {
      title: 'Slik fungerer det',
      subtitle: 'Velg 6 spillere – én fra hvert nivå',
      skipHint: 'Trykk på laget for å spole fram',
    },
    example: {
      title: 'Følg spillerne gjennom turneringen',
      subtitle: 'Du får poeng for hver seier og hvert sett',
      exampleLabel: 'Eksempel',
      vs: 'VS',
      setsUnit: 'sett',
      win: 'Seier',
      setsWon: 'Sett vunnet',
      total: 'Totalt',
    },
    progress: {
      title: 'Følg utviklingen på «Min side»',
      leagues: 'Opprett eller delta i egne ligaer',
      rank: (n) => `${n}. plass`,
      rivals: ['Team 180', 'Bullseye-gjengen', 'Triple 20', 'Dartmestrene', 'Oche-banden', 'Nine-darter', 'Kasteskjeva', 'Tungvekterne', 'Bakerste bord'],
    },
  },
}
