import { describe, expect, it } from 'vitest'
import { POTS, getPickablePlayers } from '@/data/pots'
import { STAGE_ORDER } from '@/config/scoring'
import { getDrawSections, getPathToFinal } from './bracketProjection'

describe('getPathToFinal', () => {
  it('gir stigende runder, ingen motstander to ganger og aldri spilleren selv', () => {
    for (const pot of POTS) {
      for (const p of getPickablePlayers(pot)) {
        const path = getPathToFinal(p.name)
        expect(path.length).toBeGreaterThan(0)
        const stageIdx = path.map((s) => STAGE_ORDER.indexOf(s.stage))
        expect([...stageIdx].sort((a, b) => a - b)).toEqual(stageIdx)
        expect(new Set(path.map((s) => s.opponent)).size).toBe(path.length)
        expect(path.some((s) => s.opponent === p.name)).toBe(false)
      }
    }
  })

  it('seed 1 og seed 2 møtes først i finalen', () => {
    const seed1 = POTS.flatMap((p) => p.players).find((p) => p.seedNumber === 1)!
    const seed2 = POTS.flatMap((p) => p.players).find((p) => p.seedNumber === 2)!
    const path = getPathToFinal(seed1.name)
    const final = path.find((s) => s.stage === 'final')
    expect(final?.opponent).toBe(seed2.name)
    expect(path.filter((s) => s.stage !== 'final').some((s) => s.opponent === seed2.name)).toBe(false)
  })
})

describe('getDrawSections', () => {
  it('dekker alle 16 runde 1-kamper i 4 seksjoner à 4', () => {
    const sections = getDrawSections()
    expect(sections).toHaveLength(4)
    expect(sections.every((s) => s.matches.length === 4)).toBe(true)
    const names = sections.flatMap((s) => s.matches.flat())
    expect(new Set(names).size).toBe(32)
  })
})
