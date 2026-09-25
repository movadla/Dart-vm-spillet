import { describe, expect, it } from 'vitest'
import { buildRankRows, groupPicks, rankAmong } from './ranking'
import { calcParticipantPoints, type MatchResult } from './scoring'

const m = (stage: string, player1: string, sets1: number, player2: string, sets2: number): MatchResult =>
  ({ stage, player1, player2, sets1, sets2, winner: sets1 > sets2 ? player1 : player2 })

const picks = [
  { participant_id: 'a', pot_number: 1, player_name: 'Luke Littler' },
  { participant_id: 'a', pot_number: 6, player_name: 'Luke Woodhouse' },
  { participant_id: 'b', pot_number: 1, player_name: 'Luke Humphries' },
  { participant_id: 'b', pot_number: 6, player_name: 'Martin Schindler' },
  { participant_id: 'c', pot_number: 1, player_name: 'Luke Littler' },
  { participant_id: 'c', pot_number: 6, player_name: 'Martin Schindler' },
]
const participants = [
  { id: 'a', name: 'A', created_at: '2026-09-10T00:00:00Z' },
  { id: 'b', name: 'B', created_at: '2026-09-11T00:00:00Z' },
  { id: 'c', name: 'C', created_at: '2026-09-09T00:00:00Z' },
]
const matches = [
  m('r2', 'Luke Littler', 3, 'Kevin Doets', 0),
  m('r2', 'Luke Woodhouse', 1, 'Andrew Gilding', 3),
  m('final', 'Luke Humphries', 7, 'Martin Schindler', 5),
]

describe('ranking', () => {
  it('grupperer picks per deltaker', () => {
    const by = groupPicks(picks)
    expect(by.size).toBe(3)
    expect(by.get('a')?.map((p) => p.player_name)).toEqual(['Luke Littler', 'Luke Woodhouse'])
  })

  it('rankAmong = antall med flere poeng + 1', () => {
    const by = groupPicks(picks)
    const mine = calcParticipantPoints(by.get('a')!, matches)
    expect(rankAmong(mine, by, matches)).toBe(rankAmong(mine, by, matches))
    expect(rankAmong(Number.MAX_SAFE_INTEGER, by, matches)).toBe(1)
    expect(rankAmong(-1, by, matches)).toBe(4)
  })

  it('sorterer etter poeng, deretter påmeldingstid, og setter flagg/medaljer', () => {
    const rows = buildRankRows(participants, picks, matches, { a: 3, b: 1 }, true)
    expect(rows.map((r) => r.id)).toEqual(['b', 'c', 'a'])
    // B: Humphries vant finalen → gull, Schindler tapte finalen → sølv
    expect(rows[0].flags.map((f) => f.medal)).toEqual(['gold', 'silver'])
    // A: Woodhouse slått ut i r2
    expect(rows[2].flags[1].eliminated).toBe(true)
    // rankDelta = baseline − ny plass
    expect(rows[2].rankDelta).toBe(3 - 3)
    expect(rows[0].rankDelta).toBe(1 - 1)
    expect(rows[1].rankDelta).toBeUndefined()
  })

  it('før VM: like poeng → påmeldingsrekkefølge, ingen rankDelta', () => {
    const rows = buildRankRows(participants, picks, [], { a: 1 }, false)
    expect(rows.map((r) => r.id)).toEqual(['c', 'a', 'b'])
    expect(rows.every((r) => r.rankDelta === undefined)).toBe(true)
  })
})
