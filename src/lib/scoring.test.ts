import { describe, it, expect } from 'vitest'
import { calcAdvancementBonus, calcPlayerPoints, calcParticipantPoints, isPlayerEliminated } from './scoring'

describe('calcAdvancementBonus', () => {
  it('returns 0 when no stage reached', () => {
    expect(calcAdvancementBonus(null)).toBe(0)
  })

  it('is cumulative through the stage order', () => {
    expect(calcAdvancementBonus('r1')).toBe(5)
    expect(calcAdvancementBonus('r2')).toBe(10)
    expect(calcAdvancementBonus('r3')).toBe(20)
    expect(calcAdvancementBonus('r4')).toBe(30)
    expect(calcAdvancementBonus('qf')).toBe(45)
    expect(calcAdvancementBonus('sf')).toBe(65)
    expect(calcAdvancementBonus('final')).toBe(90)
    expect(calcAdvancementBonus('winner')).toBe(125)
  })

  it('returns 0 for an unknown stage', () => {
    expect(calcAdvancementBonus('group')).toBe(0)
  })
})

describe('calcPlayerPoints', () => {
  it('multiplies advancement points by the pot multiplier', () => {
    const pick = { player_name: 'Luke Littler', pot_number: 1 }
    const advancement = [{ player_name: 'Luke Littler', stage_reached: 'qf' }]
    const result = calcPlayerPoints(pick, advancement)
    expect(result.advPts).toBe(45)
    expect(result.multiplier).toBe(1)
    expect(result.total).toBe(45)
  })

  it('applies the underdog multiplier for lower pots', () => {
    const pick = { player_name: 'Owen Bates', pot_number: 5 }
    const advancement = [{ player_name: 'Owen Bates', stage_reached: 'r2' }]
    const result = calcPlayerPoints(pick, advancement)
    expect(result.multiplier).toBe(3)
    expect(result.total).toBe(30)
  })

  it('returns 0 total when the player has no advancement row', () => {
    const pick = { player_name: 'Ukjent Spiller', pot_number: 2 }
    const result = calcPlayerPoints(pick, [])
    expect(result.total).toBe(0)
  })
})

describe('calcParticipantPoints', () => {
  it('sums points across all picks', () => {
    const picks = [
      { player_name: 'A', pot_number: 1 },
      { player_name: 'B', pot_number: 5 },
    ]
    const advancement = [
      { player_name: 'A', stage_reached: 'r1' },
      { player_name: 'B', stage_reached: 'r1' },
    ]
    // A: 5 * 1 = 5, B: 5 * 3 = 15
    expect(calcParticipantPoints(picks, advancement)).toBe(20)
  })
})

describe('isPlayerEliminated', () => {
  it('is false when the player has no recorded matches', () => {
    expect(isPlayerEliminated('Luke Littler', [])).toBe(false)
  })

  it('is false when the player won their last recorded match', () => {
    const matches = [{ player1: 'A', player2: 'B', sets1: 6, sets2: 2, stage: 'r1', winner: 'A' }]
    expect(isPlayerEliminated('A', matches)).toBe(false)
  })

  it('is true when the player lost a recorded match', () => {
    const matches = [{ player1: 'A', player2: 'B', sets1: 2, sets2: 6, stage: 'r1', winner: 'B' }]
    expect(isPlayerEliminated('A', matches)).toBe(true)
  })
})
