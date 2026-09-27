export interface LigaDict {
  metaFallback: string
  sectionLabel: string
  participants: (n: number) => string
  inviteCode: { label: string }
  hidden: { title: string; body: string }
  empty: { title: string; bodyBefore: string; bodyAfter: string }
  pointsComingWhenStarts: (date: string) => string
  rankChip: { ofTotal: (total: number) => string }
  kick: {
    button: string
    confirm: (name: string) => string
    sessionExpired: string
    fallbackError: string
    genericError: string
  }
  shareLeague: {
    label: string
    ariaLabel: (name: string) => string
    inviteText: (name: string, code: string) => string
  }
  section: {
    heading: string
    newLeagueViewCta: string
    newLeagueCreatedCta: string
    codeLabel: string
    wholeLeaderboard: string
    joinBtn: string
    createBtn: string
    lockedAfterStart: string
    genericError: string
    createForm: { heading: string; nameLabel: string; namePlaceholder: string; cancel: string; submitting: string; submit: string }
    joinForm: { heading: string; codeLabel: string; codePlaceholder: string; cancel: string; submitting: string; submit: string }
  }
}

export const liga: LigaDict = {
  metaFallback: 'Liga',
  sectionLabel: 'Liga',
  participants: (n) => `${n} ${n === 1 ? 'deltaker' : 'deltakere'}`,
  inviteCode: { label: 'Ligakode' },
  hidden: {
    title: 'Deltakerlisten er skjult til turneringen starter',
    body: 'Ligaeieren har valgt å holde lagene hemmelige frem til første kamp.',
  },
  empty: {
    title: 'Ingen deltakere ennå',
    bodyBefore: 'Del ligakoden ',
    bodyAfter: ' med venner så de kan bli med.',
  },
  pointsComingWhenStarts: (date) => `Poeng og plassering kommer når turneringen starter ${date}.`,
  rankChip: { ofTotal: (total) => `av ${total}` },
  kick: {
    button: 'Kick',
    confirm: (name) => `Fjerne ${name} fra ligaen?`,
    sessionExpired: 'Økten din er utløpt — gå til «Min side» og be om en ny innloggingslenke.',
    fallbackError: 'Kunne ikke fjerne medlemmet',
    genericError: 'Noe gikk galt',
  },
  shareLeague: {
    label: 'Inviter',
    ariaLabel: (name) => `Del ligaen ${name}`,
    inviteText: (name, code) => `Bli med i ${name}! Kode: ${code}`,
  },
  section: {
    heading: 'Ligaer',
    newLeagueViewCta: 'Se ligaen →',
    newLeagueCreatedCta: 'Opprettet · Se ligaen for kode →',
    codeLabel: 'Kode:',
    wholeLeaderboard: 'Hele leaderboardet',
    joinBtn: 'Bli med i liga',
    createBtn: 'Opprett liga',
    lockedAfterStart: 'Ligaene er låst etter at turneringen har startet.',
    genericError: 'Noe gikk galt',
    createForm: {
      heading: 'Opprett liga',
      nameLabel: 'Liganavn',
      namePlaceholder: 'F.eks. Kontorlaget',
      cancel: 'Avbryt',
      submitting: 'Oppretter …',
      submit: 'Opprett liga →',
    },
    joinForm: {
      heading: 'Bli med i liga',
      codeLabel: 'Ligakode (6 tegn)',
      codePlaceholder: 'WOLF42',
      cancel: 'Avbryt',
      submitting: 'Sjekker …',
      submit: 'Bli med →',
    },
  },
}
