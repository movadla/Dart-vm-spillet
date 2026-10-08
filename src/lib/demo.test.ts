import { describe, expect, it } from 'vitest'
import { DEMO_LEAGUES, DEMO_PARTICIPANTS, demoTeamsAreValid, getDemoMatches, isDemoId, isDemoLeagueCode, parseDemoPhase } from './demo'
import { STAGE_ORDER } from '@/config/scoring'
import { isPlayerChampion, isPlayerEliminated } from './scoring'
import { bestFinishLevel, summarizePrize } from './prize'
import { groupPicks } from './ranking'

describe('demo-verdenen', () => {
  it('alle demo-lag består av valgbare spillere, én per pott', () => {
    expect(demoTeamsAreValid()).toBe(true)
    for (const p of DEMO_PARTICIPANTS) {
      expect(p.picks.map((pk) => pk.pot_number)).toEqual([1, 2, 3, 4])
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
    expect(bestFinishLevel(me.picks, getDemoMatches('for'))).toBe(0)
    const live = bestFinishLevel(me.picks, getDemoMatches('live'))
    const done = bestFinishLevel(me.picks, getDemoMatches('ferdig'))
    expect(live).toBeGreaterThan(0)
    expect(done).toBeGreaterThan(live)
    expect(isPlayerChampion('Luke Humphries', getDemoMatches('ferdig'))).toBe(true)
    // Slått ut i siste 16 allerede underveis
    expect(isPlayerEliminated('Ryan Searle', getDemoMatches('live'))).toBe(true)
  })

  it('etter finalen deler de som har vinneren premien', () => {
    const by = groupPicks(DEMO_PARTICIPANTS.flatMap((p) => p.picks.map((pk) => ({ ...pk, participant_id: p.id }))))
    const prize = summarizePrize(by, getDemoMatches('ferdig'))
    expect(prize.final).toBe(true)
    expect(prize.rollover).toBe(false)
    const holders = DEMO_PARTICIPANTS.filter((p) => p.picks.some((pk) => pk.player_name === 'Luke Humphries'))
    expect(prize.sharerCount).toBe(holders.length)
    expect(holders.length).toBeGreaterThan(1)
  })
})
