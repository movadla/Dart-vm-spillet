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
// MIDLERTIDIG (2026-09-27): kampresultatene under er bygget for PDC World
// Grand Prix 2026-oppsettet (32 spillere, 5 runder — se bracketProjection.ts
// og pots.ts), ikke det vanlige 128-spiller-VM-oppsettet. Siden HELE
// World Grand Prix-feltet er kjent og navngitt, er det ingen
// "Kvalifisert spiller N"-plasseringsspillere her i det hele tatt.

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

// Deltakerne — «demo» er den du logger inn som. Lagene er satt sammen av
// spillere som faktisk er valgbare i pottene (én per pott), så Min side,
// spillerpanelet og brikkene får foto/statistikk på samme måte som for
// ekte deltakere.
// MIDLERTIDIG (2026-09-27): pott-plasseringene under er oppdatert til å
// matche src/data/pots.ts sin nye odds-baserte inndeling (2/3/3/3/3/18 —
// se pots.ts sin toppkommentar). Selve kampresultatene (R1_RESULTS osv.
// under) er UENDRET — de følger den ekte, bekreftede runde 1-trekningen i
// bracketProjection.ts, som er uavhengig av hvilken pott en spiller ligger i.
export const DEMO_PARTICIPANTS: DemoParticipant[] = [
  { id: 'demo', name: 'Ola Dartmann', email: DEMO_EMAIL, created_at: '2026-09-12T18:04:00Z',
    picks: team('Luke Littler', 'Gerwyn Price', 'Gary Anderson', 'Nathan Aspinall', 'Rob Cross', 'Cameron Menzies') },
  { id: 'demo-2', name: 'Kari Bull', email: 'kari@example.com', created_at: '2026-09-10T09:12:00Z',
    picks: team('Luke Humphries', 'James Wade', 'Michael van Gerwen', 'Wessel Nijman', 'Stephen Bunting', 'Dirk van Duijvenbode') },
  { id: 'demo-3', name: 'Jonas Treble', email: 'jonas@example.com', created_at: '2026-09-11T20:40:00Z',
    picks: team('Luke Littler', 'Gian van Veen', 'Ross Smith', 'Jonny Clayton', 'Chris Dobey', 'Jermaine Wattimena') },
  { id: 'demo-4', name: 'Silje Oche', email: 'silje@example.com', created_at: '2026-09-13T07:55:00Z',
    picks: team('Luke Humphries', 'Gerwyn Price', 'Gary Anderson', 'Nathan Aspinall', 'Rob Cross', 'Dave Chisnall') },
  { id: 'demo-5', name: 'Henrik Tops', email: 'henrik@example.com', created_at: '2026-09-14T12:30:00Z',
    picks: team('Luke Littler', 'James Wade', 'Michael van Gerwen', 'Wessel Nijman', 'Stephen Bunting', 'Kevin Doets') },
  { id: 'demo-6', name: 'Maren Bullseye', email: 'maren@example.com', created_at: '2026-09-15T15:15:00Z',
    picks: team('Luke Humphries', 'Gian van Veen', 'Ross Smith', 'Jonny Clayton', 'Chris Dobey', 'Jermaine Wattimena') },
  { id: 'demo-7', name: 'Petter Ton-80', email: 'petter@example.com', created_at: '2026-09-16T08:00:00Z',
    picks: team('Luke Littler', 'Gerwyn Price', 'Michael van Gerwen', 'Wessel Nijman', 'Rob Cross', 'Andrew Gilding') },
  { id: 'demo-8', name: 'Ida Checkout', email: 'ida@example.com', created_at: '2026-09-17T19:20:00Z',
    picks: team('Luke Humphries', 'James Wade', 'Gary Anderson', 'Nathan Aspinall', 'Stephen Bunting', "William O'Connor") },
  { id: 'demo-9', name: 'Anders Flight', email: 'anders@example.com', created_at: '2026-09-18T10:10:00Z',
    picks: team('Luke Littler', 'Gian van Veen', 'Ross Smith', 'Jonny Clayton', 'Chris Dobey', 'Ryan Joyce') },
  { id: 'demo-10', name: 'Nora Dobbel', email: 'nora@example.com', created_at: '2026-09-19T21:45:00Z',
    picks: team('Luke Humphries', 'Gerwyn Price', 'Michael van Gerwen', 'Wessel Nijman', 'Rob Cross', 'Niels Zonneveld') },
  { id: 'demo-11', name: 'Lars Leg', email: 'lars@example.com', created_at: '2026-09-20T14:05:00Z',
    picks: team('Luke Littler', 'James Wade', 'Gary Anderson', 'Nathan Aspinall', 'Stephen Bunting', 'Krzysztof Ratajski') },
  { id: 'demo-12', name: 'Emma Nine-Darter', email: 'emma@example.com', created_at: '2026-09-21T16:35:00Z',
    picks: team('Luke Humphries', 'Gian van Veen', 'Ross Smith', 'Jonny Clayton', 'Chris Dobey', 'Niko Springer') },
]

