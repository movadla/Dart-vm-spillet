import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { clientIp, isRateLimited, recordRateLimitHit, tryRecordRateLimitHit } from './rateLimit'

describe('clientIp', () => {
  it('leser første IP fra x-forwarded-for', () => {
    const req = new NextRequest('http://localhost', { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } })
    expect(clientIp(req)).toBe('1.2.3.4')
  })

  it('faller tilbake til "unknown" uten headeren', () => {
    const req = new NextRequest('http://localhost')
    expect(clientIp(req)).toBe('unknown')
  })
})

// Minimal stub som kun implementerer kjedene isRateLimited/recordRateLimitHit
// faktisk kaller — ikke en full Supabase-klient.
function fakeSupabase(count: number) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            gte: () => Promise.resolve({ count }),
          }),
        }),
      }),
      insert: () => Promise.resolve({ error: null }),
    }),
  } as any
}

describe('isRateLimited', () => {
  it('er false når antall er under grensen', async () => {
    expect(await isRateLimited(fakeSupabase(3), 'test', 'k', 5, 1000)).toBe(false)
  })

  it('er true når antall har nådd grensen', async () => {
    expect(await isRateLimited(fakeSupabase(5), 'test', 'k', 5, 1000)).toBe(true)
  })
})

// Minimal stub for tryRecordRateLimitHit sin .rpc()-kall.
function fakeSupabaseRpc(data: boolean | null, error: unknown = null) {
  return {
    rpc: () => Promise.resolve({ data, error }),
  } as any
}

describe('tryRecordRateLimitHit', () => {
  it('returnerer true når den atomiske funksjonen sier "innenfor grensen"', async () => {
    expect(await tryRecordRateLimitHit(fakeSupabaseRpc(true), 'test', 'k', 5, 1000)).toBe(true)
  })

  it('returnerer false når den atomiske funksjonen sier "blokkert"', async () => {
    expect(await tryRecordRateLimitHit(fakeSupabaseRpc(false), 'test', 'k', 5, 1000)).toBe(false)
  })

  it('kaster videre hvis RPC-kallet feiler', async () => {
    await expect(tryRecordRateLimitHit(fakeSupabaseRpc(null, new Error('boom')), 'test', 'k', 5, 1000)).rejects.toThrow('boom')
  })
})

describe('recordRateLimitHit', () => {
  it('kaster ikke ved vellykket insert', async () => {
    await expect(recordRateLimitHit(fakeSupabase(0), 'test', 'k')).resolves.toBeUndefined()
  })
})
