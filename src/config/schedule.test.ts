import { describe, expect, it } from 'vitest'
import { getScheduleLabel, STAGE_SCHEDULE } from './schedule'

describe('getScheduleLabel', () => {
  it('ingenting satt ennå → begge «Ikke satt»', () => {
    const l = getScheduleLabel('r2')
    expect(l).toEqual({ dateLabel: 'Ikke satt', timeLabel: 'Ikke satt', dateKnown: false, timeKnown: false })
  })

  it('dato satt, klokkeslett ikke (rekkefølgen på dagens kamper ikke bestemt)', () => {
    const orig = STAGE_SCHEDULE.qf.date
    STAGE_SCHEDULE.qf.date = '2026-12-30'
    STAGE_SCHEDULE.qf.time = null
    const l = getScheduleLabel('qf')
    expect(l.dateKnown).toBe(true)
    expect(l.timeKnown).toBe(false)
    expect(l.timeLabel).toBe('Ikke satt')
    expect(l.dateLabel).toMatch(/des/i)
    STAGE_SCHEDULE.qf.date = orig
  })

  it('både dato og klokkeslett kunngjort', () => {
    const origDate = STAGE_SCHEDULE.final.date
    const origTime = STAGE_SCHEDULE.final.time
    STAGE_SCHEDULE.final.date = '2027-01-01'
    STAGE_SCHEDULE.final.time = '20:00'
    const l = getScheduleLabel('final')
    expect(l.dateLabel).toMatch(/jan/i)
    expect(l).toEqual({ dateLabel: l.dateLabel, timeLabel: '20:00', dateKnown: true, timeKnown: true })
    STAGE_SCHEDULE.final.date = origDate
    STAGE_SCHEDULE.final.time = origTime
  })

  it('kjent spiller i runde 1 gir det ekte per-kamp-klokkeslettet, ikke «Ikke satt»', () => {
    const l = getScheduleLabel('r1', 'no', 'Luke Littler')
    expect(l.dateLabel).toMatch(/28\.\s*sep/i)
    expect(l).toMatchObject({ timeLabel: '22:10', dateKnown: true, timeKnown: true })
  })

  it('runde 1 uten spillernavn faller tilbake til rundenivå (ikke satt klokkeslett)', () => {
    const l = getScheduleLabel('r1')
    expect(l.timeKnown).toBe(false)
    expect(l.timeLabel).toBe('Ikke satt')
  })

  it('en spiller som IKKE har et kjent per-kamp-klokkeslett (kveld 2) gir fortsatt «Ikke satt»', () => {
    const l = getScheduleLabel('r1', 'no', 'Luke Humphries')
    expect(l.timeKnown).toBe(false)
  })
})
