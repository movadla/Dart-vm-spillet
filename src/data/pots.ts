export interface Player {
  name: string
  nationality: string
  iso2: string
  pdcRanking: number
  seedNumber: number | null
  /** Desimalodds for å vinne turneringen, som tekst («6.5»). */
  odds: string
  // Snitt og beste prestasjon ligger i src/data/playerStats.ts (én kilde for
  // både kortene og spillerpanelet) — ikke her.
}

export interface Pot {
  potNumber: number
  name: string
  players: Player[]
}

// ── Grand Slam of Darts 2026 (14.–22. november) — «4 valg»-formatet ──────────
//
// Hver deltaker velger ÉN spiller fra hver av 4 potter. Pottene lages
// automatisk ut fra EN flat spillerliste (FIELD under) sortert på
// vinnerodds, lavest odds først: de 4 største favorittene i pott 1, de neste
// 4 i pott 2, de neste 6 i pott 3, og ALLE resten i pott 4 (i UI vises de 5
// beste som kort + et «se alle»-kort med liste). Se POT_SIZES.
//
// PLASSHOLDER: FIELD under er fortsatt de 32 spillerne fra World Grand
// Prix-generalprøven (kryssjekket og oddsene hentet 2026-09-27 fra bet365 via
// Oddschecker) — IKKE Grand Slam-feltet. Det ekte feltet på 48 er ikke
// kjent før etter Tour Card Holder Qualifier 2026-11-06. Da skal HELE FIELD
// byttes ut: navn og nasjonalitet fra PDC (API-turnering 10871), pdcRanking
// fra PDC Order of Merit, og odds fra en ekte, navngitt kilde — aldri gjettet.
// Frem til det finnes Grand Slam-odds (ingen utfalls-marked var publisert på
// Oddschecker 2026-10-08) er rekkefølgen kun en plassholder.
//
// Alle spillere i FIELD kan velges (ingen «pickable»-filtrering lenger —
// pott 4 viser hele resten som en liste).
const FIELD: Player[] = [
  { name: 'Luke Littler', nationality: 'England', iso2: 'gb-eng', pdcRanking: 1, seedNumber: 1, odds: '1.8' },
  { name: 'Luke Humphries', nationality: 'England', iso2: 'gb-eng', pdcRanking: 2, seedNumber: 2, odds: '6.5' },
  { name: 'Gerwyn Price', nationality: 'Wales', iso2: 'gb-wls', pdcRanking: 4, seedNumber: 4, odds: '12.0' },
  { name: 'Gian van Veen', nationality: 'Nederland', iso2: 'nl', pdcRanking: 3, seedNumber: 3, odds: '17.0' },
  { name: 'James Wade', nationality: 'England', iso2: 'gb-eng', pdcRanking: 6, seedNumber: 6, odds: '23.0' },
  { name: 'Ross Smith', nationality: 'England', iso2: 'gb-eng', pdcRanking: 13, seedNumber: 13, odds: '23.0' },
  { name: 'Gary Anderson', nationality: 'Skottland', iso2: 'gb-sct', pdcRanking: 10, seedNumber: 10, odds: '23.0' },
  { name: 'Michael van Gerwen',nationality: 'Nederland', iso2: 'nl', pdcRanking: 9, seedNumber: 9, odds: '26.0' },
  { name: 'Wessel Nijman', nationality: 'Nederland', iso2: 'nl', pdcRanking: 12, seedNumber: 12, odds: '29.0' },
  { name: 'Jonny Clayton', nationality: 'Wales', iso2: 'gb-wls', pdcRanking: 5, seedNumber: 5, odds: '34.0' },
  { name: 'Nathan Aspinall', nationality: 'England', iso2: 'gb-eng', pdcRanking: 16, seedNumber: 16, odds: '41.0' },
  { name: 'Chris Dobey', nationality: 'England', iso2: 'gb-eng', pdcRanking: 15, seedNumber: 15, odds: '41.0' },
  { name: 'Rob Cross', nationality: 'England', iso2: 'gb-eng', pdcRanking: 24, seedNumber: null, odds: '51.0' },
  { name: 'Stephen Bunting', nationality: 'England', iso2: 'gb-eng', pdcRanking: 11, seedNumber: 11, odds: '51.0' },
  { name: 'Josh Rock', nationality: 'Nord-Irland', iso2: 'gb-nir', pdcRanking: 7, seedNumber: 7, odds: '51.0' },
  { name: 'Kevin Doets', nationality: 'Nederland', iso2: 'nl', pdcRanking: 18, seedNumber: null, odds: '51.0' },
  { name: 'Ryan Searle', nationality: 'England', iso2: 'gb-eng', pdcRanking: 14, seedNumber: 14, odds: '67.0' },
  { name: 'Damon Heta', nationality: 'Australia', iso2: 'au', pdcRanking: 23, seedNumber: null, odds: '67.0' },
  { name: 'Danny Noppert', nationality: 'Nederland', iso2: 'nl', pdcRanking: 8, seedNumber: 8, odds: '81.0' },
  { name: 'Dirk van Duijvenbode', nationality: 'Nederland', iso2: 'nl', pdcRanking: 26, seedNumber: null, odds: '81.0' },
  { name: 'Jermaine Wattimena', nationality: 'Nederland', iso2: 'nl', pdcRanking: 19, seedNumber: null, odds: '81.0' },
  { name: 'Krzysztof Ratajski', nationality: 'Polen', iso2: 'pl', pdcRanking: 20, seedNumber: null, odds: '126.0' },
  { name: "William O'Connor", nationality: 'Irland', iso2: 'ie', pdcRanking: 22, seedNumber: null, odds: '126.0' },
  { name: 'Luke Woodhouse', nationality: 'England', iso2: 'gb-eng', pdcRanking: 17, seedNumber: null, odds: '126.0' },
  { name: 'Cameron Menzies', nationality: 'Skottland', iso2: 'gb-sct', pdcRanking: 28, seedNumber: null, odds: '126.0' },
  { name: 'Andrew Gilding', nationality: 'England', iso2: 'gb-eng', pdcRanking: 21, seedNumber: null, odds: '126.0' },
  { name: 'Joe Cullen', nationality: 'England', iso2: 'gb-eng', pdcRanking: 32, seedNumber: null, odds: '126.0' },
  { name: 'Dave Chisnall', nationality: 'England', iso2: 'gb-eng', pdcRanking: 30, seedNumber: null, odds: '126.0' },
  { name: 'Niels Zonneveld', nationality: 'Nederland', iso2: 'nl', pdcRanking: 27, seedNumber: null, odds: '151.0' },
  { name: 'Ryan Joyce', nationality: 'England', iso2: 'gb-eng', pdcRanking: 25, seedNumber: null, odds: '176.0' },
  { name: 'Sebastian Białecki', nationality: 'Polen', iso2: 'pl', pdcRanking: 31, seedNumber: null, odds: '201.0' },
  { name: 'Niko Springer', nationality: 'Tyskland', iso2: 'de', pdcRanking: 29, seedNumber: null, odds: '201.0' },
]

