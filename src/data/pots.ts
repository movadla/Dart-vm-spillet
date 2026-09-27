export interface Player {
  name: string
  nationality: string
  iso2: string
  pdcRanking: number
  seedNumber: number | null
  odds: string
  // false = spilleren finnes i det ekte feltet (brukes fortsatt i
  // brakett-projeksjonen og spilleroversikten), men er IKKE et valgbart
  // pott-alternativ i tippe-stegene. Udefinert = true.
  pickable?: boolean
  // Snitt og beste prestasjon ligger i src/data/playerStats.ts (én kilde for
  // både kortene og spillerpanelet) — ikke her.
}

export interface Pot {
  potNumber: number
  name: string
  players: Player[]
}

/** Kandidatene som faktisk vises som valgbare i tippe-stegene for en pott —
 * dvs. `pot.players` minus dem som er markert `pickable: false`. Bruk denne
 * (ikke `pot.players` direkte) overalt hvor "hvilke spillere kan velges"
 * vises — `pot.players` i seg selv skal fortsatt brukes uendret der HELE
 * det kjente spillerfeltet trengs (brakett-projeksjon, spilleroversikten på
 * vm-info-siden). */
export function getPickablePlayers(pot: Pot): Player[] {
  return pot.players.filter((p) => p.pickable !== false)
}

