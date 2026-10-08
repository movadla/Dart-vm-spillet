// Demo-verden: én fiktiv deltaker («Ola Dartmann») pluss et lite felt av
// andre fiktive deltakere, ligaer og kampresultater — alt i kode, uten
// database. Formålet er å kunne logge inn og teste «Min side», leaderboard
// og liga-sidene FØR Supabase-skjemaet `dart_vm` er eksponert (se TODO.md),
// og senere for å vise hvordan sidene ser ut i alle tre faser av turneringen.
//
// Demo-verdenen er helt atskilt fra ekte data: den slår inn KUN når
// deltaker-id-en er en demo-id (`demo`, `demo-2`, …) eller liga-koden er en
// demo-kode (`DEMO01`/`DEMO02`), eller — for leaderboardet — når demo-
// cookien (`vm_demo`) er satt fordi den innloggede er demo-deltakeren.
// Ekte deltakere ser aldri demo-data, og demo-deltakeren kan ikke skrive
// noe til databasen.
//
// Fase (`for` = før turneringen, `live` = underveis, `ferdig` = avgjort) velges i
// demo-banneret øverst på Min side og huskes i cookien `vm_demo`.
//
// MIDLERTIDIG (2026-10-08): kampresultatene under er en FORENKLET Grand
// Slam-turnering bygget av plassholder-feltet i src/data/pots.ts: 16
// gruppevinnere (hver slo én motstander — ikke komplette grupper på tre),
// deretter siste 16, kvartfinaler, semifinaler og finale. Formålet er bare å
// vise alle tilstander i brukergrensesnittet, ikke å etterligne et ekte
// gruppespill. Bytt når det ekte feltet og programmet er kjent.

import { POTS, getPickablePlayers } from '@/data/pots'
import type { MatchResult, PickWithPot } from '@/lib/scoring'

export type DemoPhase = 'for' | 'live' | 'ferdig'
export const DEMO_PHASES: { id: DemoPhase; label: string }[] = [
  { id: 'for', label: 'Før start' },
  { id: 'live', label: 'Underveis' },
  { id: 'ferdig', label: 'Etter finalen' },
]
export const DEMO_COOKIE = 'vm_demo'
export const DEMO_ID = 'demo'
export const DEMO_EMAIL = 'demo@dart-vm-spillet.no'

export function isDemoId(id: string | null | undefined): boolean {
  return !!id && (id === DEMO_ID || /^demo-\d+$/.test(id))
}
export function isDemoLeagueCode(code: string | null | undefined): boolean {
  return !!code && /^DEMO\d\d$/i.test(code)
}
export function parseDemoPhase(v: string | null | undefined): DemoPhase | null {
  return v === 'for' || v === 'live' || v === 'ferdig' ? v : null
}

export interface DemoParticipant { id: string; name: string; email: string; created_at: string; picks: PickWithPot[] }
export interface DemoLeague { id: string; name: string; invite_code: string; created_by: string; members: string[] }

function team(...names: string[]): PickWithPot[] {
  return names.map((player_name, i) => ({ pot_number: i + 1, player_name }))
}

