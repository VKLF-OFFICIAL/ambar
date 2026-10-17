import { describe, expect, it } from 'vitest'
import { savings, streakStats } from './stats'
import { DAY } from './time'
import { makeTracker } from './testFactories'

const now = Date.parse('2026-02-01T00:00:00Z')

describe('streakStats', () => {
  it('includes the current streak in longest, average and total', () => {
    const t = makeTracker({
      startDate: new Date(now - 5 * DAY).toISOString(),
      streakHistory: [
        { start: '2025-12-01T00:00:00Z', end: '2025-12-04T00:00:00Z', durationMs: 3 * DAY },
        { start: '2025-12-05T00:00:00Z', end: '2025-12-15T00:00:00Z', durationMs: 10 * DAY },
      ],
    })
    expect(streakStats(t, now)).toEqual({
      currentMs: 5 * DAY,
      longestMs: 10 * DAY,
      averageMs: 6 * DAY,
      totalFreeMs: 18 * DAY,
      streakCount: 3,
    })
  })
})

describe('savings', () => {
  it('scales money and minutes by fractional days', () => {
    expect(savings(makeTracker({ costPerDay: 10, minutesPerDay: 60 }), 2.5 * DAY)).toEqual({ money: 25, minutes: 150 })
  })

  it('returns null when not configured', () => {
    expect(savings(makeTracker(), DAY)).toEqual({ money: null, minutes: null })
  })
})
