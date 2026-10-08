import type { CommonDict } from '../no/common'

export const common = {
  appName: 'Grand Slam-Spillet',
  appDescription: 'Pick 4 dart players. Follow them through the tournament. Hit the winner and share the prize.',
  nav: {
    home: '← Home',
    myPage: '← My page',
    myPageShort: 'My page',
  },
  loading: 'Loading...',
  networkError: 'Network error — try again',
  localeSwitch: {
    switchToNo: 'Bytt til norsk',
    switchToEn: 'Switch to English',
  },
  countdown: {
    days: 'days',
    hours: 'hrs',
    minutes: 'min',
    labelUntilStart: 'The tournament starts in',
    labelUntilFirstPoints: 'First results arrive in',
  },
  lastUpdated: 'Updated {time}',
  share: {
    defaultLabel: 'Share with friends',
    copied: '✓ Copied',
  },
  copyCode: {
    pressToCopy: 'Tap to copy',
  },
  teamTile: {
    level: (n) => `Pot ${n}`,
  },
  playerCard: {
    rank: 'RANK',
    odds: 'ODDS',
    avg: 'AVG',
    ariaLabel: (name, rank, odds) => `${name} – ranking ${rank}, odds ${odds}`,
  },
  yourTeam: 'Your team',
  skipToFinishedTeam: 'Skip ahead to the finished team',
  qualifiedFillerLabel: 'Qualifier',
  deadline: { label: (when) => `Sign-up deadline: ${when}`, short: (when) => `Deadline ${when}`, noChanges: 'After the deadline you cannot change your picks.' },
  bottomNav: { aria: 'Main menu', home: 'Home', mine: 'My page', board: 'Leaderboard', guide: 'Guide' },
  rankList: {
    you: 'you',
    rankUp: (n) => `up ${n}`,
    rankDown: (n) => `down ${n}`,
    rankUnchanged: 'unchanged',
    allEliminated: 'all out',
    champion: 'Champion',
    notPlayed: '–',
    groupParticipants: (n) => (n === 1 ? '1 participant' : `${n} participants`),
    sharesLead: 'share the lead',
    leads: 'leads',
    notPlayedYet: 'Not played yet',
    remaining: (left, total) => `${left} of ${total} left`,
    showMore: (shown, total) => `Show more (${shown} of ${total}) →`,
  },
} satisfies CommonDict
