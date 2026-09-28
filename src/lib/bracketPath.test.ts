import { describe, expect, it } from 'vitest'
import { POTS, getPickablePlayers } from '@/data/pots'
import { STAGE_ORDER } from '@/config/scoring'
import type { MatchResult } from './scoring'
import { getDrawSections, getPathToFinal, getNextMatch } from './bracketProjection'

describe('getPathToFinal', () => {
  it('gir stigende runder og aldri spilleren selv som motstander', () => {
    for (const pot of POTS) {
      for (const p of getPickablePlayers(pot)) {
        const path = getPathToFinal(p.name)
        expect(path.length).toBeGreaterThan(0)
        const stageIdx = path.map((s) => STAGE_ORDER.indexOf(s.stage))
        expect([...stageIdx].sort((a, b) => a - b)).toEqual(stageIdx)
        expect(path.some((s) => s.opponent === p.name)).toBe(false)
        // Ikke-null motstandere skal fortsatt være innbyrdes ulike — men flere
        // steg kan ha opponent: null samtidig (se REGRESJON-testen under for
        // hvorfor det er riktig, ikke en feil).
        const named = path.map((s) => s.opponent).filter((o): o is string => o !== null)
        expect(new Set(named).size).toBe(named.length)
      }
    }
  })

  it('runde 1 er alltid den ekte, bekreftede trekningen (aldri kandidat-par eller «ikke bestemt»)', () => {
    for (const pot of POTS) {
      for (const p of getPickablePlayers(pot)) {
        const r1 = getPathToFinal(p.name).find((s) => s.stage === 'r1')
        expect(r1?.confirmed).toBe(true)
        expect(r1?.opponent).not.toBeNull()
        expect(r1?.candidates).toBeUndefined()
      }
    }
  })

  it('REGRESJON: runde 2-motstander vises IKKE som ett bestemt navn før den avgjørende kampen faktisk er spilt', () => {
    // Samme situasjon brukeren fant i produksjon: Noppert hadde vunnet runde
    // 1, men runde 2-motstanderen hans (vinneren av van Gerwen vs. Joyce) ble
    // vist som "van Gerwen" — selv om DEN kampen ikke var spilt ennå. Riktig
    // oppførsel: vis begge som kandidater, ikke lat som om det er avgjort.
    const step = getPathToFinal('Danny Noppert', []).find((s) => s.stage === 'r2')
    expect(step?.confirmed).toBe(false)
    expect(step?.opponent).toBeNull()
    expect(step?.candidates?.sort()).toEqual(['Michael van Gerwen', 'Ryan Joyce'].sort())
  })

  it('REGRESJON: samme steg blir bekreftet med ett navn så snart den avgjørende kampen er registrert', () => {
    const matches: MatchResult[] = [
      { player1: 'Michael van Gerwen', player2: 'Ryan Joyce', sets1: 2, sets2: 0, stage: 'r1', winner: 'Michael van Gerwen' },
    ]
    const step = getPathToFinal('Danny Noppert', matches).find((s) => s.stage === 'r2')
    expect(step).toMatchObject({ opponent: 'Michael van Gerwen', confirmed: true })
    expect(step?.candidates).toBeUndefined()
  })

  it('kvartfinale og senere uten noen spilte kamper er for usikkert til å liste — «ikke bestemt», ikke et gjettet navn', () => {
    const step = getPathToFinal('Danny Noppert', []).find((s) => s.stage === 'qf')
    expect(step?.opponent).toBeNull()
    expect(step?.candidates).toBeUndefined()
    expect(step?.confirmed).toBe(false)
  })
})

describe('getNextMatch', () => {
  it('REGRESJON: neste kamp for en spiller som har vunnet runde 1 viser kandidat-par, ikke ett gjettet navn', () => {
    const matches: MatchResult[] = [
      { player1: 'Danny Noppert', player2: 'Niko Springer', sets1: 2, sets2: 1, stage: 'r1', winner: 'Danny Noppert' },
    ]
    const next = getNextMatch('Danny Noppert', matches)
    expect(next?.stage).toBe('r2')
    expect(next?.confirmed).toBe(false)
    expect(next?.opponent).toBeNull()
    expect(next?.candidates?.sort()).toEqual(['Michael van Gerwen', 'Ryan Joyce'].sort())
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
