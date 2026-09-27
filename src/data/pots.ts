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
// ODDS (oppdatert 2026-09-27): ekte utfallsodds, hentet fra bet365 via
// Oddschecker sin samlede World Grand Prix 2026-vinner-markedsside
// (oddschecker.com/darts/world-grand-prix/winner) — ett enkelt, konsistent
// øyeblikksbilde med alle 32 spillere priset individuelt, tatt 2026-09-27
// (dagen før turneringsstart). Konvertert fra brøkodds til desimalodds
// (brøk + 1) og avrundet til én desimal. BoyleSports (tittelsponsor) sin
// EGEN liste fra 17. september ga tildels kortere odds på favorittene
// (f.eks. Littler 4/7 der), men det ser ut som markedet siden har beveget
// seg — bet365-øyeblikksbildet over er nyere og brukt som eneste kilde for
// konsistens. Selve POTT-INNDELINGEN under er satt etter disse oddsene
// (lavest → høyest), IKKE etter PDC-seeding.
//
// MIDLERTIDIG (2026-09-28): antall VALGBARE spillere per nivå endret fra
// 2/3/3/3/3/8 til 2/4/4/4/4/6 — flere alternativer i midtsjiktet (nivå 2–5)
// for å motvirke at kjente navn (Price/van Gerwen/Cross) ble valgt langt
// oftere enn oddsen deres alene skulle tilsi, se simulering av 26 fiktive
// kuponger denne datoen. Kun ÉN ekte deltaker var registrert da dette ble
// endret (Morten Vadla) — scoringen hans er upåvirket siden multiplikatoren
// leses fra `pick.pot_number` lagret i basen, ikke slått opp på nytt her
// (se SCORING.underdogMultiplier i config/scoring.ts) — men «nivå»-visningen
// for spillere som flyttet nivå (Clayton, Bunting, Rock) vil nå vise et
// annet nivånummer enn det som står lagret på hans kupong.
export const POTS: Pot[] = [
  {
    potNumber: 1,
    name: 'Favorittene',
    players: [
      { name: 'Luke Littler',      nationality: 'England',     iso2: 'gb-eng', pdcRanking: 1, seedNumber: 1, odds: '1.8' },
      { name: 'Luke Humphries',    nationality: 'England',     iso2: 'gb-eng', pdcRanking: 2, seedNumber: 2, odds: '6.5' },
    ],
  },
  {
    potNumber: 2,
    name: 'Toppseedet',
    players: [
      { name: 'Gerwyn Price',      nationality: 'Wales',       iso2: 'gb-wls', pdcRanking: 4, seedNumber: 4, odds: '12.0' },
      { name: 'Gian van Veen',     nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 3, seedNumber: 3, odds: '17.0' },
      { name: 'James Wade',        nationality: 'England',     iso2: 'gb-eng', pdcRanking: 6, seedNumber: 6, odds: '23.0' },
      { name: 'Ross Smith',        nationality: 'England',     iso2: 'gb-eng', pdcRanking: 13, seedNumber: 13, odds: '23.0' },
    ],
  },
  {
    potNumber: 3,
    name: 'Storfavoritter',
    players: [
      { name: 'Gary Anderson',     nationality: 'Skottland',   iso2: 'gb-sct', pdcRanking: 10, seedNumber: 10, odds: '23.0' },
      { name: 'Michael van Gerwen',nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 9,  seedNumber: 9,  odds: '26.0' },
      { name: 'Wessel Nijman',     nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 12, seedNumber: 12, odds: '29.0' },
      { name: 'Jonny Clayton',     nationality: 'Wales',       iso2: 'gb-wls', pdcRanking: 5, seedNumber: 5, odds: '34.0' },
    ],
  },
  {
    potNumber: 4,
    name: 'Seedet outsidere',
    players: [
      { name: 'Nathan Aspinall',   nationality: 'England',     iso2: 'gb-eng', pdcRanking: 16, seedNumber: 16, odds: '41.0' },
      { name: 'Chris Dobey',       nationality: 'England',     iso2: 'gb-eng', pdcRanking: 15, seedNumber: 15, odds: '41.0' },
      { name: 'Rob Cross',             nationality: 'England',     iso2: 'gb-eng', pdcRanking: 24, seedNumber: null, odds: '51.0' },
      { name: 'Stephen Bunting',   nationality: 'England',     iso2: 'gb-eng', pdcRanking: 11, seedNumber: 11, odds: '51.0' },
    ],
  },
  {
    potNumber: 5,
    name: 'Kvalifiserte',
    players: [
      { name: 'Josh Rock',         nationality: 'Nord-Irland', iso2: 'gb-nir', pdcRanking: 7, seedNumber: 7, odds: '51.0' },
      { name: 'Kevin Doets',           nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 18, seedNumber: null, odds: '51.0' },
      { name: 'Ryan Searle',       nationality: 'England',     iso2: 'gb-eng', pdcRanking: 14, seedNumber: 14, odds: '67.0' },
      { name: 'Damon Heta',            nationality: 'Australia',   iso2: 'au',     pdcRanking: 23, seedNumber: null, odds: '67.0' },
    ],
  },
  {
    potNumber: 6,
    name: 'Resten',
    players: [
      { name: 'Danny Noppert',     nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 8, seedNumber: 8, odds: '81.0' },
      { name: 'Dirk van Duijvenbode',  nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 26, seedNumber: null, odds: '81.0' },
      { name: 'Jermaine Wattimena',    nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 19, seedNumber: null, odds: '81.0' },
      // Nivå 6 er "resten" av 32-feltet, men kun de 6 med lavest odds vises
      // som valgbare i tippe-stegene (pickable: false under) — resten er
      // fortsatt med i selve braketten/spilleroversikten, bare ikke et
      // pott-alternativ. Se getPickablePlayers().
      { name: 'Krzysztof Ratajski',    nationality: 'Polen',       iso2: 'pl',     pdcRanking: 20, seedNumber: null, odds: '126.0' },
      { name: "William O'Connor",      nationality: 'Irland',      iso2: 'ie',     pdcRanking: 22, seedNumber: null, odds: '126.0' },
      { name: 'Luke Woodhouse',        nationality: 'England',     iso2: 'gb-eng', pdcRanking: 17, seedNumber: null, odds: '126.0' },
      { name: 'Cameron Menzies',       nationality: 'Skottland',   iso2: 'gb-sct', pdcRanking: 28, seedNumber: null, odds: '126.0', pickable: false },
      { name: 'Andrew Gilding',        nationality: 'England',     iso2: 'gb-eng', pdcRanking: 21, seedNumber: null, odds: '126.0', pickable: false },
      { name: 'Joe Cullen',            nationality: 'England',     iso2: 'gb-eng', pdcRanking: 32, seedNumber: null, odds: '126.0', pickable: false },
      { name: 'Dave Chisnall',         nationality: 'England',     iso2: 'gb-eng', pdcRanking: 30, seedNumber: null, odds: '126.0', pickable: false },
      { name: 'Niels Zonneveld',       nationality: 'Nederland',   iso2: 'nl',     pdcRanking: 27, seedNumber: null, odds: '151.0', pickable: false },
      { name: 'Ryan Joyce',            nationality: 'England',     iso2: 'gb-eng', pdcRanking: 25, seedNumber: null, odds: '176.0', pickable: false },
      { name: 'Sebastian Białecki',    nationality: 'Polen',       iso2: 'pl',     pdcRanking: 31, seedNumber: null, odds: '201.0', pickable: false },
      { name: 'Niko Springer',         nationality: 'Tyskland',    iso2: 'de',     pdcRanking: 29, seedNumber: null, odds: '201.0', pickable: false },
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
