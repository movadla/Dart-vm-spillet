import { describe, expect, it } from 'vitest'
import { getScheduleLabel, getScheduleSortKey, STAGE_SCHEDULE } from './schedule'

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

  it('kveld 2-spiller (29. sep) har nå også et bekreftet klokkeslett', () => {
    const l = getScheduleLabel('r1', 'no', 'Luke Humphries')
    expect(l.timeKnown).toBe(true)
    expect(l.timeLabel).toBe('22:10')
  })

  it('kveld 2-spiller (29. sep) skal IKKE vises med kveld 1 sin dato (28. sep)', () => {
    const l = getScheduleLabel('r1', 'no', 'Luke Humphries')
    expect(l.dateLabel).toMatch(/29\.\s*sep/i)
    expect(l.dateLabel).not.toMatch(/28\.\s*sep/i)
  })

  it('kveld 1-spiller viser fortsatt 28. sep (ikke 29.)', () => {
    const l = getScheduleLabel('r1', 'no', 'Luke Littler')
    expect(l.dateLabel).toMatch(/28\.\s*sep/i)
  })

  it('en spiller uten NOEN kjent per-kamp-oppføring faller tilbake til «Ikke satt» klokkeslett', () => {
    const l = getScheduleLabel('r1', 'no', 'Ukjent Spillernavn')
    expect(l.timeKnown).toBe(false)
  })
})

describe('getScheduleSortKey', () => {
  it('tidligere kamp (kveld 1) gir en lavere nøkkel enn en senere (kveld 2)', () => {
    const early = getScheduleSortKey('r1', 'Luke Littler') // 28. sep, 22:10
    const later = getScheduleSortKey('r1', 'Luke Humphries') // 29. sep, 22:10
    expect(early).toBeLessThan(later)
  })

  it('to kamper samme kveld sorteres etter klokkeslett', () => {
    const first = getScheduleSortKey('r1', 'Danny Noppert') // 19:10
    const last = getScheduleSortKey('r1', 'Luke Littler') // 22:10
    expect(first).toBeLessThan(last)
  })

  it('ukjent dato gir Infinity (sorteres alltid sist)', () => {
    expect(getScheduleSortKey('final')).toBe(Infinity)
  })
})
