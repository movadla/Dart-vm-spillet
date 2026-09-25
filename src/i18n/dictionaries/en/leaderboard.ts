import type { LeaderboardDict } from '../no/leaderboard'

export const leaderboard = {
  demoBadge: 'Demo',
  empty: {
    title: 'No participants yet',
    body: 'The leaderboard fills up once the first points are awarded.',
  },
  countdown: {
    starts: (date) => `The World Championship starts ${date}.`,
    participants: (n) => `${n} ${n === 1 ? 'participant has' : 'participants have'} signed up so far.`,
    beFirst: 'Be the first to sign up.',
    joinCta: 'Sign up →',
  },
} satisfies LeaderboardDict