// Deltakerne — «demo» er den du logger inn som. Lagene er satt sammen av én
// spiller per pott (4 potter, se src/data/pots.ts), så Min side,
// spillerpanelet og brikkene får foto/statistikk på samme måte som for
// ekte deltakere. Pott-inndelingen følger oddsrekkefølgen i den (foreløpig
// plassholder-)spillerlisten; test-en demoTeamsAreValid() fanger opp hvis
// en spiller havner i feil pott etter at feltet byttes ut.
export const DEMO_PARTICIPANTS: DemoParticipant[] = [
  { id: 'demo', name: 'Ola Dartmann', email: DEMO_EMAIL, created_at: '2026-09-12T18:04:00Z',
    picks: team('Luke Littler', 'Michael van Gerwen', 'Jonny Clayton', 'Damon Heta') },
  { id: 'demo-2', name: 'Kari Bull', email: 'kari@example.com', created_at: '2026-09-10T09:12:00Z',
    picks: team('Luke Humphries', 'James Wade', 'Stephen Bunting', 'Kevin Doets') },
  { id: 'demo-3', name: 'Jonas Treble', email: 'jonas@example.com', created_at: '2026-09-11T20:40:00Z',
    picks: team('Luke Littler', 'Gary Anderson', 'Chris Dobey', 'Ryan Searle') },
  { id: 'demo-4', name: 'Silje Oche', email: 'silje@example.com', created_at: '2026-09-13T07:55:00Z',
    picks: team('Luke Humphries', 'Ross Smith', 'Wessel Nijman', 'Krzysztof Ratajski') },
  { id: 'demo-5', name: 'Henrik Tops', email: 'henrik@example.com', created_at: '2026-09-14T12:30:00Z',
    picks: team('Luke Littler', 'Michael van Gerwen', 'Nathan Aspinall', 'Kevin Doets') },
  { id: 'demo-6', name: 'Maren Bullseye', email: 'maren@example.com', created_at: '2026-09-15T15:15:00Z',
    picks: team('Gian van Veen', 'Gary Anderson', 'Jonny Clayton', 'Damon Heta') },
  { id: 'demo-7', name: 'Petter Ton-80', email: 'petter@example.com', created_at: '2026-09-16T08:00:00Z',
    picks: team('Luke Littler', 'James Wade', 'Chris Dobey', 'Rob Cross') },
  { id: 'demo-8', name: 'Ida Checkout', email: 'ida@example.com', created_at: '2026-09-17T19:20:00Z',
    picks: team('Gerwyn Price', 'Michael van Gerwen', 'Josh Rock', 'Danny Noppert') },
  { id: 'demo-9', name: 'Anders Flight', email: 'anders@example.com', created_at: '2026-09-18T10:10:00Z',
    picks: team('Luke Humphries', 'Ross Smith', 'Nathan Aspinall', 'Krzysztof Ratajski') },
  { id: 'demo-10', name: 'Nora Dobbel', email: 'nora@example.com', created_at: '2026-09-19T21:45:00Z',
    picks: team('Gerwyn Price', 'Gary Anderson', 'Wessel Nijman', 'Dirk van Duijvenbode') },
  { id: 'demo-11', name: 'Lars Leg', email: 'lars@example.com', created_at: '2026-09-20T14:05:00Z',
    picks: team('Luke Littler', 'James Wade', 'Stephen Bunting', 'Luke Woodhouse') },
  { id: 'demo-12', name: 'Emma Nine-Darter', email: 'emma@example.com', created_at: '2026-09-21T16:35:00Z',
    picks: team('Gian van Veen', 'Ross Smith', 'Jonny Clayton', "William O'Connor") },
]

export const DEMO_LEAGUES: DemoLeague[] = [
  { id: 'demo-league-1', name: 'Kontorlaget', invite_code: 'DEMO01', created_by: 'demo',
    members: ['demo', 'demo-2', 'demo-3', 'demo-4', 'demo-5', 'demo-6', 'demo-7', 'demo-8'] },
  { id: 'demo-league-2', name: 'Familien Dartmann', invite_code: 'DEMO02', created_by: 'demo-4',
    members: ['demo', 'demo-4', 'demo-9', 'demo-10'] },
]

// Kampresultater per fase. «live» = gruppespillet er ferdig og halvparten av
// siste 16 er spilt. «ferdig» = full turnering — Luke Humphries slår
// storfavoritt Luke Littler i finalen. Tallene er legs (best av 9 i
// gruppen, lengre kamper utover).
function m(stage: string, player1: string, sets1: number, player2: string, sets2: number): MatchResult {
  return { stage, player1, player2, sets1, sets2, winner: sets1 > sets2 ? player1 : player2 }
}