/** Antall spillere i pott 1, 2 og 3. Pott 4 får ALLE resten. */
export const POT_SIZES = [4, 4, 6] as const

const POT_NAMES = ['Favorittene', 'Utfordrerne', 'Mørkehestene', 'Outsiderne']

/** Sorterer feltet på odds (lavest først, deretter PDC-ranking) og deler det i potter. */
export function buildPots(field: readonly Player[], sizes: readonly number[] = POT_SIZES): Pot[] {
  const sorted = [...field].sort((a, b) => parseFloat(a.odds) - parseFloat(b.odds) || a.pdcRanking - b.pdcRanking)
  const pots: Pot[] = []
  let start = 0
  for (let i = 0; i <= sizes.length; i++) {
    const end = i < sizes.length ? start + sizes[i] : sorted.length
    pots.push({ potNumber: i + 1, name: POT_NAMES[i] ?? `Pott ${i + 1}`, players: sorted.slice(start, end) })
    start = end
  }
  return pots
}

export const POTS: Pot[] = buildPots(FIELD)

/** Alle valgbare spillere i en pott (alle — beholdt som funksjon så kallere ikke trenger endres). */
export function getPickablePlayers(pot: Pot): Player[] {
  return pot.players
}

/** Slår opp iso2-kode (for flagcdn.com) fra spillernavn. Returnerer '' ved ukjent spiller. */
export function getIso2(playerName: string): string {
  for (const pot of POTS) {
    const player = pot.players.find(p => p.name === playerName)
    if (player) return player.iso2
  }
  return ''
}
