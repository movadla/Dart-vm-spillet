import { describe, it, expect } from 'vitest'
import { playerFinishLevel, participantLevel, computePrizeStanding } from './prize'
import type { MatchResult, PickWithPot } from './scoring'

const STAGES = ['group', 'r16', 'qf', 'sf', 'final'] as const

function m(player1: string, player2: string, stage: string, winner: string | null): MatchResult {
  return { player1, player2, sets1: 0, sets2: 0, stage, winner }
}
function picks(...names: string[]): PickWithPot[] {
  return names.map((player_name, i) => ({ pot_number: i + 1, player_name }))
}

describe('playerFinishLevel', () => {
  it('er 0 uten kamper', () => {
    expect(playerFinishLevel('A', [], STAGES)).toBe(0)
  })

  it('følger siste runde spilleren har spilt', () => {
    const ms = [m('A', 'B', 'group', 'A'), m('A', 'C', 'r16', 'C')]
    expect(playerFinishLevel('A', ms, STAGES)).toBe(2) // r16, tapte
    expect(playerFinishLevel('C', ms, STAGES)).toBe(2)
    expect(playerFinishLevel('B', ms, STAGES)).toBe(1) // ute i gruppen
  })

  it('finalisten er ett nivå under vinneren', () => {
    const ms = [m('A', 'B', 'final', 'A')]
    expect(playerFinishLevel('A', ms, STAGES)).toBe(STAGES.length + 1)
    expect(playerFinishLevel('B', ms, STAGES)).toBe(STAGES.length)
  })

  it('en finale uten registrert vinner gjør ingen til vinner', () => {
    const ms = [m('A', 'B', 'final', null)]
    expect(playerFinishLevel('A', ms, STAGES)).toBe(STAGES.length)
  })

  it('ignorerer ukjente stadier', () => {
    expect(playerFinishLevel('A', [m('A', 'B', 'r1', 'A')], STAGES)).toBe(0)
  })
})

describe('participantLevel', () => {
  it('tar det beste valget', () => {
    const ms = [m('A', 'B', 'sf', 'A'), m('C', 'D', 'qf', 'C')]
    expect(participantLevel(picks('B', 'C', 'X', 'Y'), ms, STAGES)).toBe(4) // B kom til sf
  })
})

describe('computePrizeStanding', () => {
  const field = new Map<string, PickWithPot[]>([
    ['p1', picks('Champ', 'W1', 'W2', 'W3')],
    ['p2', picks('Champ', 'X1', 'X2', 'X3')],
    ['p3', picks('Runner', 'Y1', 'Y2', 'Y3')],
    ['p4', picks('Semi', 'Z1', 'Z2', 'Z3')],
  ])

  it('deler premien mellom alle som har vinneren', () => {
    const ms = [m('Champ', 'Runner', 'final', 'Champ')]
    const s = computePrizeStanding(field, ms, STAGES)
    expect(s.sharers.sort()).toEqual(['p1', 'p2'])
    expect(s.final).toBe(true)
    expect(s.rollover).toBe(false)
  })

  it('faller tilbake til den som har finalisten når ingen har vinneren', () => {
    const ms = [m('Outsider', 'Runner', 'final', 'Outsider')]
    const s = computePrizeStanding(field, ms, STAGES)
    expect(s.sharers).toEqual(['p3'])
  })

  it('faller tilbake til semifinalistene (flere deler) når heller ingen har finalisten', () => {
    const many = new Map<string, PickWithPot[]>([
      ['a', picks('SF1', 'x', 'y', 'z')],
      ['b', picks('SF2', 'x', 'y', 'z')],
      ['c', picks('Out', 'x', 'y', 'z')],
    ])
    const ms = [
      m('SF1', 'F1', 'sf', 'F1'), m('SF2', 'F2', 'sf', 'F2'),
      m('F1', 'F2', 'final', 'F1'),
    ]
    const s = computePrizeStanding(many, ms, STAGES)
    expect(s.sharers.sort()).toEqual(['a', 'b'])
  })

  it('er ikke endelig før finalen er spilt — begge semifinalistene teller på samme nivå', () => {
    const ms = [m('Champ', 'Runner', 'sf', 'Champ')]
    const s = computePrizeStanding(field, ms, STAGES)
    expect(s.final).toBe(false)
    expect(s.sharers.sort()).toEqual(['p1', 'p2', 'p3'])
  })

  it('overføres når ingen har en spiller som kom ut av gruppespillet', () => {
    const ms = [m('Champ', 'Other', 'group', 'Champ')]
    const s = computePrizeStanding(field, ms, STAGES)
    expect(s.rollover).toBe(true)
  })

  it('har ingen delere før noe er spilt', () => {
    const s = computePrizeStanding(field, [], STAGES)
    expect(s.sharers).toEqual([])
    expect(s.topLevel).toBe(0)
    expect(s.rollover).toBe(true)
  })
})
