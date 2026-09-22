import { describe, it, expect } from 'vitest'
import { validateMatchResultInput } from './matchResultValidation'

const STAGES = ['r1', 'r2', 'final'] as const

describe('validateMatchResultInput', () => {
  it('godtar et gyldig resultat og beregner riktig vinner', () => {
    const result = validateMatchResultInput({ player1: 'A', player2: 'B', sets1: 6, sets2: 2, stage: 'r1' }, STAGES)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.winner).toBe('A')
      expect(result.value.stage).toBe('r1')
    }
  })

  it('avviser uavgjort', () => {
    const result = validateMatchResultInput({ player1: 'A', player2: 'B', sets1: 3, sets2: 3, stage: 'r1' }, STAGES)
    expect(result.ok).toBe(false)
  })

  it('avviser samme spiller mot seg selv', () => {
    const result = validateMatchResultInput({ player1: 'A', player2: 'A', sets1: 6, sets2: 2, stage: 'r1' }, STAGES)
    expect(result.ok).toBe(false)
  })

  it('avviser manglende data', () => {
    const result = validateMatchResultInput({ player1: 'A', sets1: 6, sets2: 2 }, STAGES)
    expect(result.ok).toBe(false)
  })

  it('avviser ikke-numeriske sett', () => {
    const result = validateMatchResultInput({ player1: 'A', player2: 'B', sets1: '6', sets2: 2, stage: 'r1' }, STAGES)
    expect(result.ok).toBe(false)
  })

  it('faller tilbake til r1 for en ugyldig stage', () => {
    const result = validateMatchResultInput({ player1: 'A', player2: 'B', sets1: 6, sets2: 2, stage: 'ukjent' }, STAGES)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.stage).toBe('r1')
  })
})
