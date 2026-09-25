import { describe, expect, it } from 'vitest'
import { getFirstMatchInfo, getNextMatch, R1_MATCHES } from './bracketProjection'
import { POTS } from '@/data/pots'
import type { MatchResult } from './scoring'

const ALL_PLAYERS = POTS.flatMap((p) => p.players)

function m(stage: string, player1: string, sets1: number, player2: string, sets2: number): MatchResult {
  return { stage, player1, player2, sets1, sets2, winner: sets1 > sets2 ? player1 : player2 }
}

describe('getNextMatch', () => {
  it('før noen kamper: neste kamp er runde 1-trekningen', () => {
    const p = ALL_PLAYERS[0]
    const info = getFirstMatchInfo(p.name)!
    const next = getNextMatch(p.name, [])
    expect(next).toEqual({ stage: 'r1', opponent: info.opponent.name, isFiller: info.opponent.isFiller, confirmed: true })
  })

  it('slått ut eller VM-vinner har ingen neste kamp', () => {
    const p = ALL_PLAYERS[0]
    const opp = getFirstMatchInfo(p.name)!.opponent.name
    expect(getNextMatch(p.name, [m('r1', p.name, 1, opp, 3)])).toBeNull() // tapte
    expect(getNextMatch(opp, [m('final', opp, 7, 'noen andre', 3)])).toBeNull() // vant finalen
  })

  it('løser ekte runde 2-motstander når begge feeder-kampene i det paret er avgjort', () => {
    // Halve 128-feltet er plasseringsspillere ("Kvalifisert spiller N") — helt
    // reelt i dagens datasett — så vi bruker de faktiske round2Pair-navnene
    // (uansett om de er navngitte eller plassholdere), akkurat som admin
    // faktisk registrerer resultater i dag.
    const candidate = ALL_PLAYERS[0]
    const info = getFirstMatchInfo(candidate.name)!
    const [a, b] = info.round2Pair
    const matches = [
      m('r1', candidate.name, 3, info.opponent.name, 1), // jeg vinner min r1-kamp
      m('r1', a.name, 3, b.name, 0), // den andre r1-kampen i mitt r2-par er avgjort
    ]
    const next = getNextMatch(candidate.name, matches)
    expect(next).toEqual({ stage: 'r2', opponent: a.name, isFiller: a.isFiller, confirmed: true })
  })

  it('runde 2 uavgjort ennå: gir ikke en bekreftet motstander', () => {
    const candidate = ALL_PLAYERS[0]
    const info = getFirstMatchInfo(candidate.name)!
    const matches = [m('r1', candidate.name, 3, info.opponent.name, 1)]
    const next = getNextMatch(candidate.name, matches)
    expect(next?.stage).toBe('r2')
    expect(next?.confirmed).toBe(false)
  })

  it('ukjent spiller gir null', () => {
    expect(getNextMatch('Finnes Ikke', [])).toBeNull()
  })

  it('alle 64 runde 1-kamper er dekket (sanity på selve trekningen)', () => {
    expect(R1_MATCHES).toHaveLength(64)
  })
})
