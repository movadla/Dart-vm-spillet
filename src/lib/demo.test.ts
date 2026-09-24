import { describe, expect, it } from 'vitest'
import { DEMO_LEAGUES, DEMO_PARTICIPANTS, demoTeamsAreValid, getDemoMatches, isDemoId, isDemoLeagueCode, parseDemoPhase } from './demo'
import { STAGE_ORDER } from '@/config/scoring'
import { calcParticipantPoints, isPlayerChampion, isPlayerEliminated } from './scoring'

describe('demo-verdenen', () => {
  it('alle demo-lag består av valgbare spillere, én per pott', () => {
    expect(demoTeamsAreValid()).toBe(true)
    for (const p of DEMO_PARTICIPANTS) {
      expect(p.picks.map((pk) => pk.pot_number)).toEqual([1, 2, 3, 4, 5, 6])
    }
  })

  it('id-er og ligakoder gjenkjennes', () => {
    expect(isDemoId('demo')).toBe(true)
    expect(isDemoId('demo-12')).toBe(true)
    expect(isDemoId('demo-x')).toBe(false)
    expect(isDemoId('3f0c…uuid')).toBe(false)
    expect(isDemoLeagueCode('DEMO01')).toBe(true)
    expect(isDemoLeagueCode('demo02')).toBe(true)
    expect(isDemoLeagueCode('WOLF42')).toBe(false)
    expect(parseDemoPhase('live')).toBe('live')
    expect(parseDemoPhase('nope')).toBeNull()
  })

  it('ligaenes medlemmer finnes, og demo-deltakeren er med i begge', () => {
    const ids = new Set(DEMO_PARTICIPANTS.map((p) => p.id))
    for (const l of DEMO_LEAGUES) {
      expect(l.members.every((m) => ids.has(m))).toBe(true)
      expect(l.members).toContain('demo')
      expect(ids.has(l.created_by)).toBe(true)
    }
  })

  it('kampresultatene er konsistente: ingen spiller vinner en kamp etter å ha røket ut', () => {
    for (const phase of ['live', 'ferdig'] as const) {
      const matches = getDemoMatches(phase)
      const outAt = new Map<string, number>()
      for (const m of matches) {
        const idx = STAGE_ORDER.indexOf(m.stage as (typeof STAGE_ORDER)[number])
        expect(idx).toBeGreaterThanOrEqual(0)
        for (const name of [m.player1, m.player2]) {
          const out = outAt.get(name)
          expect(out === undefined || out > idx, `${name} spiller ${m.stage} etter å ha røket ut`).toBe(true)
        }
        const loser = m.winner === m.player1 ? m.player2 : m.player1
        outAt.set(loser, idx)
      }
      // Rundene kommer i stigende rekkefølge
      const idxs = matches.map((m) => STAGE_ORDER.indexOf(m.stage as (typeof STAGE_ORDER)[number]))
      expect(idxs).toEqual([...idxs].sort((a, b) => a - b))
    }
  })

  it('fasene gir tre tydelig ulike tilstander for demo-deltakeren', () => {
    const me = DEMO_PARTICIPANTS[0]
    expect(calcParticipantPoints(me.picks, getDemoMatches('for'))).toBe(0)
    const live = calcParticipantPoints(me.picks, getDemoMatches('live'))
    const done = calcParticipantPoints(me.picks, getDemoMatches('ferdig'))
    expect(live).toBeGreaterThan(0)
    expect(done).toBeGreaterThan(live)
    expect(isPlayerChampion('Luke Littler', getDemoMatches('ferdig'))).toBe(true)
    expect(isPlayerEliminated('Luke Woodhouse', getDemoMatches('live'))).toBe(true)
  })
})
