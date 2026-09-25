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

// Kampresultater per fase — hele 128-spiller-braketten (64 runde 1-kamper,
// ingen walkover: ALLE spillere, også de seedede, spiller runde 1 — se
// bracketProjection.ts sin R1_MATCHES, som denne simuleringen er bygget fra
// slik at «neste kamp»-projeksjonen kan slå opp ekte, avgjorte motstandere
// helt ut braketten i stedet for bare et eksempel-gjett). Generert med
// scripts/simulate-scoring-suspense.ts sin sannsynlighetsmodell (frø 8) —
// se TODO.md for hvordan man ruller en ny simulering.
//
// «live» = turneringen er midt i 4. runde: Littler, Rock, Humphries (5–4-
// thriller mot Woodhouse) og Van Gerwen har spilt sine 4.-runde-kamper og
// gått videre; Price, Clayton, Ross Smith, Wade venter fortsatt på sine.
// «ferdig» = full turnering med to kjempeoverraskelser i kvartfinalen —
// både Littler (mot Rock) og Humphries (mot Van Gerwen) blir slått ut — før
// Josh Rock (pott 3, ×2-multiplikator) vinner finalen 7–5 over Van Gerwen.
// Motstandere utenfor pottene er ekte navn fra det 128-spiller-feltet
// bracketProjection.ts bruker («Kvalifisert spiller N» er plasseringsspillere
// uten rangering, kun brukt som runde 1-motstandere for de aller svakest
// rangerte i feltet).
function m(stage: string, player1: string, sets1: number, player2: string, sets2: number): MatchResult {
  return { stage, player1, player2, sets1, sets2, winner: sets1 > sets2 ? player1 : player2 }
}

