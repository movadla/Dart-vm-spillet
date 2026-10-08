import { describe, it, expect } from 'vitest'
import { getPlayerMatches, isPlayerEliminated, isPlayerChampion, furthestStageReached } from './scoring'

const mt = (stage: string, player1: string, player2: string, winner: string) =>
  ({ player1, player2, sets1: winner === player1 ? 5 : 2, sets2: winner === player1 ? 2 : 5, stage, winner })

describe('isPlayerEliminated', () => {
  it('er false uten registrerte kamper', () => {
    expect(isPlayerEliminated('A', [])).toBe(false)
  })

  it('er false etter en tapt gruppekamp — i en round robin er man ikke ute av det', () => {
    expect(isPlayerEliminated('A', [mt('group', 'A', 'B', 'B')])).toBe(false)
  })

  it('er true når spilleren taper en sluttspillkamp', () => {
    const matches = [mt('group', 'A', 'B', 'A'), mt('r16', 'A', 'C', 'C')]
    expect(isPlayerEliminated('A', matches)).toBe(true)
  })

  it('er false når spilleren vant sin siste sluttspillkamp', () => {
    const matches = [mt('group', 'A', 'B', 'A'), mt('r16', 'A', 'C', 'A')]
    expect(isPlayerEliminated('A', matches)).toBe(false)
  })

  it('en gruppevinner som venter på første sluttspillkamp regnes ikke som ute mens siste 16 pågår', () => {
    const matches = [mt('group', 'A', 'B', 'A'), mt('r16', 'X', 'Y', 'X')]
    expect(isPlayerEliminated('A', matches)).toBe(false)
  })

  it('en spiller uten sluttspillkamp er ute først når kvartfinalene har startet', () => {
    const matches = [mt('group', 'A', 'B', 'B'), mt('r16', 'X', 'Y', 'X'), mt('qf', 'X', 'Z', 'X')]
    expect(isPlayerEliminated('A', matches)).toBe(true)
    expect(isPlayerEliminated('B', matches)).toBe(true) // B vant gruppekampen, men spilte aldri siste 16
  })
})

describe('isPlayerChampion', () => {
  it('er true kun ved seier i finalen', () => {
    const matches = [{ player1: 'A', player2: 'B', sets1: 16, sets2: 11, stage: 'final', winner: 'A' }]
    expect(isPlayerChampion('A', matches)).toBe(true)
    expect(isPlayerChampion('B', matches)).toBe(false)
  })
})

describe('getPlayerMatches', () => {
  it('filtrerer bort andre spilleres kamper og sorterer kronologisk uansett rekkefølgen de ble lagt inn', () => {
    const matches = [
      mt('r16', 'A', 'C', 'A'),
      mt('group', 'X', 'Y', 'X'), // andre spillere
      mt('group', 'B', 'A', 'A'),
      mt('qf', 'A', 'D', 'D'),
    ]
    const mine = getPlayerMatches('A', matches)
    expect(mine.map((m) => m.stage)).toEqual(['group', 'r16', 'qf'])
    expect(mine.every((m) => m.player1 === 'A' || m.player2 === 'A')).toBe(true)
  })

  it('returnerer tom liste uten registrerte kamper', () => {
    expect(getPlayerMatches('A', [])).toEqual([])
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
