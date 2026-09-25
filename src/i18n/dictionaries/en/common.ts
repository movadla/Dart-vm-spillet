import type { CommonDict } from '../no/common'

export const common = {
  appName: 'Dart-VM-spillet',
  appDescription: 'Pick 6 dart players. Follow them through the World Championship. Win the pot.',
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
