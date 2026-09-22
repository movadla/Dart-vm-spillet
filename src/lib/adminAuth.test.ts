import { describe, it, expect } from 'vitest'
import { secureCompare } from './adminAuth'

describe('secureCompare', () => {
  it('er true for like strenger', () => {
    expect(secureCompare('hemmelig123', 'hemmelig123')).toBe(true)
  })

  it('er false for ulike strenger av samme lengde', () => {
    expect(secureCompare('hemmelig123', 'hemmelig124')).toBe(false)
  })

  it('er false for strenger av ulik lengde', () => {
    expect(secureCompare('kort', 'myelengre')).toBe(false)
  })

  it('er false for tom streng mot ikke-tom', () => {
    expect(secureCompare('', 'noe')).toBe(false)
  })
})
