export interface LeaderboardDict {
  demoBadge: string
  empty: { title: string; body: string }
  /** Premie-linjen øverst: hvem som leder/deler akkurat nå. */
  prize: {
    leading: (stage: string, n: number) => string
    final: (n: number) => string
    rollover: string
  }
  countdown: {
    starts: (date: string) => string
    participants: (n: number) => string
    beFirst: string
    joinCta: string
  }
}

export const leaderboard: LeaderboardDict = {
  demoBadge: 'Demo',
  empty: {
    title: 'Ingen deltakere ennå',
    body: 'Leaderboardet fylles når de første kampene er spilt.',
  },
  prize: {
    leading: (stage, n) => `${n} ${n === 1 ? 'deltaker leder' : 'deltakere deler ledelsen'} — beste valg: ${stage.toLowerCase()}`,
    final: (n) => (n === 1 ? 'Premien går til 1 deltaker' : `Premien deles av ${n} deltakere`),
    rollover: 'Ingen har en spiller som kom videre fra gruppespillet — premien overføres.',
  },
  countdown: {
    starts: (date) => `Turneringen starter ${date}.`,
    participants: (n) => `${n} ${n === 1 ? 'deltaker er' : 'deltakere er'} påmeldt så langt.`,
    beFirst: 'Bli den første som melder seg på.',
    joinCta: 'Meld deg på →',
  },
}
