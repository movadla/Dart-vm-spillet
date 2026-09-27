import type { CommonDict } from '../no/common'

export const common = {
  appName: 'World Grand Prix-Spillet',
  appDescription: 'Pick 6 dart players. Follow them through the tournament. Win the pot.',
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
    labelUntilStart: 'The Worlds starts in',
    labelUntilFirstPoints: 'First points land in',
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
    level: (n) => `Tier ${n}`,
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
  rankList: {
    you: 'you',
    rankUp: (n) => `up ${n}`,
    rankDown: (n) => `down ${n}`,
    rankUnchanged: 'unchanged',
    allEliminated: 'all out',
    remaining: (left, total) => `${left} of ${total} left`,
    showMore: (shown, total) => `Show more (${shown} of ${total}) →`,
  },
} satisfies CommonDict
