import { describe, it, expect } from 'vitest'
import { getFirstMatchInfo, getBracketSection, R1_MATCHES } from './bracketProjection'
import { POTS } from '@/data/pots'

const ALL_PLAYERS = POTS.flatMap((p) => p.players)

describe('bracketProjection', () => {
  it('har 64 runde 1-kamper som dekker 128 distinkte spillere (ingen walkover)', () => {
    expect(R1_MATCHES).toHaveLength(64)
    const names = new Set(R1_MATCHES.flat())
    expect(names.size).toBe(128)
  })

  it('gir alle navngitte spillere en direkte runde 1-motstander', () => {
    for (const p of ALL_PLAYERS) {
      const info = getFirstMatchInfo(p.name)
      expect(info).not.toBeNull()
      expect(info!.opponent.name).not.toBe(p.name)
    }
  })

  it('runde 2-paret er den andre kampen som feeder samme runde 2-slot', () => {
    const someSeed = ALL_PLAYERS.find((p) => p.seedNumber === 1)!
    const info = getFirstMatchInfo(someSeed.name)!
    expect(info.round2Pair).toHaveLength(2)
    // Runde 2-paret skal ikke inneholde spilleren selv eller hans egen runde 1-motstander.
    expect(info.round2Pair.map((s) => s.name)).not.toContain(someSeed.name)
    expect(info.round2Pair.map((s) => s.name)).not.toContain(info.opponent.name)
  })

  it('returnerer 7 andre seeder i samme del av braketten', () => {
    const someSeed = ALL_PLAYERS.find((p) => p.seedNumber === 1)!
    const section = getBracketSection(someSeed.name)
    expect(section.length).toBeGreaterThan(0)
    expect(section).not.toContain(someSeed.name)
  })

  it('seed 1 og seed 2 er ikke i samme del av braketten (motsatte halvdeler)', () => {
    const seed1 = ALL_PLAYERS.find((p) => p.seedNumber === 1)!
    const seed2 = ALL_PLAYERS.find((p) => p.seedNumber === 2)!
    const section1 = getBracketSection(seed1.name)
    expect(section1).not.toContain(seed2.name)
  })
})
