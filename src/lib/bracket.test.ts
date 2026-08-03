import { describe, it, expect } from 'vitest'
import { buildBracket } from './bracket'
import type { MatchResult } from './scoring'

// Deterministic round-robin: teams[0] beats everyone, teams[1] beats teams[2]/teams[3], etc.
// thirdPlaceBonus lets us control cross-group GD/GF so a specific set of eight 3rd-place
// teams ranks above the other four when getConfirmed3rdPlaces compares all twelve.
function groupMatches(teams: string[], thirdPlaceBonus = 0): MatchResult[] {
  const pairs: [number, number][] = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]
  return pairs.map(([hi, ai]) => {
    const bonus = (hi === 2 && ai === 3) ? thirdPlaceBonus : 0
    const [homeGoals, awayGoals] = hi < ai ? [1 + bonus, 0] : [0, 1 + bonus]
    return { home_team: teams[hi], away_team: teams[ai], home_goals: homeGoals, away_goals: awayGoals, stage: 'group' }
  })
}

// Full VM 2026 group standings (1st, 2nd, 3rd, 4th), verified against bracket-draw.ts's
// R32_DRAW comments and FIFA2026_3RD_SLOT. Eight 3rd-place teams qualify (bonus=2), four don't (bonus=0).
const GROUPS: [string[], number][] = [
  [['Mexico', 'Sør-Afrika', 'Sør-Korea', 'Tsjekkia'], 0],           // A
  [['Sveits', 'Canada', 'Bosnia-Hercegovina', 'Qatar'], 2],          // B
  [['Brasil', 'Marokko', 'Haiti', 'Skottland'], 0],                  // C
  [['USA', 'Australia', 'Paraguay', 'Tyrkia'], 2],                   // D
  [['Tyskland', 'Elfenbenskysten', 'Ecuador', 'Curaçao'], 2],        // E
  [['Nederland', 'Japan', 'Sverige', 'Tunisia'], 2],                 // F
  [['Belgia', 'Egypt', 'Iran', 'New Zealand'], 0],                   // G
  [['Spania', 'Kapp Verde', 'Saudi-Arabia', 'Uruguay'], 0],          // H
  [['Frankrike', 'Norge', 'Senegal', 'Irak'], 2],                    // I
  [['Argentina', 'Østerrike', 'Algerie', 'Jordan'], 2],              // J
  [['Colombia', 'Portugal', 'Congo DR', 'Usbekistan'], 2],           // K
  [['England', 'Kroatia', 'Ghana', 'Panama'], 2],                    // L
]

function groupStage(): MatchResult[] {
  return GROUPS.flatMap(([teams, bonus]) => groupMatches(teams, bonus))
}

const r32: MatchResult[] = [
  { home_team: 'Sør-Afrika', away_team: 'Canada', home_goals: 0, away_goals: 1, stage: 'r32', winner: 'Canada' },
  { home_team: 'Nederland', away_team: 'Marokko', home_goals: 1, away_goals: 1, stage: 'r32', winner: 'Marokko' },
  { home_team: 'Tyskland', away_team: 'Paraguay', home_goals: 1, away_goals: 1, stage: 'r32', winner: 'Paraguay' },
  { home_team: 'Frankrike', away_team: 'Sverige', home_goals: 3, away_goals: 0, stage: 'r32', winner: 'Frankrike' },
  { home_team: 'Brasil', away_team: 'Japan', home_goals: 2, away_goals: 1, stage: 'r32', winner: 'Brasil' },
  { home_team: 'Elfenbenskysten', away_team: 'Norge', home_goals: 1, away_goals: 2, stage: 'r32', winner: 'Norge' },
  { home_team: 'Mexico', away_team: 'Ecuador', home_goals: 2, away_goals: 0, stage: 'r32', winner: 'Mexico' },
  { home_team: 'England', away_team: 'Congo DR', home_goals: 2, away_goals: 1, stage: 'r32', winner: 'England' },
  { home_team: 'Colombia', away_team: 'Ghana', home_goals: 1, away_goals: 0, stage: 'r32', winner: 'Colombia' },
  { home_team: 'Sveits', away_team: 'Algerie', home_goals: 2, away_goals: 0, stage: 'r32', winner: 'Sveits' },
  { home_team: 'USA', away_team: 'Bosnia-Hercegovina', home_goals: 2, away_goals: 0, stage: 'r32', winner: 'USA' },
  { home_team: 'Belgia', away_team: 'Senegal', home_goals: 2, away_goals: 2, stage: 'r32', winner: 'Belgia' },
  { home_team: 'Argentina', away_team: 'Kapp Verde', home_goals: 1, away_goals: 1, stage: 'r32', winner: 'Argentina' },
  { home_team: 'Australia', away_team: 'Egypt', home_goals: 1, away_goals: 1, stage: 'r32', winner: 'Egypt' },
  { home_team: 'Spania', away_team: 'Østerrike', home_goals: 3, away_goals: 0, stage: 'r32', winner: 'Spania' },
  { home_team: 'Portugal', away_team: 'Kroatia', home_goals: 2, away_goals: 1, stage: 'r32', winner: 'Portugal' },
]

