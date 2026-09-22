import { POTS } from '@/data/pots'

// Genererer en illustrativ, stabil eksempel-trekning for hele 96-spiller-braketten
// (32 seedede med bye til runde 2 + 64 useedede som spiller runde 1) — PDC har ikke
// publisert den faktiske trekningen ennå (kommer normalt medio november). Vi har kun
// 32 navngitte useedede spillere i datasettet, så resten av runde-1-feltet fylles med
// tydelig merkede plasseringsspillere ("Kvalifisert spiller N") som ikke er valgbare.
//
// Trekningen er deterministisk (samme resultat hver gang appen bygges) — ikke reell
// tilfeldig hver renders, og skal erstattes med ekte data når trekningen er kjent.

const FILLER_COUNT = 32
const FILLER_NAMES = Array.from({ length: FILLER_COUNT }, (_, i) => `Kvalifisert spiller ${i + 1}`)

const ALL_PLAYERS = POTS.flatMap((p) => p.players)
const SEEDED = ALL_PLAYERS.filter((p) => p.seedNumber != null).sort((a, b) => a.seedNumber! - b.seedNumber!)
const NAMED_UNSEEDED = ALL_PLAYERS.filter((p) => p.seedNumber == null).map((p) => p.name)

/** Enkel deterministisk pseudo-tilfeldig generator (mulberry32) — stabil på tvers av kjøringer. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffledDeterministic<T>(arr: T[], seed: number): T[] {
  const out = [...arr]
  const rand = mulberry32(seed)
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Standard turneringsseeding — sprer seedene maksimalt utover braketten (1 og 2 møtes først i finalen). */
function seedOrder(n: number): number[] {
  if (n === 1) return [1]
  const prev = seedOrder(n / 2)
  const out: number[] = []
  for (const s of prev) {
    out.push(s)
    out.push(n + 1 - s)
  }
  return out
}

// 64 spillere i runde 1-feltet (32 navngitte useedede + 32 plasseringsspillere), stabilt stokket.
const R1_FIELD = shuffledDeterministic([...NAMED_UNSEEDED, ...FILLER_NAMES], 20261211)

// 32 runde 1-kamper: [spillerA, spillerB][]
export const R1_MATCHES: [string, string][] = Array.from({ length: 32 }, (_, i) => [
  R1_FIELD[i * 2],
  R1_FIELD[i * 2 + 1],
])

// seedOrder(32)[slot] = hvilket seedNummer som venter i runde 2-slot `slot` (0-indeksert),
// og runde 1-kamp `slot` sin vinner møter akkurat den seeden.
const SLOT_TO_SEED = seedOrder(32)
const SEED_TO_SLOT = new Map<number, number>(SLOT_TO_SEED.map((seed, slot) => [seed, slot]))
const SEED_TO_NAME = new Map<number, string>(SEEDED.map((p) => [p.seedNumber!, p.name]))

export type FirstMatchInfo =
  | { type: 'match'; opponent: string; isFiller: boolean }
  | { type: 'bye'; vsA: string; vsB: string; vsAFiller: boolean; vsBFiller: boolean }
  | null

/** Hvem møter denne spilleren i sin første kamp — direkte motstander (useedet) eller bye+ventende par (seedet). */
export function getFirstMatchInfo(playerName: string): FirstMatchInfo {
  const seededPlayer = SEEDED.find((p) => p.name === playerName)
  if (seededPlayer) {
    const slot = SEED_TO_SLOT.get(seededPlayer.seedNumber!)
    if (slot == null) return null
    const [a, b] = R1_MATCHES[slot]
    return { type: 'bye', vsA: a, vsB: b, vsAFiller: a.startsWith('Kvalifisert spiller'), vsBFiller: b.startsWith('Kvalifisert spiller') }
  }
  const match = R1_MATCHES.find(([a, b]) => a === playerName || b === playerName)
  if (!match) return null
  const opponent = match[0] === playerName ? match[1] : match[0]
  return { type: 'match', opponent, isFiller: opponent.startsWith('Kvalifisert spiller') }
}

/** Hvilken seed (om noen) venter i runde 2 for vinneren av en gitt runde 1-kamp (indeks 0–31). */
export function getRound2Seed(matchIndex: number): string | null {
  const seed = SLOT_TO_SEED[matchIndex]
  return SEED_TO_NAME.get(seed) ?? null
}

/** For en useedet spiller: hvilken seed venter i runde 2 dersom han vinner runde 1. */
export function getSecondRoundOpponent(playerName: string): string | null {
  const idx = R1_MATCHES.findIndex(([a, b]) => a === playerName || b === playerName)
  if (idx === -1) return null
  return getRound2Seed(idx)
}

/**
 * De 7 andre seedede spillerne i samme "kvartal" av braketten (gruppe på 8 sammenhengende
 * bracket-slots) — de du potensielt kan møte lenger ut i turneringen dersom alle vinner fram.
 */
export function getBracketSection(playerName: string): string[] {
  const player = SEEDED.find((p) => p.name === playerName)
  if (!player) return []
  const slot = SEED_TO_SLOT.get(player.seedNumber!)
  if (slot == null) return []
  const sectionStart = Math.floor(slot / 8) * 8
  const sectionSlots = Array.from({ length: 8 }, (_, i) => sectionStart + i).filter((s) => s !== slot)
  return sectionSlots.map((s) => SEED_TO_NAME.get(SLOT_TO_SEED[s])).filter((n): n is string => !!n)
}