const R1_RESULTS: MatchResult[] = [
  m('r1', 'Luke Littler', 3, 'Kvalifisert spiller 64', 1),
  m('r1', 'Nathan Girvan', 3, 'Kvalifisert spiller 1', 2),
  m('r1', 'Ritchie Edhouse', 3, 'Kvalifisert spiller 33', 2),
  m('r1', 'Ryan Meikle', 3, 'Kvalifisert spiller 32', 1),
  m('r1', 'Nathan Aspinall', 3, 'Kvalifisert spiller 49', 0),
  m('r1', 'Steve Beaton', 3, 'Kvalifisert spiller 16', 0),
  m('r1', 'Jermaine Wattimena', 3, 'Kvalifisert spiller 48', 0),
  m('r1', "William O'Connor", 3, 'Kvalifisert spiller 17', 0),
  m('r1', 'Josh Rock', 3, 'Kvalifisert spiller 57', 0),
  m('r1', 'Danny van Trijp', 3, 'Kvalifisert spiller 8', 1),
  m('r1', 'Ryan Joyce', 3, 'Kvalifisert spiller 40', 0),
  m('r1', 'Kim Huybrechts', 3, 'Kvalifisert spiller 25', 0),
  m('r1', 'Stephen Bunting', 3, 'Kvalifisert spiller 56', 0),
  m('r1', 'Chris Landman', 3, 'Kvalifisert spiller 9', 0),
  m('r1', 'Mike De Decker', 3, 'Kvalifisert spiller 41', 1),
  m('r1', 'Brendan Dolan', 3, 'Kvalifisert spiller 24', 1),
  m('r1', 'Gerwyn Price', 3, 'Kvalifisert spiller 61', 0),
  m('r1', 'Boris Krčmar', 3, 'Kvalifisert spiller 4', 1),
  m('r1', 'Daryl Gurney', 3, 'Kvalifisert spiller 36', 2),
  m('r1', 'Niels Zonneveld', 3, 'Kvalifisert spiller 29', 0),
  m('r1', 'Ryan Searle', 3, 'Kvalifisert spiller 52', 1),
  m('r1', 'Robert Owen', 3, 'Kvalifisert spiller 13', 1),
  m('r1', 'Krzysztof Ratajski', 3, 'Kvalifisert spiller 45', 1),
  m('r1', 'Alan Soutar', 3, 'Kvalifisert spiller 20', 0),
  m('r1', 'Jonny Clayton', 3, 'Kvalifisert spiller 60', 2),
  m('r1', 'Florian Hempel', 3, 'Kvalifisert spiller 5', 1),
  m('r1', 'Kevin Doets', 3, 'Kvalifisert spiller 37', 2),
  m('r1', 'Ian White', 3, 'Kvalifisert spiller 28', 0),
  m('r1', 'Wessel Nijman', 3, 'Kvalifisert spiller 53', 2),
  m('r1', 'Jim Williams', 3, 'Kvalifisert spiller 12', 2),
  m('r1', 'Rob Cross', 3, 'Kvalifisert spiller 44', 2),
  m('r1', 'William Borland', 3, 'Kvalifisert spiller 21', 1),
  m('r1', 'Luke Humphries', 3, 'Kvalifisert spiller 63', 1),
  m('r1', 'Owen Bates', 3, 'Kvalifisert spiller 2', 0),
  m('r1', 'Joe Cullen', 3, 'Kvalifisert spiller 34', 2),
  m('r1', 'Callan Rydz', 3, 'Kvalifisert spiller 31', 1),
  m('r1', 'Chris Dobey', 3, 'Kvalifisert spiller 50', 1),
  m('r1', 'Jeffrey de Zwaan', 3, 'Kvalifisert spiller 15', 2),
  m('r1', 'Luke Woodhouse', 3, 'Kvalifisert spiller 47', 2),
  m('r1', 'Adam Hunt', 3, 'Kvalifisert spiller 18', 1),
  m('r1', 'Michael van Gerwen', 3, 'Kvalifisert spiller 58', 1),
  m('r1', 'Jamie Hughes', 3, 'Kvalifisert spiller 7', 0),
  m('r1', 'Cameron Menzies', 3, 'Kvalifisert spiller 39', 2),
  m('r1', 'Vincent van der Voort', 3, 'Kvalifisert spiller 26', 1),
  m('r1', 'Danny Noppert', 3, 'Kvalifisert spiller 55', 0),
  m('r1', 'Ryan Murray', 2, 'Kvalifisert spiller 10', 3),
  m('r1', 'Dirk van Duijvenbode', 3, 'Kvalifisert spiller 42', 2),
  m('r1', 'Keane Barry', 3, 'Kvalifisert spiller 23', 0),
  m('r1', 'Gian van Veen', 3, 'Kvalifisert spiller 62', 2),
  m('r1', 'Gabriel Clemens', 3, 'Kvalifisert spiller 3', 2),
  m('r1', 'Dave Chisnall', 3, 'Kvalifisert spiller 35', 0),
  m('r1', 'Ricardo Pietreczko', 3, 'Kvalifisert spiller 30', 2),
  m('r1', 'Ross Smith', 3, 'Kvalifisert spiller 51', 0),
  m('r1', 'Madars Razma', 3, 'Kvalifisert spiller 14', 0),
  m('r1', 'Martin Schindler', 3, 'Kvalifisert spiller 46', 0),
  m('r1', 'Scott Williams', 3, 'Kvalifisert spiller 19', 1),
  m('r1', 'James Wade', 3, 'Kvalifisert spiller 59', 0),
  m('r1', 'Niko Springer', 3, 'Kvalifisert spiller 6', 2),
  m('r1', 'Andrew Gilding', 3, 'Kvalifisert spiller 38', 1),
  m('r1', 'Mensur Suljović', 3, 'Kvalifisert spiller 27', 1),
  m('r1', 'Gary Anderson', 3, 'Kvalifisert spiller 54', 2),
  m('r1', 'Jason Lowe', 2, 'Kvalifisert spiller 11', 3),
  m('r1', 'Damon Heta', 3, 'Kvalifisert spiller 43', 2),
  m('r1', 'Connor Scutt', 3, 'Kvalifisert spiller 22', 2),
]

const R2_RESULTS: MatchResult[] = [
  m('r2', 'Luke Littler', 4, 'Nathan Girvan', 0),
  m('r2', 'Ritchie Edhouse', 4, 'Ryan Meikle', 2),
  m('r2', 'Nathan Aspinall', 4, 'Steve Beaton', 0),
  m('r2', 'Jermaine Wattimena', 4, "William O'Connor", 1),
  m('r2', 'Josh Rock', 4, 'Danny van Trijp', 1),
  m('r2', 'Ryan Joyce', 4, 'Kim Huybrechts', 3),
  m('r2', 'Stephen Bunting', 4, 'Chris Landman', 2),
  m('r2', 'Mike De Decker', 4, 'Brendan Dolan', 1),
  m('r2', 'Gerwyn Price', 4, 'Boris Krčmar', 3),
  m('r2', 'Daryl Gurney', 4, 'Niels Zonneveld', 1),
  m('r2', 'Ryan Searle', 4, 'Robert Owen', 3),
  m('r2', 'Krzysztof Ratajski', 4, 'Alan Soutar', 0),
  m('r2', 'Jonny Clayton', 4, 'Florian Hempel', 2),
  m('r2', 'Kevin Doets', 1, 'Ian White', 4),
  m('r2', 'Wessel Nijman', 4, 'Jim Williams', 2),
  m('r2', 'Rob Cross', 4, 'William Borland', 0),
  m('r2', 'Luke Humphries', 4, 'Owen Bates', 2),
  m('r2', 'Joe Cullen', 4, 'Callan Rydz', 0),
  m('r2', 'Chris Dobey', 4, 'Jeffrey de Zwaan', 3),
  m('r2', 'Luke Woodhouse', 4, 'Adam Hunt', 2),
  m('r2', 'Michael van Gerwen', 4, 'Jamie Hughes', 2),
  m('r2', 'Cameron Menzies', 4, 'Vincent van der Voort', 0),
  m('r2', 'Danny Noppert', 4, 'Kvalifisert spiller 10', 2),
  m('r2', 'Dirk van Duijvenbode', 4, 'Keane Barry', 3),
  m('r2', 'Gian van Veen', 4, 'Gabriel Clemens', 0),
  m('r2', 'Dave Chisnall', 4, 'Ricardo Pietreczko', 3),
  m('r2', 'Ross Smith', 4, 'Madars Razma', 0),
  m('r2', 'Martin Schindler', 4, 'Scott Williams', 3),
  m('r2', 'James Wade', 4, 'Niko Springer', 2),
  m('r2', 'Andrew Gilding', 4, 'Mensur Suljović', 2),
  m('r2', 'Gary Anderson', 4, 'Kvalifisert spiller 11', 0),
  m('r2', 'Damon Heta', 4, 'Connor Scutt', 1),
]