export const DEMO_LEAGUES: DemoLeague[] = [
  { id: 'demo-league-1', name: 'Kontorlaget', invite_code: 'DEMO01', created_by: 'demo',
    members: ['demo', 'demo-2', 'demo-3', 'demo-4', 'demo-5', 'demo-6', 'demo-7', 'demo-8'] },
  { id: 'demo-league-2', name: 'Familien Dartmann', invite_code: 'DEMO02', created_by: 'demo-4',
    members: ['demo', 'demo-4', 'demo-9', 'demo-10'] },
]

// Kampresultater per fase — hele 32-spiller-braketten til World Grand Prix
// (16 runde 1-kamper, ingen walkover: alle 32, også de seedede, spiller
// runde 1 — se bracketProjection.ts sin R1_MATCHES for selve trekningen,
// som denne simuleringen er bygget fra slik at «neste kamp»-projeksjonen kan
// slå opp ekte, avgjorte motstandere helt ut braketten). Sett-tallene følger
// World Grand Prix sitt faktiske format (double-in/double-out): runde 1 er
// best of 3 sett, runde 2/kvartfinale best of 5, semifinale best of 9,
// finale best of 11.
//
// «live» = turneringen er midt i 2. runde: halvparten av runde 2-kampene er
// spilt. «ferdig» = full turnering — Luke Humphries snur en 2-2 (sett) i
// semifinalen og vinner finalen 6–4 over storfavoritt Luke Littler.
function m(stage: string, player1: string, sets1: number, player2: string, sets2: number): MatchResult {
  return { stage, player1, player2, sets1, sets2, winner: sets1 > sets2 ? player1 : player2 }
}

const R1_RESULTS: MatchResult[] = [
  m('r1', 'Luke Littler', 2, 'Luke Woodhouse', 0),
  m('r1', 'Nathan Aspinall', 2, 'Kevin Doets', 1),
  m('r1', 'Danny Noppert', 2, 'Niko Springer', 0),
  m('r1', 'Michael van Gerwen', 2, 'Ryan Joyce', 1),
  m('r1', 'Gerwyn Price', 2, 'Sebastian Białecki', 0),
  m('r1', 'Ross Smith', 2, 'Cameron Menzies', 1),
  m('r1', 'Jonny Clayton', 2, 'Krzysztof Ratajski', 0),
  m('r1', 'Wessel Nijman', 2, 'Rob Cross', 1),
  m('r1', 'Luke Humphries', 2, 'Dave Chisnall', 0),
  m('r1', 'Jermaine Wattimena', 2, 'Chris Dobey', 1),
  m('r1', 'Josh Rock', 2, 'Niels Zonneveld', 0),
  m('r1', 'Gary Anderson', 2, 'Damon Heta', 1),
  m('r1', 'Gian van Veen', 2, 'Dirk van Duijvenbode', 0),
  m('r1', 'Ryan Searle', 2, "William O'Connor", 1),
  m('r1', 'James Wade', 2, 'Joe Cullen', 0),
  m('r1', 'Stephen Bunting', 2, 'Andrew Gilding', 1),
]

const R2_LIVE: MatchResult[] = [
  m('r2', 'Luke Littler', 3, 'Nathan Aspinall', 1),
  m('r2', 'Michael van Gerwen', 3, 'Danny Noppert', 2),
  m('r2', 'Gerwyn Price', 3, 'Ross Smith', 1),
  m('r2', 'Wessel Nijman', 3, 'Jonny Clayton', 2),
]
const R2_REST: MatchResult[] = [
  m('r2', 'Luke Humphries', 3, 'Jermaine Wattimena', 0),
  m('r2', 'Josh Rock', 3, 'Gary Anderson', 2),
  m('r2', 'Gian van Veen', 3, 'Ryan Searle', 1),
  m('r2', 'Stephen Bunting', 2, 'James Wade', 3),
]
const QF_RESULTS: MatchResult[] = [
  m('qf', 'Luke Littler', 3, 'Michael van Gerwen', 2),
  m('qf', 'Gerwyn Price', 3, 'Wessel Nijman', 1),
  m('qf', 'Luke Humphries', 3, 'Josh Rock', 2),
  m('qf', 'Gian van Veen', 3, 'James Wade', 0),
]
const SF_RESULTS: MatchResult[] = [
  m('sf', 'Luke Littler', 5, 'Gerwyn Price', 3),
  m('sf', 'Luke Humphries', 5, 'Gian van Veen', 4),
]
const FINAL_RESULT: MatchResult[] = [
  m('final', 'Luke Humphries', 6, 'Luke Littler', 4),
]

const LIVE_MATCHES: MatchResult[] = [...R1_RESULTS, ...R2_LIVE]

const FINISHED_MATCHES: MatchResult[] = [
  ...R1_RESULTS, ...R2_LIVE, ...R2_REST,
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
