import { describe, it, expect } from 'vitest'
import { calcPlayerPoints, calcParticipantPoints, isPlayerEliminated, isPlayerChampion, furthestStageReached } from './scoring'

describe('calcPlayerPoints', () => {
  it('gir 1p per vunnet sett og 2p per kampseier', () => {
    const pick = { player_name: 'A', pot_number: 1 }
    const matches = [
      { player1: 'A', player2: 'B', sets1: 6, sets2: 2, stage: 'r1', winner: 'A' },
    ]
    const result = calcPlayerPoints(pick, matches)
    expect(result.setPts).toBe(6)
    expect(result.advPts).toBe(2)
    expect(result.winnerBonus).toBe(0)
    expect(result.multiplier).toBe(1)
    expect(result.total).toBe(8)
  })

  it('teller sett også fra tapte kamper, men ikke avansement-poeng', () => {
    const pick = { player_name: 'A', pot_number: 1 }
    const matches = [
      { player1: 'A', player2: 'B', sets1: 3, sets2: 6, stage: 'r1', winner: 'B' },
    ]
    const result = calcPlayerPoints(pick, matches)
    expect(result.setPts).toBe(3)
    expect(result.advPts).toBe(0)
    expect(result.total).toBe(3)
  })

  it('gir turneringsseier-bonus kun ved seier i finalen', () => {
    const pick = { player_name: 'A', pot_number: 1 }
    const matches = [
      { player1: 'A', player2: 'B', sets1: 6, sets2: 2, stage: 'sf', winner: 'A' },
      { player1: 'A', player2: 'C', sets1: 7, sets2: 3, stage: 'final', winner: 'A' },
    ]
    const result = calcPlayerPoints(pick, matches)
    expect(result.setPts).toBe(13)
    expect(result.advPts).toBe(4)
    expect(result.winnerBonus).toBe(5)
    expect(result.total).toBe(22)
  })

  it('multipliserer totalsummen med pott-multiplikatoren', () => {
    const pick = { player_name: 'A', pot_number: 6 }
    const matches = [
      { player1: 'A', player2: 'B', sets1: 3, sets2: 1, stage: 'r1', winner: 'A' },
    ]
    const result = calcPlayerPoints(pick, matches)
    expect(result.multiplier).toBe(4)
    expect(result.total).toBe((3 + 2) * 4)
  })

  it('returnerer 0 for en spiller uten registrerte kamper', () => {
    const result = calcPlayerPoints({ player_name: 'Ukjent', pot_number: 2 }, [])
    expect(result.total).toBe(0)
  })
})

describe('calcParticipantPoints', () => {
  it('summerer poeng på tvers av alle picks', () => {
    const picks = [
      { player_name: 'A', pot_number: 1 },
      { player_name: 'B', pot_number: 6 },
    ]
    const matches = [
      { player1: 'A', player2: 'X', sets1: 6, sets2: 0, stage: 'r1', winner: 'A' },
      { player1: 'B', player2: 'Y', sets1: 3, sets2: 1, stage: 'r1', winner: 'B' },
    ]
    // A: (6+2)*1 = 8, B: (3+2)*4 = 20
    expect(calcParticipantPoints(picks, matches)).toBe(28)
  })
})

describe('isPlayerEliminated', () => {
  it('er false uten registrerte kamper', () => {
    expect(isPlayerEliminated('A', [])).toBe(false)
  })

  it('er false når spilleren vant sin siste kamp', () => {
    const matches = [{ player1: 'A', player2: 'B', sets1: 6, sets2: 2, stage: 'r1', winner: 'A' }]
    expect(isPlayerEliminated('A', matches)).toBe(false)
  })

  it('er true når spilleren tapte en kamp', () => {
    const matches = [{ player1: 'A', player2: 'B', sets1: 2, sets2: 6, stage: 'r1', winner: 'B' }]
    expect(isPlayerEliminated('A', matches)).toBe(true)
  })
})

describe('isPlayerChampion', () => {
  it('er true kun ved seier i finalen', () => {
    const matches = [{ player1: 'A', player2: 'B', sets1: 7, sets2: 3, stage: 'final', winner: 'A' }]
    expect(isPlayerChampion('A', matches)).toBe(true)
    expect(isPlayerChampion('B', matches)).toBe(false)
  })
})

describe('furthestStageReached', () => {
  const stageOrder = ['r1', 'r2', 'r3'] as const
  it('finner den høyeste runden spilleren har deltatt i', () => {
    const matches = [
      { player1: 'A', player2: 'B', sets1: 6, sets2: 2, stage: 'r1', winner: 'A' },
      { player1: 'A', player2: 'C', sets1: 6, sets2: 4, stage: 'r2', winner: 'A' },
    ]
    expect(furthestStageReached('A', matches, stageOrder)).toBe('r2')
  })

  it('returnerer null uten kamper', () => {
    expect(furthestStageReached('A', [], stageOrder)).toBeNull()
  })
})
