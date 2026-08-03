import { describe, it, expect } from 'vitest'
import {
  calcTeamMatchPoints,
  calcAdvancementBonus,
  calcTeamPoints,
  calcParticipantPoints,
  type MatchResult,
} from './scoring'

describe('calcTeamMatchPoints', () => {
  it('returns 0 when team has no matches', () => {
    expect(calcTeamMatchPoints('Brazil', [])).toBe(0)
  })

  it('returns 0 when team is not in any match', () => {
    const matches: MatchResult[] = [
      { home_team: 'France', away_team: 'Germany', home_goals: 2, away_goals: 1 },
    ]
    expect(calcTeamMatchPoints('Brazil', matches)).toBe(0)
  })

  it('win as home team: win bonus + goals', () => {
    // 3-1: win (3p) + 3 goals (3p) = 6
    const matches: MatchResult[] = [
      { home_team: 'Brazil', away_team: 'Germany', home_goals: 3, away_goals: 1 },
    ]
    expect(calcTeamMatchPoints('Brazil', matches)).toBe(6)
  })

  it('win as away team: win bonus + goals', () => {
    // Brazil wins 2-0 away: win (3p) + 2 goals (2p) = 5
    const matches: MatchResult[] = [
      { home_team: 'Germany', away_team: 'Brazil', home_goals: 0, away_goals: 2 },
    ]
    expect(calcTeamMatchPoints('Brazil', matches)).toBe(5)
  })

  it('draw: draw bonus + goals', () => {
    // 1-1: draw (1p) + 1 goal (1p) = 2
    const matches: MatchResult[] = [
      { home_team: 'Brazil', away_team: 'Germany', home_goals: 1, away_goals: 1 },
    ]
    expect(calcTeamMatchPoints('Brazil', matches)).toBe(2)
  })

  it('0-0 draw gives only draw bonus', () => {
    const matches: MatchResult[] = [
      { home_team: 'Brazil', away_team: 'Germany', home_goals: 0, away_goals: 0 },
    ]
    expect(calcTeamMatchPoints('Brazil', matches)).toBe(1)
  })

  it('loss with goals: only goal points, no win/draw bonus', () => {
    // 1-3 loss: 1 goal (1p)
    const matches: MatchResult[] = [
      { home_team: 'Brazil', away_team: 'Germany', home_goals: 1, away_goals: 3 },
    ]
    expect(calcTeamMatchPoints('Brazil', matches)).toBe(1)
  })

  it('loss with 0 goals: 0 points', () => {
    const matches: MatchResult[] = [
      { home_team: 'Brazil', away_team: 'Germany', home_goals: 0, away_goals: 2 },
    ]
    expect(calcTeamMatchPoints('Brazil', matches)).toBe(0)
  })

  it('accumulates points across multiple matches', () => {
    const matches: MatchResult[] = [
      { home_team: 'Brazil', away_team: 'Germany', home_goals: 2, away_goals: 0 }, // win: 3+2=5
      { home_team: 'France', away_team: 'Brazil', home_goals: 1, away_goals: 1 },  // draw: 1+1=2
      { home_team: 'Brazil', away_team: 'Spain', home_goals: 0, away_goals: 1 },   // loss: 0
    ]
    expect(calcTeamMatchPoints('Brazil', matches)).toBe(7)
  })
})

describe('calcAdvancementBonus', () => {
  it('returns 0 for null', () => {
    expect(calcAdvancementBonus(null)).toBe(0)
  })

  it('returns 0 for unknown stage', () => {
    expect(calcAdvancementBonus('unknown')).toBe(0)
  })

  it('group = 5', () => {
    expect(calcAdvancementBonus('group')).toBe(5)
  })

  it('r32 = 5 + 10 = 15', () => {
    expect(calcAdvancementBonus('r32')).toBe(15)
  })

  it('r16 = 5 + 10 + 15 = 30', () => {
    expect(calcAdvancementBonus('r16')).toBe(30)
  })

  it('qf = 5 + 10 + 15 + 20 = 50', () => {
    expect(calcAdvancementBonus('qf')).toBe(50)
  })

  it('sf = 50 (intermediate, same as qf)', () => {
    expect(calcAdvancementBonus('sf')).toBe(50)
  })

  it('bronze = 50 + 15 = 65', () => {
    expect(calcAdvancementBonus('bronze')).toBe(65)
  })

  it('silver = 50 + 20 = 70', () => {
    expect(calcAdvancementBonus('silver')).toBe(70)
  })

  it('gold = 50 + 40 = 90', () => {
    expect(calcAdvancementBonus('gold')).toBe(90)
  })
})

