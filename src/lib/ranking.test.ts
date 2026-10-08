import { describe, expect, it } from 'vitest'
import { buildRankRows, groupPicks, rankAmong } from './ranking'
import { bestFinishLevel } from './prize'
import type { MatchResult } from './scoring'

const m = (stage: string, player1: string, sets1: number, player2: string, sets2: number): MatchResult =>
  ({ stage, player1, player2, sets1, sets2, winner: sets1 > sets2 ? player1 : player2 })

const picks = [
  { participant_id: 'a', pot_number: 1, player_name: 'Luke Littler' },
  { participant_id: 'a', pot_number: 4, player_name: 'Luke Woodhouse' },
  { participant_id: 'b', pot_number: 1, player_name: 'Luke Humphries' },
  { participant_id: 'b', pot_number: 4, player_name: 'Martin Schindler' },
  { participant_id: 'c', pot_number: 1, player_name: 'Luke Littler' },
  { participant_id: 'c', pot_number: 4, player_name: 'Martin Schindler' },
]
const participants = [
  { id: 'a', name: 'A', created_at: '2026-09-10T00:00:00Z' },
  { id: 'b', name: 'B', created_at: '2026-09-11T00:00:00Z' },
  { id: 'c', name: 'C', created_at: '2026-09-09T00:00:00Z' },
]
// Nivåer (group=1, r16=2, qf=3, sf=4, final=5, vinner=6):
//   A: Littler r16 (2), Woodhouse r16 (2)         → 2
//   B: Humphries vant finalen (6), Schindler (5)   → 6
//   C: Littler r16 (2), Schindler tapte finalen (5) → 5
const matches = [
  m('r16', 'Luke Littler', 10, 'Kevin Doets', 3),
  m('r16', 'Luke Woodhouse', 4, 'Andrew Gilding', 10),
  m('final', 'Luke Humphries', 16, 'Martin Schindler', 12),
]

describe('ranking', () => {
  it('grupperer picks per deltaker', () => {
    const by = groupPicks(picks)
    expect(by.size).toBe(3)
    expect(by.get('a')?.map((p) => p.player_name)).toEqual(['Luke Littler', 'Luke Woodhouse'])
  })

  it('rankAmong = antall med høyere nivå + 1', () => {
    const by = groupPicks(picks)
    expect(bestFinishLevel(by.get('a')!, matches)).toBe(2)
    expect(rankAmong(2, by, matches)).toBe(3) // b og c er høyere
    expect(rankAmong(6, by, matches)).toBe(1)
    expect(rankAmong(-1, by, matches)).toBe(4)
  })

  it('sorterer etter nivå, deretter påmeldingstid, og setter flagg/medaljer', () => {
    const rows = buildRankRows(participants, picks, matches, { a: 3, b: 1 }, true)
    expect(rows.map((r) => r.id)).toEqual(['b', 'c', 'a'])
    expect(rows.map((r) => r.points)).toEqual([6, 5, 2])
    // B: Humphries vant finalen → gull, Schindler tapte finalen → sølv
    expect(rows[0].flags.map((f) => f.medal)).toEqual(['gold', 'silver'])
    // A: Woodhouse tapte siste 16 → ute
    expect(rows[2].flags[1].eliminated).toBe(true)
    // rankDelta = baseline − ny plass
    expect(rows[2].rankDelta).toBe(3 - 3)
    expect(rows[0].rankDelta).toBe(1 - 1)
    expect(rows[1].rankDelta).toBeUndefined()
  })

  it('før turneringen: like nivå → påmeldingsrekkefølge, ingen rankDelta', () => {
    const rows = buildRankRows(participants, picks, [], { a: 1 }, false)
    expect(rows.map((r) => r.id)).toEqual(['c', 'a', 'b'])
    expect(rows.every((r) => r.rankDelta === undefined)).toBe(true)
  })
})
