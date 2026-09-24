// Demo-verden: én fiktiv deltaker («Ola Dartmann») pluss et lite felt av
// andre fiktive deltakere, ligaer og kampresultater — alt i kode, uten
// database. Formålet er å kunne logge inn og teste «Min side», leaderboard
// og liga-sidene FØR Supabase-skjemaet `dart_vm` er eksponert (se TODO.md),
// og senere for å vise hvordan sidene ser ut i alle tre faser av VM.
//
// Demo-verdenen er helt atskilt fra ekte data: den slår inn KUN når
// deltaker-id-en er en demo-id (`demo`, `demo-2`, …) eller liga-koden er en
// demo-kode (`DEMO01`/`DEMO02`), eller — for leaderboardet — når demo-
// cookien (`vm_demo`) er satt fordi den innloggede er demo-deltakeren.
// Ekte deltakere ser aldri demo-data, og demo-deltakeren kan ikke skrive
// noe til databasen.
//
// Fase (`for` = før VM, `live` = underveis, `ferdig` = VM avgjort) velges i
// demo-banneret øverst på Min side og huskes i cookien `vm_demo`.

import { POTS, getPickablePlayers } from '@/data/pots'
import type { MatchResult, PickWithPot } from '@/lib/scoring'

export type DemoPhase = 'for' | 'live' | 'ferdig'
export const DEMO_PHASES: { id: DemoPhase; label: string }[] = [
  { id: 'for', label: 'Før VM' },
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
export const DEMO_PARTICIPANTS: DemoParticipant[] = [
  { id: 'demo', name: 'Ola Dartmann', email: DEMO_EMAIL, created_at: '2026-09-12T18:04:00Z',
    picks: team('Luke Littler', 'Gerwyn Price', 'James Wade', 'Wessel Nijman', 'Ross Smith', 'Luke Woodhouse') },
  { id: 'demo-2', name: 'Kari Bull', email: 'kari@example.com', created_at: '2026-09-10T09:12:00Z',
    picks: team('Luke Humphries', 'Michael van Gerwen', 'Josh Rock', 'Gary Anderson', 'Rob Cross', 'Martin Schindler') },
  { id: 'demo-3', name: 'Jonas Treble', email: 'jonas@example.com', created_at: '2026-09-11T20:40:00Z',
    picks: team('Luke Littler', 'Jonny Clayton', 'Stephen Bunting', 'Ryan Searle', 'Jermaine Wattimena', 'Krzysztof Ratajski') },
  { id: 'demo-4', name: 'Silje Oche', email: 'silje@example.com', created_at: '2026-09-13T07:55:00Z',
    picks: team('Gian van Veen', 'Gerwyn Price', 'James Wade', 'Gary Anderson', 'Ross Smith', 'Luke Woodhouse') },
  { id: 'demo-5', name: 'Henrik Tops', email: 'henrik@example.com', created_at: '2026-09-14T12:30:00Z',
    picks: team('Luke Humphries', 'Michael van Gerwen', 'Josh Rock', 'Wessel Nijman', 'Rob Cross', 'Martin Schindler') },
  { id: 'demo-6', name: 'Maren Bullseye', email: 'maren@example.com', created_at: '2026-09-15T15:15:00Z',
    picks: team('Luke Littler', 'Jonny Clayton', 'Stephen Bunting', 'Ryan Searle', 'Jermaine Wattimena', 'Krzysztof Ratajski') },
  { id: 'demo-7', name: 'Petter Ton-80', email: 'petter@example.com', created_at: '2026-09-16T08:00:00Z',
    picks: team('Gian van Veen', 'Gerwyn Price', 'Stephen Bunting', 'Wessel Nijman', 'Rob Cross', 'Luke Woodhouse') },
  { id: 'demo-8', name: 'Ida Checkout', email: 'ida@example.com', created_at: '2026-09-17T19:20:00Z',
    picks: team('Luke Humphries', 'Jonny Clayton', 'James Wade', 'Gary Anderson', 'Ross Smith', 'Martin Schindler') },
  { id: 'demo-9', name: 'Anders Flight', email: 'anders@example.com', created_at: '2026-09-18T10:10:00Z',
    picks: team('Luke Littler', 'Michael van Gerwen', 'Josh Rock', 'Ryan Searle', 'Jermaine Wattimena', 'Luke Woodhouse') },
  { id: 'demo-10', name: 'Nora Dobbel', email: 'nora@example.com', created_at: '2026-09-19T21:45:00Z',
    picks: team('Gian van Veen', 'Gerwyn Price', 'Stephen Bunting', 'Gary Anderson', 'Ross Smith', 'Krzysztof Ratajski') },
  { id: 'demo-11', name: 'Lars Leg', email: 'lars@example.com', created_at: '2026-09-20T14:05:00Z',
    picks: team('Luke Humphries', 'Jonny Clayton', 'James Wade', 'Wessel Nijman', 'Rob Cross', 'Martin Schindler') },
  { id: 'demo-12', name: 'Emma Nine-Darter', email: 'emma@example.com', created_at: '2026-09-21T16:35:00Z',
    picks: team('Luke Littler', 'Michael van Gerwen', 'Josh Rock', 'Ryan Searle', 'Jermaine Wattimena', 'Krzysztof Ratajski') },
]

export const DEMO_LEAGUES: DemoLeague[] = [
  { id: 'demo-league-1', name: 'Kontorlaget', invite_code: 'DEMO01', created_by: 'demo',
    members: ['demo', 'demo-2', 'demo-3', 'demo-4', 'demo-5', 'demo-6', 'demo-7', 'demo-8'] },
  { id: 'demo-league-2', name: 'Familien Dartmann', invite_code: 'DEMO02', created_by: 'demo-4',
    members: ['demo', 'demo-4', 'demo-9', 'demo-10'] },
]

// Kampresultater per fase. «live» = turneringen er midt i 4. runde (Littler
// og Price har spilt seg videre, Woodhouse og Smith er slått ut, Wade og
// Nijman venter på sin neste kamp). «ferdig» = full turnering med Littler som
// vinner over Humphries i finalen. Motstandere som ikke er valgbare i noen
// pott (Doets, Heta, Noppert …) finnes i det ekte 128-spiller-feltet.
function m(stage: string, player1: string, sets1: number, player2: string, sets2: number): MatchResult {
  return { stage, player1, player2, sets1, sets2, winner: sets1 > sets2 ? player1 : player2 }
}

const LIVE_MATCHES: MatchResult[] = [
  // 1. runde (useedede)
  m('r1', 'Wessel Nijman', 3, 'Kevin Doets', 1),
  m('r1', 'Luke Woodhouse', 3, 'Ricardo Pietreczko', 2),
  m('r1', 'Martin Schindler', 3, 'Cameron Menzies', 0),
  m('r1', 'Krzysztof Ratajski', 1, 'Andrew Gilding', 3),
  m('r1', 'Jermaine Wattimena', 3, 'Daryl Gurney', 2),
  m('r1', 'Ryan Searle', 3, 'Ryan Joyce', 1),
  // 2. runde (seedede inn)
  m('r2', 'Luke Littler', 3, 'Wessel Nijman', 0),
  m('r2', 'Luke Humphries', 3, 'Luke Woodhouse', 1),
  m('r2', 'Gerwyn Price', 3, 'Andrew Gilding', 2),
  m('r2', 'James Wade', 3, 'Jermaine Wattimena', 2),
  m('r2', 'Ross Smith', 2, 'Ryan Searle', 3),
  m('r2', 'Michael van Gerwen', 3, 'Martin Schindler', 2),
  m('r2', 'Josh Rock', 3, 'Dirk van Duijvenbode', 1),
  m('r2', 'Stephen Bunting', 3, 'Damon Heta', 0),
  m('r2', 'Rob Cross', 3, 'Danny Noppert', 2),
  m('r2', 'Gary Anderson', 1, 'Mike De Decker', 3),
  m('r2', 'Gian van Veen', 3, 'Nathan Aspinall', 1),
  m('r2', 'Jonny Clayton', 3, 'Chris Dobey', 2),
  // 3. runde
  m('r3', 'Luke Littler', 4, 'Ryan Searle', 1),
  m('r3', 'Luke Humphries', 4, 'Rob Cross', 2),
  m('r3', 'Gerwyn Price', 4, 'Josh Rock', 3),
  m('r3', 'James Wade', 4, 'Mike De Decker', 2),
  m('r3', 'Michael van Gerwen', 4, 'Stephen Bunting', 1),
  m('r3', 'Gian van Veen', 2, 'Jonny Clayton', 4),
  // 4. runde (pågår — bare to kamper spilt)
  m('r4', 'Luke Littler', 4, 'James Wade', 2),
  m('r4', 'Luke Humphries', 4, 'Jonny Clayton', 3),
]

const FINISHED_MATCHES: MatchResult[] = [
  ...LIVE_MATCHES,
  // Resten av 4. runde — motstandere utenfor pottene er ekte navn fra
  // 128-spiller-feltet som ikke allerede er slått ut over.
  m('r4', 'Gerwyn Price', 4, 'Michael van Gerwen', 3),
  m('r4', 'Dave Chisnall', 4, 'Niels Zonneveld', 2),
  m('r4', 'Ryan Meikle', 4, 'Kim Huybrechts', 1),
  m('r4', 'Gabriel Clemens', 4, 'Chris Landman', 3),
  m('r4', 'Joe Cullen', 4, 'Scott Williams', 2),
  m('r4', 'Ritchie Edhouse', 4, 'Callan Rydz', 3),
  m('qf', 'Luke Littler', 5, 'Ryan Meikle', 2),
  m('qf', 'Luke Humphries', 5, 'Gerwyn Price', 4),
  m('qf', 'Dave Chisnall', 5, 'Gabriel Clemens', 3),
  m('qf', 'Joe Cullen', 5, 'Ritchie Edhouse', 1),
  m('sf', 'Luke Littler', 6, 'Dave Chisnall', 3),
  m('sf', 'Luke Humphries', 6, 'Joe Cullen', 4),
  m('final', 'Luke Littler', 7, 'Luke Humphries', 5),
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