const GROUP_RESULTS: MatchResult[] = [
  m('group', 'Luke Littler', 5, 'Luke Woodhouse', 1),
  m('group', 'Luke Humphries', 5, 'Dave Chisnall', 2),
  m('group', 'Gerwyn Price', 5, 'Joe Cullen', 3),
  m('group', 'Gian van Veen', 5, 'Cameron Menzies', 0),
  m('group', 'James Wade', 5, 'Kevin Doets', 2),
  m('group', 'Gary Anderson', 5, 'Rob Cross', 3),
  m('group', 'Ross Smith', 5, 'Ryan Joyce', 4),
  m('group', 'Michael van Gerwen', 5, 'Niko Springer', 1),
  m('group', 'Wessel Nijman', 5, 'Niels Zonneveld', 2),
  m('group', 'Jonny Clayton', 5, 'Krzysztof Ratajski', 3),
  m('group', 'Chris Dobey', 5, 'Andrew Gilding', 3),
  m('group', 'Nathan Aspinall', 5, "William O'Connor", 2),
  m('group', 'Josh Rock', 5, 'Sebastian Białecki', 4),
  m('group', 'Stephen Bunting', 5, 'Danny Noppert', 3),
  m('group', 'Damon Heta', 5, 'Jermaine Wattimena', 2),
  m('group', 'Ryan Searle', 5, 'Dirk van Duijvenbode', 1),
]

const R16_LIVE: MatchResult[] = [
  m('r16', 'Luke Littler', 10, 'Ryan Searle', 4),
  m('r16', 'Michael van Gerwen', 10, 'James Wade', 7),
  m('r16', 'Gerwyn Price', 10, 'Wessel Nijman', 5),
  m('r16', 'Jonny Clayton', 10, 'Chris Dobey', 8),
]
const R16_REST: MatchResult[] = [
  m('r16', 'Luke Humphries', 10, 'Stephen Bunting', 3),
  m('r16', 'Josh Rock', 10, 'Gary Anderson', 6),
  m('r16', 'Gian van Veen', 10, 'Ross Smith', 4),
  m('r16', 'Damon Heta', 10, 'Nathan Aspinall', 9),
]
const QF_RESULTS: MatchResult[] = [
  m('qf', 'Luke Littler', 11, 'Michael van Gerwen', 7),
  m('qf', 'Gerwyn Price', 11, 'Jonny Clayton', 5),
  m('qf', 'Luke Humphries', 11, 'Josh Rock', 8),
  m('qf', 'Gian van Veen', 11, 'Damon Heta', 6),
]
const SF_RESULTS: MatchResult[] = [
  m('sf', 'Luke Littler', 15, 'Gerwyn Price', 10),
  m('sf', 'Luke Humphries', 15, 'Gian van Veen', 13),
]
const FINAL_RESULT: MatchResult[] = [
  m('final', 'Luke Humphries', 16, 'Luke Littler', 12),
]

const LIVE_MATCHES: MatchResult[] = [...GROUP_RESULTS, ...R16_LIVE]

const FINISHED_MATCHES: MatchResult[] = [
  ...GROUP_RESULTS, ...R16_LIVE, ...R16_REST,
  ...QF_RESULTS, ...SF_RESULTS, ...FINAL_RESULT,
]

export function getDemoMatches(phase: DemoPhase): MatchResult[] {
  return phase === 'for' ? [] : phase === 'live' ? LIVE_MATCHES : FINISHED_MATCHES
}

export function getDemoParticipant(id: string): DemoParticipant | null {
  return DEMO_PARTICIPANTS.find((p) => p.id === id) ?? null
}

export function getDemoLeague(code: string): DemoLeague | null {
  return DEMO_LEAGUES.find((l) => l.invite_code === code.toUpperCase()) ?? null
}

export function getDemoLeaguesFor(participantId: string): DemoLeague[] {
  return DEMO_LEAGUES.filter((l) => l.members.includes(participantId))
}

/** Sanity-sjekk (brukes i test): alle demo-lag består av valgbare spillere. */
export function demoTeamsAreValid(): boolean {
  return DEMO_PARTICIPANTS.every((p) =>
    p.picks.every((pk) => {
      const pot = POTS.find((pt) => pt.potNumber === pk.pot_number)
      return !!pot && getPickablePlayers(pot).some((pl) => pl.name === pk.player_name)
    }),
  )
}
