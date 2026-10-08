import { describe, expect, it } from 'vitest'
import { pickRandom, pickRandomTeam } from './random'

describe('pickRandom', () => {
  it('velger elementet rng peker på', () => {
    expect(pickRandom(['a', 'b', 'c', 'd'], () => 0)).toBe('a')
    expect(pickRandom(['a', 'b', 'c', 'd'], () => 0.5)).toBe('c')
    expect(pickRandom(['a', 'b', 'c', 'd'], () => 0.99)).toBe('d')
  })

  it('havner aldri utenfor listen, selv om rng gir akkurat 1', () => {
    expect(pickRandom(['a', 'b'], () => 1)).toBe('b')
  })

  it('kaster på tom liste', () => {
    expect(() => pickRandom([])).toThrow()
  })

  it('gir alle elementer en sjanse (Math.random)', () => {
    const seen = new Set<number>()
    for (let i = 0; i < 400; i++) seen.add(pickRandom([1, 2, 3, 4]))
    expect(seen.size).toBe(4)
  })
})

describe('pickRandomTeam', () => {
  const pots = [
    { potNumber: 1, players: [{ name: 'A' }, { name: 'B' }] },
    { potNumber: 2, players: [{ name: 'C' }] },
    { potNumber: 3, players: [] },
    { potNumber: 4, players: [{ name: 'D' }, { name: 'E' }, { name: 'F' }] },
  ]

  it('velger én spiller fra hver pott som har spillere, og hopper over tomme', () => {
    const team = pickRandomTeam(pots, () => 0)
    expect(team).toEqual({ 1: 'A', 2: 'C', 4: 'D' })
  })

  it('velger alltid en spiller som faktisk finnes i den potten', () => {
    for (let i = 0; i < 100; i++) {
      const team = pickRandomTeam(pots)
      expect(['A', 'B']).toContain(team[1])
      expect(team[2]).toBe('C')
      expect(['D', 'E', 'F']).toContain(team[4])
    }
  })
})
