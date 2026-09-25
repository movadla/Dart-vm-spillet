import type { Stage } from '@/config/scoring'

export interface DeltakerDict {
  playerDetailPanel: {
    dialogAriaLabel: (name: string) => string
    close: string
    seedLabel: (n: number) => string
    unseeded: string
    matches: string
    nextMatch: string
    outOfTournament: string
    notDecided: string
    exampleTag: string
    exampleDataTag: string
    previousMatches: string
    stats: string
    worldRanking: string
    avg: string
    info: string
    bestAchievement: string
    pathToFinal: string
    noTop16: string
    seeFullDraw: string
    photo: string
    shortStage: Record<Stage, string>
  }
}

export const deltaker: DeltakerDict = {
  playerDetailPanel: {
    dialogAriaLabel: (name) => `Om ${name}`,
    close: 'Lukk',
    seedLabel: (n) => `Seed ${n}`,
    unseeded: 'Useedet',
    matches: 'Kamper',
    nextMatch: 'Neste kamp',
    outOfTournament: 'Ute av turneringen',
    notDecided: 'Ikke avgjort',
    exampleTag: 'eksempel',
    exampleDataTag: 'eksempeldata',
    previousMatches: 'Tidligere kamper',
    stats: 'Statistikk',
    worldRanking: 'Verdensranking',
    avg: 'Snitt',
    info: 'Info',
    bestAchievement: 'Beste prestasjon',
    pathToFinal: 'Vei til finalen',
    noTop16: 'Ingen topp 16 før finalen',
    seeFullDraw: 'Se hele trekningen →',
    photo: 'Foto',
    shortStage: { r1: '1. runde', r2: '2. runde', r3: '3. runde', r4: '4. runde', qf: 'kvart', sf: 'semi', final: 'finale' },
  },
}