describe('buildBracket — FIFA 2026 knockout topology', () => {
  it('pairs R32 winners into R16 exactly as the real 2026 draw does', () => {
    const bracket = buildBracket([...groupStage(), ...r32], [])
    const r16Pairs = bracket.r16.map(m => [m.home?.name, m.away?.name].sort())
    expect(r16Pairs).toContainEqual(['Canada', 'Marokko'].sort())
    expect(r16Pairs).toContainEqual(['Frankrike', 'Paraguay'].sort())
    expect(r16Pairs).toContainEqual(['Brasil', 'Norge'].sort())
    expect(r16Pairs).toContainEqual(['England', 'Mexico'].sort())
    expect(r16Pairs).toContainEqual(['Colombia', 'Sveits'].sort())
    expect(r16Pairs).toContainEqual(['Belgia', 'USA'].sort())
    expect(r16Pairs).toContainEqual(['Argentina', 'Egypt'].sort())
    expect(r16Pairs).toContainEqual(['Spania', 'Portugal'].sort())
  })

  it('pairs R16 winners into QF using the FIFA-confirmed crossed bracket (not naive adjacent pairing)', () => {
    const r16: MatchResult[] = [
      { home_team: 'Canada', away_team: 'Marokko', home_goals: 0, away_goals: 3, stage: 'r16', winner: 'Marokko' },
      { home_team: 'Paraguay', away_team: 'Frankrike', home_goals: 0, away_goals: 1, stage: 'r16', winner: 'Frankrike' },
      { home_team: 'Brasil', away_team: 'Norge', home_goals: 2, away_goals: 0, stage: 'r16', winner: 'Brasil' },
      { home_team: 'Mexico', away_team: 'England', home_goals: 1, away_goals: 2, stage: 'r16', winner: 'England' },
      { home_team: 'Colombia', away_team: 'Sveits', home_goals: 0, away_goals: 1, stage: 'r16', winner: 'Sveits' },
      { home_team: 'USA', away_team: 'Belgia', home_goals: 1, away_goals: 2, stage: 'r16', winner: 'Belgia' },
      { home_team: 'Argentina', away_team: 'Egypt', home_goals: 2, away_goals: 1, stage: 'r16', winner: 'Argentina' },
      { home_team: 'Spania', away_team: 'Portugal', home_goals: 1, away_goals: 0, stage: 'r16', winner: 'Spania' },
    ]
    const bracket = buildBracket([...groupStage(), ...r32, ...r16], [])
    const qfPairs = bracket.qf.map(m => [m.home?.name, m.away?.name].sort())
    expect(qfPairs).toContainEqual(['Marokko', 'Frankrike'].sort())     // pg0 + pg1
    expect(qfPairs).toContainEqual(['Spania', 'Belgia'].sort())         // pg7 + pg5 — the crossing
    expect(qfPairs).toContainEqual(['Brasil', 'England'].sort())        // pg2 + pg3
    expect(qfPairs).toContainEqual(['Argentina', 'Sveits'].sort())      // pg6 + pg4 — the crossing
    // Explicitly assert the naive (wrong) adjacent pairing does NOT occur
    expect(qfPairs).not.toContainEqual(['Belgia', 'Sveits'].sort())
    expect(qfPairs).not.toContainEqual(['Argentina', 'Spania'].sort())
  })

  it('pairs QF winners into SF using the FIFA-confirmed grouping', () => {
    const r16: MatchResult[] = [
      { home_team: 'Canada', away_team: 'Marokko', home_goals: 0, away_goals: 3, stage: 'r16', winner: 'Marokko' },
      { home_team: 'Paraguay', away_team: 'Frankrike', home_goals: 0, away_goals: 1, stage: 'r16', winner: 'Frankrike' },
      { home_team: 'Brasil', away_team: 'Norge', home_goals: 2, away_goals: 0, stage: 'r16', winner: 'Brasil' },
      { home_team: 'Mexico', away_team: 'England', home_goals: 1, away_goals: 2, stage: 'r16', winner: 'England' },
      { home_team: 'Colombia', away_team: 'Sveits', home_goals: 0, away_goals: 1, stage: 'r16', winner: 'Sveits' },
      { home_team: 'USA', away_team: 'Belgia', home_goals: 1, away_goals: 2, stage: 'r16', winner: 'Belgia' },
      { home_team: 'Argentina', away_team: 'Egypt', home_goals: 2, away_goals: 1, stage: 'r16', winner: 'Argentina' },
      { home_team: 'Spania', away_team: 'Portugal', home_goals: 1, away_goals: 0, stage: 'r16', winner: 'Spania' },
    ]
    const qf: MatchResult[] = [
      { home_team: 'Marokko', away_team: 'Frankrike', home_goals: 1, away_goals: 2, stage: 'qf', winner: 'Frankrike' },
      { home_team: 'Spania', away_team: 'Belgia', home_goals: 2, away_goals: 1, stage: 'qf', winner: 'Spania' },
      { home_team: 'Brasil', away_team: 'England', home_goals: 2, away_goals: 1, stage: 'qf', winner: 'Brasil' },
      { home_team: 'Argentina', away_team: 'Sveits', home_goals: 1, away_goals: 0, stage: 'qf', winner: 'Argentina' },
    ]
    const bracket = buildBracket([...groupStage(), ...r32, ...r16, ...qf], [])
    const sfPairs = bracket.sf.map(m => [m.home?.name, m.away?.name].sort())
    expect(sfPairs).toContainEqual(['Frankrike', 'Spania'].sort())   // QF1 + QF2
    expect(sfPairs).toContainEqual(['Brasil', 'Argentina'].sort())   // QF3 + QF4
    expect(sfPairs).not.toContainEqual(['Frankrike', 'Brasil'].sort())
  })
})