const R3_RESULTS: MatchResult[] = [
  m('r3', 'Luke Littler', 4, 'Ritchie Edhouse', 1),
  m('r3', 'Nathan Aspinall', 1, 'Jermaine Wattimena', 4),
  m('r3', 'Josh Rock', 4, 'Ryan Joyce', 3),
  m('r3', 'Stephen Bunting', 4, 'Mike De Decker', 0),
  m('r3', 'Gerwyn Price', 4, 'Daryl Gurney', 3),
  m('r3', 'Ryan Searle', 4, 'Krzysztof Ratajski', 2),
  m('r3', 'Jonny Clayton', 4, 'Ian White', 2),
  m('r3', 'Wessel Nijman', 4, 'Rob Cross', 2),
  m('r3', 'Luke Humphries', 4, 'Joe Cullen', 0),
  m('r3', 'Chris Dobey', 0, 'Luke Woodhouse', 4),
  m('r3', 'Michael van Gerwen', 4, 'Cameron Menzies', 0),
  m('r3', 'Danny Noppert', 4, 'Dirk van Duijvenbode', 3),
  m('r3', 'Gian van Veen', 4, 'Dave Chisnall', 2),
  m('r3', 'Ross Smith', 4, 'Martin Schindler', 1),
  m('r3', 'James Wade', 4, 'Andrew Gilding', 0),
  m('r3', 'Gary Anderson', 4, 'Damon Heta', 0),
]

// Kun 4 av 8 runde 4-kamper spilt i «live»-øyeblikksbildet — resten («R4_REST»
// under) legges kun til i «ferdig».
const R4_LIVE: MatchResult[] = [
  m('r4', 'Luke Littler', 5, 'Jermaine Wattimena', 0),
  m('r4', 'Josh Rock', 5, 'Stephen Bunting', 2),
  m('r4', 'Luke Humphries', 5, 'Luke Woodhouse', 4),
  m('r4', 'Michael van Gerwen', 5, 'Danny Noppert', 3),
]
const R4_REST: MatchResult[] = [
  m('r4', 'Gerwyn Price', 2, 'Ryan Searle', 5),
  m('r4', 'Jonny Clayton', 2, 'Wessel Nijman', 5),
  m('r4', 'Gian van Veen', 5, 'Ross Smith', 3),
  m('r4', 'James Wade', 5, 'Gary Anderson', 4),
]
const QF_RESULTS: MatchResult[] = [
  m('qf', 'Luke Littler', 3, 'Josh Rock', 5),
  m('qf', 'Ryan Searle', 5, 'Wessel Nijman', 2),
  m('qf', 'Luke Humphries', 2, 'Michael van Gerwen', 5),
  m('qf', 'Gian van Veen', 5, 'James Wade', 3),
]
const SF_RESULTS: MatchResult[] = [
  m('sf', 'Josh Rock', 6, 'Ryan Searle', 1),
  m('sf', 'Michael van Gerwen', 6, 'Gian van Veen', 2),
]
const FINAL_RESULT: MatchResult[] = [
  m('final', 'Josh Rock', 7, 'Michael van Gerwen', 5),
]

const LIVE_MATCHES: MatchResult[] = [...R1_RESULTS, ...R2_RESULTS, ...R3_RESULTS, ...R4_LIVE]

const FINISHED_MATCHES: MatchResult[] = [
  ...R1_RESULTS, ...R2_RESULTS, ...R3_RESULTS, ...R4_LIVE, ...R4_REST,
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
