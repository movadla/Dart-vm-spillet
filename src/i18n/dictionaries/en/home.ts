import type { HomeDict } from '../no/home'

export const home = {
  miniDashboard: {
    points: 'Points',
    rank: 'Rank',
    ofTotal: (total) => `of ${total}`,
  },
  miniLeaderboard: {
    seeAll: (total) => `See all ${total} →`,
  },
  stickyHeader: {
    brand: 'DART-VM',
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
    getStarted: 'Get started →',
    alreadySignedUp: 'Already signed up? Find your page →',
    scrollHint: 'More info',
    tagline: 'Pick 6 dart players. Follow them through the tournament.',
  },
  howItWorks: {
    eyebrow: 'How it works',
    title: 'The 6 pots',
    subtitle: 'Pick 6 players – one from each tier',
    cards: [
      { title: 'Pick 6 players', desc: 'Pick one dart player from each of the 6 tiers' },
      { title: 'Points as you go', desc: 'Advancing in the knockout stage earns points for each of your players' },
      { title: 'Play against friends', desc: 'Start private leagues and compare yourself with others on the leaderboard' },
    ],
    pointsDesc: (perSet, perAdvancement) => `${perSet} per set won, ${perAdvancement} per match win in the knockout stage — for each of your players`,
  },
  footer: {
    myPage: 'My page',
    join: 'Sign up',
    infoAndRules: 'Info and rules',
    privacy: 'Privacy',
  },
} satisfies HomeDict
