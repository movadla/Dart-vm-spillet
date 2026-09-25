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
}

export const errors: ErrorsDict = {
  finn: {
    invalidEmail: 'Ugyldig e-post',
    dbNotSetUp: 'Databasen er ikke satt opp ennå',
    tooManyAttempts: 'For mange forsøk. Vent en time og prøv igjen.',
    notFound: 'Fant ingen deltaker med den e-posten',
  },
}