describe('calcTeamPoints', () => {
  it('returns zeros for team with no matches and no advancement', () => {
    const result = calcTeamPoints({ team_name: 'Brazil', pot_number: 1 }, [], [])
    expect(result).toEqual({ matchPts: 0, advPts: 0, multiplier: 1, total: 0 })
  })

  it('pot 5 applies ×2 multiplier', () => {
    const matches: MatchResult[] = [
      { home_team: 'Turkey', away_team: 'Germany', home_goals: 1, away_goals: 0 },
    ]
    const result = calcTeamPoints({ team_name: 'Turkey', pot_number: 5 }, matches, [])
    // win 1-0: 3 (win) + 1 (goal) = 4 raw → 4 × 2 = 8
    expect(result.multiplier).toBe(2)
    expect(result.matchPts).toBe(4)
    expect(result.total).toBe(8)
  })

  it('pot 7 applies ×3 multiplier', () => {
    const matches: MatchResult[] = [
      { home_team: 'Australia', away_team: 'Germany', home_goals: 2, away_goals: 0 },
    ]
    const advancement = [{ team_name: 'Australia', stage_reached: 'group' }]
    const result = calcTeamPoints({ team_name: 'Australia', pot_number: 7 }, matches, advancement)
    // matchPts: win(3)+goals(2)=5, advPts: 5, raw=10 → 10 × 3 = 30
    expect(result.multiplier).toBe(3)
    expect(result.total).toBe(30)
  })

  it('sums match points and advancement bonus', () => {
    // matchPts=5 (win 2-0), advPts=5 (group), total=10
    const matches: MatchResult[] = [
      { home_team: 'Brazil', away_team: 'Germany', home_goals: 2, away_goals: 0 },
    ]
    const advancement = [{ team_name: 'Brazil', stage_reached: 'group' }]
    const result = calcTeamPoints({ team_name: 'Brazil', pot_number: 1 }, matches, advancement)
    expect(result.matchPts).toBe(5)
    expect(result.advPts).toBe(5)
    expect(result.total).toBe(10)
  })

  it('handles missing advancement row gracefully', () => {
    const matches: MatchResult[] = [
      { home_team: 'Brazil', away_team: 'Germany', home_goals: 1, away_goals: 0 },
    ]
    const result = calcTeamPoints({ team_name: 'Brazil', pot_number: 1 }, matches, [])
    // win 1-0: 3 (win) + 1 (goal) = 4 matchPts, no advPts
    expect(result.total).toBe(4)
    expect(result.advPts).toBe(0)
  })

  it('gold scenario: all stages reached', () => {
    const matches: MatchResult[] = [
      { home_team: 'Brazil', away_team: 'Germany', home_goals: 2, away_goals: 1 }, // 3+2=5
    ]
    const advancement = [{ team_name: 'Brazil', stage_reached: 'gold' }]
    const result = calcTeamPoints({ team_name: 'Brazil', pot_number: 1 }, matches, advancement)
    expect(result.matchPts).toBe(5)
    expect(result.advPts).toBe(90)
    expect(result.total).toBe(95)
  })
})

describe('calcParticipantPoints', () => {
  it('returns 0 for empty picks', () => {
    expect(calcParticipantPoints([], [], [])).toBe(0)
  })

  it('sums total points across all picks', () => {
    const matches: MatchResult[] = [
      { home_team: 'Brazil', away_team: 'Germany', home_goals: 2, away_goals: 0 }, // Brazil: win(3)+goals(2)=5
      { home_team: 'France', away_team: 'Spain', home_goals: 1, away_goals: 1 },   // France: draw(1)+goal(1)=2
    ]
    const picks = [
      { team_name: 'Brazil', pot_number: 1 },
      { team_name: 'France', pot_number: 2 },
    ]
    expect(calcParticipantPoints(picks, matches, [])).toBe(7)
  })

  it('ignores picks whose teams have no results yet', () => {
    const picks = [
      { team_name: 'Brazil', pot_number: 1 },
      { team_name: 'Japan', pot_number: 5 },
    ]
    const matches: MatchResult[] = [
      { home_team: 'Brazil', away_team: 'Germany', home_goals: 1, away_goals: 0 },
    ]
    // Brazil: 4p, Japan: 0p
    expect(calcParticipantPoints(picks, matches, [])).toBe(4)
  })
})
