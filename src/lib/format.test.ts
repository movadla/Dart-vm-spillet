import { describe, expect, it } from 'vitest'
import { formatAvg, formatOdds, formatPercent, formatPoints } from './format'

const NNBSP = ' '

describe('norsk tallformat', () => {
  it('poeng med smalt hardt mellomrom', () => {
    expect(formatPoints(0)).toBe(`0${NNBSP}p`)
    // Tusenskille fra nb-NO er vanlig hardt mellomrom (U+00A0); enheten får det smale.
    expect(formatPoints(1234)).toBe(`1 234${NNBSP}p`)
  })
  it('prosent avrundes', () => {
    expect(formatPercent(33.4)).toBe(`33${NNBSP}%`)
  })
  it('odds og snitt med komma og to desimaler', () => {
    expect(formatOdds('2.5')).toBe('2,50')
    expect(formatOdds('11')).toBe('11,00')
    expect(formatOdds('n/a')).toBe('n/a')
    expect(formatAvg(101.2)).toBe('101,20')
    expect(formatAvg(undefined)).toBe('—')
  })
})

describe('engelsk tallformat', () => {
  it('poeng med "pts"-suffiks og komma som tusenskille', () => {
    expect(formatPoints(0, 'en')).toBe(`0${NNBSP}pts`)
    expect(formatPoints(1234, 'en')).toBe(`1,234${NNBSP}pts`)
  })
  it('prosent avrundes', () => {
    expect(formatPercent(33.4, 'en')).toBe(`33${NNBSP}%`)
  })
  it('odds og snitt med punktum og to desimaler', () => {
    expect(formatOdds('2.5', 'en')).toBe('2.50')
    expect(formatOdds('n/a', 'en')).toBe('n/a')
    expect(formatAvg(101.2, 'en')).toBe('101.20')
    expect(formatAvg(undefined, 'en')).toBe('—')
  })
})
