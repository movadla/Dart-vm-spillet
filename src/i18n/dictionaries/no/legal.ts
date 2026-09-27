export interface LegalDict {
  error: { title1: string; title2: string; body: string; retry: string; home: string }
  notFound: { metaTitle: string; eyebrow: string; title1: string; title2: string; body: string; home: string }
  ogImage: { brandLine: string; tagline: string }
  privacy: {
    metaTitle: string
    title: string
    back: string
    whatWeStore: { h: string; p: string }
    whatWeUseItFor: { h: string; p: string }
    cookies: {
      h: string
      intro: string
      vmAuth: string
      adminSession: string
      vmDemo: string
      localStorageNote: string
    }
    howLong: { h: string; p: string }
    controller: {
      h: string
      placeholder: string
      complaintBefore: string
      complaintLink: string
      complaintAfter: string
    }
    rights: {
      h: string
      p1: string
      p2Before: string
      email: string
      p2After: string
    }
  }
}

export const legal: LegalDict = {
  error: {
    title1: 'Noe gikk ',
    title2: 'galt',
    body: 'En uventet feil oppstod. Prøv igjen, eller gå tilbake til forsiden.',
    retry: 'Prøv igjen',
    home: 'Til forsiden',
  },
  notFound: {
    metaTitle: 'Siden finnes ikke',
    eyebrow: '404',
    title1: 'Siden ',
    title2: 'finnes ikke',
    body: 'Lenken er ugyldig eller siden har blitt fjernet.',
    home: 'Til forsiden →',
  },
  ogImage: {
    brandLine: 'DART-VM 2026',
    tagline: 'Velg 6 dartspillere. Følg turneringen. Spill mot venner.',
  },
  privacy: {
    metaTitle: 'Personvern',
    title: 'Personvern',
    back: '← Til forsiden',
    whatWeStore: {
      h: 'Hva vi lagrer',
      p: 'Når du melder deg på Dart-VM-spillet lagrer vi navnet ditt, e-postadressen din, eventuelt telefonnummer om du oppgir det, og hvilke dartspillere du har valgt.',
    },
    whatWeUseItFor: {
      h: 'Hva vi bruker det til',
      p: 'E-postadressen brukes til å sende deg en velkomstmelding, daglige statusoppdateringer under turneringen, og en innloggingslenke (gyldig i 1 time) når du ber om å endre valgene dine. Navnet ditt vises på leaderboardet og i eventuelle private ligaer du er med i. Vi selger eller deler aldri opplysningene dine med noen andre.',
    },
    cookies: {
      h: 'Informasjonskapsler (cookies)',
      intro: 'Vi bruker kun strengt nødvendige informasjonskapsler — ingen sporing, annonser eller analyse-cookies, og du trenger derfor ikke samtykke til dem:',
      vmAuth: 'vm_auth — bekrefter hvem du er når du endrer valgene dine eller oppretter/blir med i en liga. Varer i 2 timer.',
      adminSession: 'admin_session — kun for spillets administrator, gir tilgang til å legge inn kampresultater.',
      vmDemo: 'vm_demo — husker hvilken fase du ser demo-deltakeren i (kun relevant om du utforsker demoversjonen av «Min side»).',
      localStorageNote: 'I tillegg lagrer nettleseren din id-en til din egen «Min side» lokalt (localStorage, ikke en cookie) slik at du slipper å logge inn på nytt hver gang — dette sendes aldri til oss og ligger kun i din egen nettleser.',
    },
    howLong: {
      h: 'Hvor lenge',
      p: 'Opplysningene lagres så lenge spillet pågår og en rimelig periode etterpå, med mindre du ber om at de slettes tidligere.',
    },
    controller: {
      h: 'Behandlingsansvarlig',
      placeholder: '[Navn/foretak og adresse — fylles inn før lansering]',
      complaintBefore: 'Du har rett til å klage til en personvern-tilsynsmyndighet hvis du mener behandlingen av opplysningene dine er i strid med regelverket — i Norge til',
      complaintLink: 'Datatilsynet',
      complaintAfter: ', eller til tilsynsmyndigheten i landet du bor i om du er bosatt et annet sted i EU/EØS.',
    },
    rights: {
      h: 'Dine rettigheter',
      p1: 'Du kan når som helst be om å få se hvilke opplysninger vi har lagret om deg, be om at de rettes, eller be om at du slettes helt fra spillet (påmelding, picks og all historikk). Du kan også melde deg av de daglige e-postene når som helst via avmeldingslenken nederst i hver e-post.',
      p2Before: 'Send en e-post til',
      email: 'kontakt@dart-vm-spillet.no',
      p2After: 'for å be om innsyn, retting eller sletting.',
    },
  },
}
