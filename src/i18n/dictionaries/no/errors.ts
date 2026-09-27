// Feilstrenger returnert direkte fra ikke-admin API-ruter til klienten (som
// oftest viser data.error rått). Statuskoden er alltid den stabile, språk-
// uavhengige signalet klientkode skal grene på (f.eks. 404 = ikke funnet) —
// aldri innholdet i selve feilstrengen, som endres med språket.
export interface ErrorsDict {
  finn: {
    invalidEmail: string
    dbNotSetUp: string
    tooManyAttempts: string
    notFound: string
  }
  newsletter: {
    invalidEmail: string
    dbNotSetUp: string
    tooManyAttempts: string
  }
  tipp: {
    closed: string
    tooManyAttempts: string
    invalidName: string
    invalidEmail: string
    missingPicks: string
    mustPickAll: (n: number) => string
    missingPickForPot: (n: number) => string
    invalidPlayerForPot: (n: number) => string
    full: string
    duplicateEmail: string
    couldNotSaveParticipant: string
    couldNotSavePicks: string
    internalError: string
  }
  tippUpdate: {
    locked: string
    notLoggedIn: string
    tooManyAttempts: string
    missingData: string
    tooManyPicks: string
    invalidPot: (pot: string) => string
    invalidPlayerForPot: (pot: number, player: string) => string
    participantNotFound: string
    couldNotSavePicks: string
    couldNotCleanupPicks: string
  }
  magicLink: {
    missingParticipantId: string
    tooManyAttempts: string
    participantNotFound: string
    emailMismatch: string
    emailNotConfigured: string
    couldNotSend: string
  }
  magicLinkVerify: {
    missingData: string
    invalidLink: string
    alreadyUsed: string
    expired: string
  }
  leagueCreate: {
    locked: string
    notLoggedIn: string
    missingData: string
    participantNotFound: string
    couldNotCreate: string
  }
  leagueJoin: {
    locked: string
    notLoggedIn: string
    missingData: string
    tooManyAttempts: string
    participantNotFound: string
    invalidCode: string
    full: string
  }
  leagueKick: {
    notLoggedIn: string
    missingData: string
    notFound: string
    notAllowed: string
    cannotKickSelf: string
  }
  leagueByCode: {
    notFound: string
  }
  participantEditData: {
    notAuthenticated: string
    notFound: string
  }
}

export const errors: ErrorsDict = {
  finn: {
    invalidEmail: 'Ugyldig e-post',
    dbNotSetUp: 'Databasen er ikke satt opp ennå',
    tooManyAttempts: 'For mange forsøk. Vent en time og prøv igjen.',
    notFound: 'Fant ingen deltaker med den e-posten',
  },
  newsletter: {
    invalidEmail: 'Ugyldig e-post',
    dbNotSetUp: 'Databasen er ikke satt opp ennå',
    tooManyAttempts: 'For mange forsøk. Prøv igjen senere.',
  },
  tipp: {
    closed: 'Påmelding er stengt',
    tooManyAttempts: 'For mange påmeldinger fra dette nettet. Prøv igjen om en time.',
    invalidName: 'Ugyldig navn',
    invalidEmail: 'Ugyldig e-post',
    missingPicks: 'Mangler picks',
    mustPickAll: (n) => `Du må velge én spiller fra alle ${n} potter`,
    missingPickForPot: (n) => `Mangler valg fra pot ${n}`,
    invalidPlayerForPot: (n) => `Ugyldig spiller i pot ${n}`,
    full: 'Påmeldingen er dessverre full',
    duplicateEmail: 'E-postadressen er allerede registrert',
    couldNotSaveParticipant: 'Kunne ikke lagre deltaker',
    couldNotSavePicks: 'Kunne ikke lagre picks',
    internalError: 'Intern serverfeil',
  },
  tippUpdate: {
    locked: 'Turneringen er i gang — picks er låst',
    notLoggedIn: 'Ikke innlogget — be om en ny innloggingslenke',
    tooManyAttempts: 'For mange lagringer. Vent litt og prøv igjen.',
    missingData: 'Mangler data',
    tooManyPicks: 'For mange picks',
    invalidPot: (pot) => `Ugyldig pot: ${pot}`,
    invalidPlayerForPot: (pot, player) => `Ugyldig spiller for pot ${pot}: ${player}`,
    participantNotFound: 'Fant ikke deltaker',
    couldNotSavePicks: 'Kunne ikke lagre picks',
    couldNotCleanupPicks: 'Kunne ikke rydde opp gamle picks',
  },
  magicLink: {
    missingParticipantId: 'Mangler participantId',
    tooManyAttempts: 'For mange forsøk. Vent en time og prøv igjen.',
    participantNotFound: 'Deltaker ikke funnet',
    emailMismatch: 'E-postadressen stemmer ikke',
    emailNotConfigured: 'E-postutsending er ikke konfigurert',
    couldNotSend: 'Kunne ikke sende e-post. Prøv igjen.',
  },
  magicLinkVerify: {
    missingData: 'Mangler data',
    invalidLink: 'Ugyldig lenke',
    alreadyUsed: 'Lenken er allerede brukt',
    expired: 'Lenken har utløpt',
  },
  leagueCreate: {
    locked: 'Ligaer er låst etter at turneringen har startet.',
    notLoggedIn: 'Ikke innlogget — be om en ny innloggingslenke',
    missingData: 'Mangler data',
    participantNotFound: 'Fant ikke deltaker',
    couldNotCreate: 'Kunne ikke opprette liga',
  },
  leagueJoin: {
    locked: 'Ligaer er låst etter at turneringen har startet.',
    notLoggedIn: 'Ikke innlogget — be om en ny innloggingslenke',
    missingData: 'Mangler data',
    tooManyAttempts: 'For mange forsøk. Vent en time og prøv igjen.',
    participantNotFound: 'Fant ikke deltaker',
    invalidCode: 'Ugyldig ligakode',
    full: 'Denne ligaen er full',
  },
  leagueKick: {
    notLoggedIn: 'Ikke innlogget — be om en ny innloggingslenke',
    missingData: 'Mangler data',
    notFound: 'Liga ikke funnet',
    notAllowed: 'Ikke tillatt',
    cannotKickSelf: 'Kan ikke kicke deg selv',
  },
  leagueByCode: {
    notFound: 'Liga ikke funnet',
  },
  participantEditData: {
    notAuthenticated: 'Ikke autentisert',
    notFound: 'Ikke funnet',
  },
}
