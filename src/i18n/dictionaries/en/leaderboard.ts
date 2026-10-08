import type { LeaderboardDict } from '../no/leaderboard'

export const leaderboard = {
  demoBadge: 'Demo',
  empty: {
    title: 'No participants yet',
    body: 'The leaderboard fills up once the first matches have been played.',
  },
  prize: {
    leading: (stage, n) => `${n} ${n === 1 ? 'participant leads' : 'participants share the lead'} — best pick: ${stage.toLowerCase()}`,
    final: (n) => (n === 1 ? 'The prize goes to 1 participant' : `The prize is shared by ${n} participants`),
    rollover: 'Nobody has a player who made it out of the group stage — the prize rolls over.',
  },
  countdown: {
    starts: (date) => `The tournament starts ${date}.`,
    participants: (n) => `${n} ${n === 1 ? 'participant has' : 'participants have'} signed up so far.`,
    beFirst: 'Be the first to sign up.',
    joinCta: 'Sign up →',
  },
} satisfies LeaderboardDict
