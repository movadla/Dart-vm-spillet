export interface LeaderboardDict {
  demoBadge: string
  empty: { title: string; body: string }
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
    body: 'Leaderboardet fylles når de første poengene deles ut.',
  },
  countdown: {
    starts: (date) => `Dart-VM starter ${date}.`,
    participants: (n) => `${n} ${n === 1 ? 'deltaker er' : 'deltakere er'} påmeldt så langt.`,
    beFirst: 'Bli den første som melder seg på.',
    joinCta: 'Meld deg på →',
  },
}
