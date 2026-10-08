import type { VmInfoDict } from '../no/vmInfo'

export const vmInfo = {
  title: 'Tournament Guide',
  tabsAriaLabel: 'Content',
  tabs: { players: 'Players', matches: 'Matches', draw: 'Draw', rules: 'Rules' },
  ctaLabel: { yourPage: 'Your page →', myPage: 'My page →', pickPlayers: 'Pick players →' },
  playersTab: {
    columnHeaders: { player: 'Player', seed: 'Seed', rank: 'Rank', odds: 'Odds' },
    seedLabel: (n) => `Seed ${n}`,
    unseeded: 'Unseeded',
    pickableCount: (n) => `${n} pickable`,
    others: (n) => `+${n} others in the field (not pickable)`,
  },
  matchesTab: {
    empty: 'No matches recorded yet — results fill in as they come in.',
    notPlayed: 'Not played',
    notDecided: 'Not decided',
  },
  rulesTab: {
    inShort: 'In short',
    bullets: [
      'You pick one player from each of 4 pots',
      'The pots are set by winner odds: the 4 biggest favourites, the next 4, then 6, and the rest of the field',
      'If one of your players wins the tournament, you share the prize with everyone else who picked the same player',
      'If nobody picked the winner, the prize goes to those who have the player who got furthest',
      'You cannot swap players once the tournament has started',
    ],
    prizeTitle: 'How the prize is shared',
    prizeSteps: [
      { label: 'You have the tournament winner', value: 'Shared equally with the others who have him' },
      { label: 'Nobody has the winner', value: 'The finalist' },
      { label: 'Nobody has the finalist either', value: 'The semi-finalists' },
      { label: 'And so on', value: 'The quarter-finalists …' },
    ],
    photoCredit: {
      summary: 'Photo credits',
      intro: 'The player photos are sourced from Wikimedia Commons under Creative Commons licenses and cropped/cut out for the cards. Photographer and license per image:',
    },
  },
} satisfies VmInfoDict
