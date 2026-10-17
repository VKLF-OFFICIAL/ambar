import { describe, expect, it } from 'vitest'
import { getElapsed, toLocalDateKey } from './time'

describe('getElapsed', () => {
  it('splits elapsed time into units', () => {
    const e = getElapsed('2026-01-01T00:00:00Z', Date.parse('2026-01-02T03:04:05Z'))
    expect(e).toMatchObject({ days: 1, hours: 3, minutes: 4, seconds: 5 })
    expect(e.totalMs).toBe(97_445_000)
  })

  it('never goes negative when the start is in the future', () => {
    const e = getElapsed('2026-01-02T00:00:00Z', Date.parse('2026-01-01T00:00:00Z'))
    expect(e).toEqual({ totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0 })
  })
})

describe('toLocalDateKey', () => {
  it('uses the local calendar day, also around DST changes', () => {
    expect(toLocalDateKey(new Date(2026, 2, 29, 23, 30))).toBe('2026-03-29')
    expect(toLocalDateKey(new Date(2026, 0, 5, 0, 5))).toBe('2026-01-05')
  })
})
