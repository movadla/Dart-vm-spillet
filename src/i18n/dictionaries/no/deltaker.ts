import type { Stage } from '@/config/scoring'

export interface DeltakerDict {
  page: {
    backLeague: string
    backLeaderboard: string
    myPage: string
    totalPoints: string
    rank: string
    startsIn: string
    editTeam: string
    myTeamHeader: string
    vmDecidedPrefix: string
    vmDecided: string
    vmInStagePrefix: string
    allMatches: string
    nextMatchesHeader: string
    leaguesHeader: string
    vmGuide: string
    shareText: (rank: number, total: number) => string
    shareTextClosed: string
    shareLabel: string
  }
  myTeam: {
    noPlayers: string
    finalist: string
    outIn: (stage: string) => string
    onTo: (stage: string) => string
    notPlayedYet: string
    noMatchesYet: string
    won: string
    lost: string
    matchSummary: (sets: number, wins: number, wonTournament: boolean, multiplier: number) => string
    playerInfo: string
    allMatches: string
    nextPlayer: string
  }
  nextMatches: {
    none: string
  }
  demoBanner: {
    badge: string
    tabsAriaLabel: string
    phases: { for: string; live: string; ferdig: string }
  }
  pointsDelta: {
    sinceYesterday: string
  }
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
  page: {
    backLeague: '← Ligaen',
    backLeaderboard: '← Leaderboard',
    myPage: 'Min side',
    totalPoints: 'Totalpoeng',
    rank: 'Plassering',
    startsIn: 'VM starter om',
    editTeam: 'Endre laget →',
    myTeamHeader: 'Mitt lag',
    vmDecidedPrefix: 'VM er',
    vmDecided: 'avgjort',
    vmInStagePrefix: 'VM er i',
    allMatches: 'Alle kamper →',
    nextMatchesHeader: 'Neste kamper',
    leaguesHeader: 'Ligaer',
    vmGuide: 'VM-guide →',
    shareText: (rank, total) => `Jeg er #${rank} av ${total} i Dart-VM-spillet!`,
    shareTextClosed: 'Bli med i Dart-VM-spillet – velg seks dartspillere og følg dem gjennom VM!',
    shareLabel: 'Del →',
  },
  myTeam: {
    noPlayers: 'Ingen spillere registrert ennå.',
    finalist: 'Finalist',
    outIn: (stage) => `Ute i ${stage}`,
    onTo: (stage) => `Videre til ${stage}`,
    notPlayedYet: 'Ikke spilt ennå',
    noMatchesYet: 'Ingen kamper spilt ennå.',
    won: 'over',
    lost: 'mot',
    matchSummary: (sets, wins, wonTournament, multiplier) =>
      `${sets} sett · ${wins} ${wins === 1 ? 'seier' : 'seire'}${wonTournament ? ' · VM-seier' : ''}${multiplier > 1 ? ` · ×${multiplier}` : ''}`,
    playerInfo: 'Spillerinfo →',
    allMatches: 'Alle kamper →',
    nextPlayer: 'Neste spiller →',
  },
  nextMatches: {
    none: 'Ingen kommende kamper for laget ditt.',
  },
  demoBanner: {
    badge: 'Demo',
    tabsAriaLabel: 'Demo-fase',
    phases: { for: 'Før VM', live: 'Underveis', ferdig: 'Etter finalen' },
  },
  pointsDelta: {
    sinceYesterday: 'siden i går',
  },
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
