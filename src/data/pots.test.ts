import { describe, expect, it } from 'vitest'
import { POTS, POT_SIZES, buildPots, getPickablePlayers, type Player } from './pots'

const p = (name: string, odds: string, pdcRanking: number): Player =>
  ({ name, nationality: 'England', iso2: 'gb-eng', pdcRanking, seedNumber: null, odds })

describe('buildPots', () => {
  const field = Array.from({ length: 48 }, (_, i) => p(`Spiller ${i + 1}`, String(2 + i * 3), i + 1))

  it('deler feltet i potter på 4 / 4 / 6 / resten', () => {
    const pots = buildPots(field)
    expect(pots.map((x) => x.players.length)).toEqual([4, 4, 6, 34])
    expect(pots.map((x) => x.potNumber)).toEqual([1, 2, 3, 4])
  })

  it('legger hver spiller i nøyaktig én pott', () => {
    const names = buildPots(field).flatMap((x) => x.players.map((pl) => pl.name))
    expect(names).toHaveLength(48)
    expect(new Set(names).size).toBe(48)
  })

  it('sorterer på odds — pott 1 har de laveste oddsene, uavhengig av rekkefølgen i listen', () => {
    const pots = buildPots([...field].reverse())
    const maxOddsPot1 = Math.max(...pots[0].players.map((x) => parseFloat(x.odds)))
    const minOddsPot2 = Math.min(...pots[1].players.map((x) => parseFloat(x.odds)))
    expect(maxOddsPot1).toBeLessThan(minOddsPot2)
  })

  it('bruker PDC-ranking som tie-breaker ved lik odds', () => {
    const tie = [p('B', '10.0', 5), p('A', '10.0', 2), p('C', '10.0', 9), p('D', '1.5', 1), p('E', '20', 3)]
    expect(buildPots(tie, [2]).flatMap((x) => x.players.map((pl) => pl.name))).toEqual(['D', 'A', 'B', 'C', 'E'])
  })

  it('takler et felt som er mindre enn pottene (ingen krasj, tomme siste potter)', () => {
    const pots = buildPots(field.slice(0, 5))
    expect(pots.map((x) => x.players.length)).toEqual([4, 1, 0, 0])
  })
})

describe('POTS (appens faktiske potter)', () => {
  it('har 4 potter med størrelsene fra POT_SIZES, og pott 4 får resten', () => {
    expect(POTS).toHaveLength(POT_SIZES.length + 1)
    POT_SIZES.forEach((size, i) => expect(POTS[i].players.length).toBe(size))
    expect(POTS[POTS.length - 1].players.length).toBeGreaterThan(0)
  })

  it('alle spillere er valgbare', () => {
    for (const pot of POTS) expect(getPickablePlayers(pot)).toEqual(pot.players)
  })
})
