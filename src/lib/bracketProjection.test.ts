import { describe, it, expect } from 'vitest'
import { getFirstMatchInfo, getBracketSection, R1_MATCHES } from './bracketProjection'
import { POTS } from '@/data/pots'

const ALL_PLAYERS = POTS.flatMap((p) => p.players)

describe('bracketProjection', () => {
  it('has exactly 32 round 1 matches covering 64 distinct players', () => {
    expect(R1_MATCHES).toHaveLength(32)
    const names = new Set(R1_MATCHES.flat())
    expect(names.size).toBe(64)
  })

  it('gives every seeded player a bye with a waiting round-1 pair', () => {
    const seeded = ALL_PLAYERS.filter((p) => p.seedNumber != null)
    expect(seeded).toHaveLength(32)
    for (const p of seeded) {
      const info = getFirstMatchInfo(p.name)
      expect(info?.type).toBe('bye')
    }
  })

  it('gives every named unseeded player a direct round-1 opponent', () => {
    const unseeded = ALL_PLAYERS.filter((p) => p.seedNumber == null)
    expect(unseeded).toHaveLength(32)
    for (const p of unseeded) {
      const info = getFirstMatchInfo(p.name)
      expect(info?.type).toBe('match')
    }
  })

  it('returns 7 other seeds in the same bracket section', () => {
    const someSeed = ALL_PLAYERS.find((p) => p.seedNumber === 1)!
    const section = getBracketSection(someSeed.name)
    expect(section).toHaveLength(7)
    expect(section).not.toContain(someSeed.name)
  })

  it('seed 1 and seed 2 are not in the same section (opposite halves of the draw)', () => {
    const seed1 = ALL_PLAYERS.find((p) => p.seedNumber === 1)!
    const seed2 = ALL_PLAYERS.find((p) => p.seedNumber === 2)!
    const section1 = getBracketSection(seed1.name)
    expect(section1).not.toContain(seed2.name)
  })
})
