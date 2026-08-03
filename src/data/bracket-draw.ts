import { VM_GROUPS } from '@/data/vm-groups'
import type { MatchResult } from '@/lib/scoring'

// Group position codes: '1A' = winner of group A, '2B' = runner-up of group B,
// '3ABCDF' = 3rd-place from one of groups A/B/C/D/F
export type GroupPos = string

// FIFA 2026 predetermined R32 bracket. Consecutive pairs (2i, 2i+1) feed the same R16 slot.
//
// Rekkefølgen på posisjon 8-9 og 14-15 ble korrigert 2026-07-03 — den opprinnelige
// (NRK-baserte) rekkefølgen antok at '1K' alltid havner i samme lomme som '1H'/'2J'
// (Spania). Fasiten, kryssjekket mot FIFAs offisielle bracket og fullstendige
// gruppetabeller, viser at Spanias lomme faktisk parer '1H'/'2J' med '2K'/'2L'
// (Portugal, som ble nr. 2 i gruppe K, slo Kroatia, nr. 2 i gruppe L — bekreftet:
// Spania vs Portugal), mens '1K'/'3DEIJL' (Colombia, gruppevinner, mot Ghana,
// nr. 3 i gruppe L) hører sammen med '1B'/'3EFGIJ' (Sveits/Algerie).
// Selve slot-kodene per posisjon er uendret — kun paringen mellom dem er snudd.
export const R32_DRAW: { home: GroupPos; away: GroupPos }[] = [
  { home: '2A', away: '2B'     },  // Sør-Afrika/Canada – Nederland/Marokko → Canada vs Marokko (04.07)
  { home: '1F', away: '2C'     },
  { home: '1E', away: '3ABCDF' },  // Tyskland/Paraguay – Frankrike/Sverige → Paraguay vs Frankrike (04.07)
  { home: '1I', away: '3CDFGH' },
  { home: '1C', away: '2F'     },  // Brasil/Japan – Elfenbenskysten/Norge → Brasil vs Norge (05.07)
  { home: '2E', away: '2I'     },
  { home: '1A', away: '3CEFHI' },  // Mexico/Ecuador – England/Congo DR → Mexico vs England (06.07)
  { home: '1L', away: '3EHIJK' },
  { home: '1K', away: '3DEIJL' },  // Colombia/Ghana – Sveits/Algerie (Colombia-Ghana spilles 03.–04.07, Sveits klar)
  { home: '1B', away: '3EFGIJ' },
  { home: '1D', away: '3BEFIJ' },  // USA/Bosnia-Hercegovina – Belgia/Senegal → USA vs Belgia (07.07)
  { home: '1G', away: '3AEHIJ' },
  { home: '1J', away: '2H'     },  // Argentina/Kapp Verde – Australia/Egypt (spilles 03.07)
  { home: '2D', away: '2G'     },
  { home: '1H', away: '2J'     },  // Spania/Østerrike – Portugal/Kroatia → Spania vs Portugal (FIFA-bekreftet)
  { home: '2K', away: '2L'     },
]

// R16-nivået (par-gruppe 0-7, dvs. vinnerne av R32_DRAW-parene (2i, 2i+1)) feeder IKKE
// kvartfinalen i enkel nabo-par-rekkefølge (0+1, 2+3, 4+5, 6+7) — FIFAs offisielle
// bracket krysser i andre halvdel. Kryssjekket mot to uavhengige kilder (Sky Sports'
// "bracket and knockout fixtures"-artikkel og FIFAs kampnummerering M97-M100), begge
// enige:
//   QF1 (Gillette, Foxborough): par-gruppe 0 (Canada/Marokko) + 1 (Paraguay/Frankrike)
//   QF2 (SoFi, Inglewood):      par-gruppe 7 (Spania/Portugal) + 5 (USA/Belgia)
//   QF3 (Hard Rock, Miami):     par-gruppe 2 (Brasil/Norge) + 3 (Mexico/England)
//   QF4 (Arrowhead, Kansas City): par-gruppe 6 (Argentina/Egypt) + 4 (Sveits/Colombia)
export const R16_TO_QF_PAIRS: [number, number][] = [[0, 1], [7, 5], [2, 3], [6, 4]]

// Semifinaler — indekser inn i R16_TO_QF_PAIRS (dvs. QF1-4 i rekkefølgen over):
//   SF1 (Dallas): QF1 + QF2 · SF2 (Atlanta): QF3 + QF4
export const QF_TO_SF_PAIRS: [number, number][] = [[0, 1], [2, 3]]

interface StandingRow { team: string; pts: number; gd: number; gf: number }

