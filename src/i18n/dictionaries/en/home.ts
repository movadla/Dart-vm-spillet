import type { HomeDict } from '../no/home'

export const home = {
  miniLeaderboard: {
    seeAll: (total) => `See all ${total} →`,
  },
  stickyHeader: {
    brand: 'GRAND SLAM',
    info: 'Info',
    leaderboard: 'Leaderboard',
    myPage: 'My page',
    join: 'Join →',
  },
  closedCta: {
    signupClosed: 'Sign-up is closed',
    myPage: 'My page →',
    thanks: 'Thanks! We’ll let you know about the next game.',
    emailPlaceholder: 'you@example.com',
    notifyMe: 'Notify me about the next game',
    sending: '…',
  },
  hero: {
    myPage: 'My page →',
    switchUser: 'Switch user',
    getStarted: 'Sign up →',
    alreadySignedUp: 'Already signed up? Find your page →',
    scrollHint: 'More info',
    tagline: 'Pick 4 players. If one of them wins, you share the prize.',
  },
  howItWorks: {
    eyebrow: 'How it works',
    title: 'The 4 pots',
    subtitle: 'Pick 4 players – one from each pot',
    cards: [
      { title: 'Pick 4 players', desc: 'Pick one dart player from each of the 4 pots — no darts knowledge needed' },
      { title: 'Hit the winner', desc: 'If one of your players wins the tournament, you share the prize with everyone who picked the same player' },
      { title: 'Play against friends', desc: 'Start private leagues and compare yourself with others on the leaderboard' },
    ],
  },
  footer: {
    myPage: 'My page',
    join: 'Sign up',
    infoAndRules: 'Info and rules',
    privacy: 'Privacy',
  },
} satisfies HomeDict
