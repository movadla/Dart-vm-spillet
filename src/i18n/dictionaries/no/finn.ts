export interface FinnDict {
  eyebrow: string
  title: { prefix: string; highlight: string }
  intro: string
  emailLabel: string
  notFound: { title: string; closedBody: string; openBodyBefore: string; openBodyLink: string }
  genericError: string
  submit: { loading: string; idle: string }
  notSignedUpBefore: string
  notSignedUpLink: string
  demoHint: (email: string) => string
}

export const finn: FinnDict = {
  eyebrow: 'Allerede påmeldt?',
  title: { prefix: 'Finn', highlight: 'min side' },
  intro: 'Skriv inn e-posten du registrerte deg med, så finner vi laget ditt.',
  emailLabel: 'E-post',
  notFound: {
    title: 'Fant ingen deltaker med denne e-posten',
    closedBody: 'Sjekk stavemåten og prøv igjen. Påmeldingen er stengt.',
    openBodyBefore: 'Sjekk stavemåten, eller',
    openBodyLink: 'meld deg på her',
  },
  genericError: 'Noe gikk galt. Prøv igjen.',
  submit: { loading: 'Søker …', idle: 'Finn min side →' },
  notSignedUpBefore: 'Ikke påmeldt ennå?',
  notSignedUpLink: 'Velg laget ditt →',
  demoHint: (email) => `Prøv demo-deltakeren (${email}) →`,
}