// ── MIDLERTIDIG (2026-09-27): PDC World Grand Prix 2026, ikke VM ──────────
//
// Hele denne fila er byttet ut som en generalprøve mot en ekte, nært
// forestående turnering (28. sep–4. okt, Mattioli Arena, Leicester) i stedet
// for det vanlige 128-spiller-feltet til PDC World Darts Championship i
// desember. Bytt tilbake (se git-historikk for denne fila) når det nærmer
// seg VM-trekningen i november — se src/config/tournament.ts.
//
// World Grand Prix har et lite, HELT KJENT felt på 32 spillere (16 seedet
// etter PDC Order of Merit + 16 kvalifiserte fra Pro Tour-ranglisten) — i
// motsetning til VM-oppsettet er det derfor INGEN plasseringsspillere/filler
// her, og alle 32 er markert valgbare.
//
// Seeding, nasjonalitet og runde 1-trekning: kryssjekket 2026-09-27 mot
// Wikipedia (2026- og 2025-utgaven), dartsnews.com, ESPN og Yahoo Sports.
// To usikkerhetsmomenter herfra:
//  1) Rekkefølgen på de 16 kvalifiserte (pdcRanking 17–32 under) er IKKE en
//     bekreftet offisiell rangering — kildene oppga bare hvem som er med,
//     ikke i hvilken rekkefølge de ligger på Pro Tour Order of Merit.
//  2) Chris Dobeys nasjonalitet var oppgitt som «Skottland» i to av kildene,
//     men det er faktisk feil — han er fra Newcastle, England — rettet her.
//
// Odds er IKKE fra ekte markedsdata for dette turneringsoppsettet (ingen
// kilde ga odds) — gjenbrukt/tilpasset fra de gamle VM-oddsene der spilleren
// fantes fra før, som en grov tier-indikasjon, ikke faktiske odds.
export const POTS: Pot[] = [
  {
    potNumber: 1,
    name: 'Favorittene',
    players: [
      { name: 'Luke Littler',      nationality: 'England',     iso2: 'gb-eng', pdcRanking: 1, seedNumber: 1, odds: '2.5' },
      { name: 'Luke Humphries',    nationality: 'England',     iso2: 'gb-eng', pdcRanking: 2, seedNumber: 2, odds: '3.5' },
      { name: 'Gian van Veen',     nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 3, seedNumber: 3, odds: '9.0' },
      { name: 'Gerwyn Price',      nationality: 'Wales',       iso2: 'gb-wls', pdcRanking: 4, seedNumber: 4, odds: '11.0' },
    ],
  },
  {
    potNumber: 2,
    name: 'Toppseedet',
    players: [
      { name: 'Jonny Clayton',     nationality: 'Wales',       iso2: 'gb-wls', pdcRanking: 5, seedNumber: 5, odds: '13.0' },
      { name: 'James Wade',        nationality: 'England',     iso2: 'gb-eng', pdcRanking: 6, seedNumber: 6, odds: '15.0' },
      { name: 'Josh Rock',         nationality: 'Nord-Irland', iso2: 'gb-nir', pdcRanking: 7, seedNumber: 7, odds: '17.0' },
      { name: 'Danny Noppert',     nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 8, seedNumber: 8, odds: '26.0' },
    ],
  },
  {
    potNumber: 3,
    name: 'Storfavoritter',
    players: [
      { name: 'Michael van Gerwen',nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 9,  seedNumber: 9,  odds: '9.0' },
      { name: 'Gary Anderson',     nationality: 'Skottland',   iso2: 'gb-sct', pdcRanking: 10, seedNumber: 10, odds: '34.0' },
      { name: 'Stephen Bunting',   nationality: 'England',     iso2: 'gb-eng', pdcRanking: 11, seedNumber: 11, odds: '21.0' },
      { name: 'Wessel Nijman',     nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 12, seedNumber: 12, odds: '26.0' },
    ],
  },
  {
    potNumber: 4,
    name: 'Seedet outsidere',
    players: [
      { name: 'Ross Smith',        nationality: 'England',     iso2: 'gb-eng', pdcRanking: 13, seedNumber: 13, odds: '41.0' },
      { name: 'Ryan Searle',       nationality: 'England',     iso2: 'gb-eng', pdcRanking: 14, seedNumber: 14, odds: '34.0' },
      { name: 'Chris Dobey',       nationality: 'England',     iso2: 'gb-eng', pdcRanking: 15, seedNumber: 15, odds: '41.0' },
      { name: 'Nathan Aspinall',   nationality: 'England',     iso2: 'gb-eng', pdcRanking: 16, seedNumber: 16, odds: '34.0' },
    ],
  },
  {
    potNumber: 5,
    name: 'Kvalifiserte',
    players: [
      { name: 'Luke Woodhouse',        nationality: 'England',     iso2: 'gb-eng', pdcRanking: 17, seedNumber: null, odds: '81.0' },
      { name: 'Kevin Doets',           nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 18, seedNumber: null, odds: '151.0' },
      { name: 'Jermaine Wattimena',    nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 19, seedNumber: null, odds: '81.0' },
      { name: 'Krzysztof Ratajski',    nationality: 'Polen',       iso2: 'pl',     pdcRanking: 20, seedNumber: null, odds: '101.0' },
      { name: 'Andrew Gilding',        nationality: 'England',     iso2: 'gb-eng', pdcRanking: 21, seedNumber: null, odds: '151.0' },
      { name: "William O'Connor",      nationality: 'Irland',      iso2: 'ie',     pdcRanking: 22, seedNumber: null, odds: '351.0' },
      { name: 'Damon Heta',            nationality: 'Australia',   iso2: 'au',     pdcRanking: 23, seedNumber: null, odds: '101.0' },
      { name: 'Rob Cross',             nationality: 'England',     iso2: 'gb-eng', pdcRanking: 24, seedNumber: null, odds: '51.0' },
    ],
  },
  {
    potNumber: 6,
    name: 'Resten',
    players: [
      { name: 'Ryan Joyce',            nationality: 'England',     iso2: 'gb-eng', pdcRanking: 25, seedNumber: null, odds: '151.0' },
      { name: 'Dirk van Duijvenbode',  nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 26, seedNumber: null, odds: '101.0' },
      { name: 'Niels Zonneveld',       nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 27, seedNumber: null, odds: '251.0' },
      { name: 'Cameron Menzies',       nationality: 'Skottland',   iso2: 'gb-sct', pdcRanking: 28, seedNumber: null, odds: '151.0' },
      { name: 'Niko Springer',         nationality: 'Tyskland',    iso2: 'de',     pdcRanking: 29, seedNumber: null, odds: '751.0' },
      { name: 'Dave Chisnall',         nationality: 'England',     iso2: 'gb-eng', pdcRanking: 30, seedNumber: null, odds: '201.0' },
      { name: 'Sebastian Białecki',    nationality: 'Polen',       iso2: 'pl',     pdcRanking: 31, seedNumber: null, odds: '301.0' },
      { name: 'Joe Cullen',            nationality: 'England',     iso2: 'gb-eng', pdcRanking: 32, seedNumber: null, odds: '151.0' },
    ],
  },
]

/** Slår opp iso2-kode (for flagcdn.com) fra spillernavn. Returnerer '' ved ukjent spiller. */
export function getIso2(playerName: string): string {
  for (const pot of POTS) {
    const player = pot.players.find(p => p.name === playerName)
    if (player) return player.iso2
  }
  return ''
}
