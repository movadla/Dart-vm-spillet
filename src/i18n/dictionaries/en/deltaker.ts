import type { DeltakerDict } from '../no/deltaker'

export const deltaker = {
  playerDetailPanel: {
    dialogAriaLabel: (name) => `About ${name}`,
    close: 'Close',
    seedLabel: (n) => `Seed ${n}`,
    unseeded: 'Unseeded',
    matches: 'Matches',
    nextMatch: 'Next match',
    outOfTournament: 'Out of the tournament',
    notDecided: 'Not decided',
    exampleTag: 'example',
    exampleDataTag: 'example data',
    previousMatches: 'Previous matches',
    stats: 'Stats',
    worldRanking: 'World ranking',
    avg: 'Avg',
    info: 'Info',
    bestAchievement: 'Best achievement',
    pathToFinal: 'Path to the final',
    noTop16: 'No top 16 before the final',
    seeFullDraw: 'See the full draw →',
    photo: 'Photo',
    shortStage: { r1: 'Round 1', r2: 'Round 2', r3: 'Round 3', r4: 'Round 4', qf: 'QF', sf: 'SF', final: 'Final' },
  },
} satisfies DeltakerDict
