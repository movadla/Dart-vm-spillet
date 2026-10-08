import type { Stage } from '@/config/scoring'

export interface DeltakerDict {
  page: {
    backLeague: string
    backLeaderboard: string
    myPage: string
    bestFinish: string
    /** Du leder (nivå ≥ siste 16) — others = antall ANDRE som deler nivået. */
    prizeLeading: (others: number) => string
    /** Turneringen er avgjort og du har premien. */
    prizeWon: (others: number) => string
    prizeNone: string
    /** Turneringen er avgjort og premien gikk til andre. */
    prizeLost: string
    rank: string
    startsIn: string
    editTeam: string
    myTeamHeader: string
    vmDecidedPrefix: string
    vmDecided: string
    vmInStagePrefix: string
    allMatches: string
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
    notPlayedYet: string
    noMatchesYet: string
    won: string
    lost: string
    playerInfo: string
    allMatches: string
    nextPlayer: string
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
    checkoutPercent: string
    info: string
    bestAchievement: string
    pathToFinal: string
    potentialPathTitle: (name: string) => string
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
    bestFinish: 'Beste valg',
    prizeLeading: (others) => (others === 0 ? 'Du leder alene' : `Du deler ledelsen med ${others} ${others === 1 ? 'annen' : 'andre'}`),
    prizeWon: (others) => (others === 0 ? 'Du vinner hele premien' : `Du deler premien med ${others} ${others === 1 ? 'annen' : 'andre'}`),
    prizeNone: 'Ingen av dine spillere leder ennå',
    prizeLost: 'Premien gikk til andre denne gangen',
    rank: 'Plassering',
    startsIn: 'Turneringen starter om',
    editTeam: 'Endre laget →',
    myTeamHeader: 'Mitt lag',
    vmDecidedPrefix: 'Turneringen er',
    vmDecided: 'avgjort',
    vmInStagePrefix: 'Turneringen er i',
    allMatches: 'Alle kamper →',
    leaguesHeader: 'Ligaer',
    vmGuide: 'Turneringsguide →',
    shareText: (rank, total) => `Jeg er #${rank} av ${total} i World Grand Prix-Spillet!`,
    shareTextClosed: 'Bli med i World Grand Prix-Spillet – velg seks dartspillere og følg dem gjennom turneringen!',
    shareLabel: 'Del →',
  },
  myTeam: {
    noPlayers: 'Ingen spillere registrert ennå.',
    finalist: 'Finalist',
    outIn: (stage) => `Ute i ${stage}`,
    notPlayedYet: 'Ikke spilt ennå',
    noMatchesYet: 'Ingen kamper spilt ennå.',
    won: 'over',
    lost: 'mot',
    playerInfo: 'Spillerinfo →',
    allMatches: 'Alle kamper →',
    nextPlayer: 'Neste spiller →',
  },
  demoBanner: {
    badge: 'Demo',
    tabsAriaLabel: 'Demo-fase',
    phases: { for: 'Før start', live: 'Underveis', ferdig: 'Etter finalen' },
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
    checkoutPercent: 'Checkout-%',
    info: 'Info',
    bestAchievement: 'Beste prestasjon',
    pathToFinal: 'Vei til finalen',
    potentialPathTitle: (name) => `Potensiell vei til finalen for ${name}`,
    noTop16: 'Ingen topp 16 før finalen',
    seeFullDraw: 'Se hele trekningen →',
    photo: 'Foto',
    // Alle syv formene skal være like «tunge» (ett ord + evt. tall) — «4. runde»
    // ved siden av «kvart»/«semi» så synlig ujevnt ut i de tre kolonnene i
    // «vei til finalen» (én lang, to korte).
    shortStage: { group: 'Gruppe', r16: 'Siste 16', qf: 'Kvart', sf: 'Semi', final: 'Finale' },
  },
}