function calcGroupStandings(groupLetter: string, matches: MatchResult[]): StandingRow[] {
  const g = VM_GROUPS.find(g => g.letter === groupLetter)
  if (!g) return []
  const s: Record<string, StandingRow> = {}
  for (const t of g.teams) s[t] = { team: t, pts: 0, gd: 0, gf: 0 }
  for (const m of matches) {
    if (!g.teams.includes(m.home_team) || !g.teams.includes(m.away_team)) continue
    if (m.stage && m.stage !== 'group') continue
    const h = m.home_goals, a = m.away_goals
    s[m.home_team].gf += h; s[m.away_team].gf += a
    s[m.home_team].gd += h - a; s[m.away_team].gd += a - h
    if (h > a) s[m.home_team].pts += 3
    else if (h === a) { s[m.home_team].pts += 1; s[m.away_team].pts += 1 }
    else s[m.away_team].pts += 3
  }
  return Object.values(s).sort((a, b) => (b.pts - a.pts) || (b.gd - a.gd) || (b.gf - a.gf))
}

function groupMatchCount(groupLetter: string, matches: MatchResult[]): number {
  const g = VM_GROUPS.find(g => g.letter === groupLetter)
  if (!g) return 0
  return matches.filter(m =>
    (!m.stage || m.stage === 'group') &&
    g.teams.includes(m.home_team) && g.teams.includes(m.away_team)
  ).length
}

// Returns confirmed standings only for groups where all 6 matches have been played
export function getConfirmedPositions(matches: MatchResult[]): Map<string, StandingRow[]> {
  const result = new Map<string, StandingRow[]>()
  for (const g of VM_GROUPS) {
    if (groupMatchCount(g.letter, matches) >= 6) {
      result.set(g.letter, calcGroupStandings(g.letter, matches))
    }
  }
  return result
}

// FIFA 2026 official 3rd-place bracket assignment (group letter → slot code).
// Verified against NRKs publiserte R32-kampplan (alle 16 kamper bekreftet 28.06.2026).
// Backtracking er erstattet fordi greedy søk kan gi feil tildeling.
const FIFA2026_3RD_SLOT: Record<string, string> = {
  B: '3BEFIJ',  // Bosnia-Hercegovina → USA (1D)
  D: '3ABCDF',  // Paraguay → Deutschland (1E)
  E: '3CEFHI',  // Ecuador → Mexico (1A)
  F: '3CDFGH',  // Sverige → Frankrike (1I)
  I: '3AEHIJ',  // Senegal → Belgia (1G)
  J: '3EFGIJ',  // Algerie → Sveits (1B)
  K: '3EHIJK',  // DR Kongo → England (1L)
  L: '3DEIJL',  // Ghana → Colombia (1K) — Kroatia ble faktisk nr. 2 i gruppe L, ikke nr. 3
}

// Returns confirmed 3rd-place slot assignments — only populated after all 12 groups done
export function getConfirmed3rdPlaces(matches: MatchResult[]): Map<string, string> {
  const confirmed = getConfirmedPositions(matches)
  if (confirmed.size < 12) return new Map()

  const all3rd = Array.from(confirmed.entries()).map(([letter, standings]) => ({
    group: letter,
    team: standings[2].team,
    pts: standings[2].pts,
    gd: standings[2].gd,
    gf: standings[2].gf,
  }))
  all3rd.sort((a, b) => (b.pts - a.pts) || (b.gd - a.gd) || (b.gf - a.gf))
  const top8 = all3rd.slice(0, 8)

  const result = new Map<string, string>()
  for (const q of top8) {
    const slot = FIFA2026_3RD_SLOT[q.group]
    if (slot) result.set(slot, q.team)
  }
  return result
}

// Resolve a position code to a team name, or null if not yet determined
export function resolvePos(
  pos: GroupPos,
  confirmed: Map<string, StandingRow[]>,
  thirds: Map<string, string>
): string | null {
  if (pos.startsWith('3')) return thirds.get(pos) ?? null
  const rankIdx = parseInt(pos[0]) - 1
  const group = pos.slice(1)
  return confirmed.get(group)?.[rankIdx]?.team ?? null
}

// Find the index (0-15) of a played R32 match in R32_DRAW, or -1 if not mappable
export function getR32DrawIndex(
  homeTeam: string,
  awayTeam: string,
  confirmed: Map<string, StandingRow[]>,
  thirds: Map<string, string>
): number {
  const homeSlot = findTeamR32Slot(homeTeam, confirmed, thirds)
  const awaySlot = findTeamR32Slot(awayTeam, confirmed, thirds)
  if (!homeSlot || !awaySlot) return -1
  return R32_DRAW.findIndex(d =>
    (d.home === homeSlot && d.away === awaySlot) ||
    (d.home === awaySlot && d.away === homeSlot)
  )
}

// Find which R32 slot a team occupies (given confirmed positions)
// Returns the position code like '1H', '2A', or a third-place slot code
export function findTeamR32Slot(
  teamName: string,
  confirmed: Map<string, StandingRow[]>,
  thirds: Map<string, string>
): GroupPos | null {
  for (const [letter, standings] of confirmed) {
    const idx = standings.findIndex(s => s.team === teamName)
    if (idx === 0) return `1${letter}`
    if (idx === 1) return `2${letter}`
    if (idx === 2) {
      // 3rd place — find which slot they were assigned to
      for (const [slotPos, team] of thirds) {
        if (team === teamName) return slotPos
      }
      // 3rd place but not in top 8 — doesn't advance
      return null
    }
  }
  return null
}
