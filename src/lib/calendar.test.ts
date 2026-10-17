import { describe, expect, it } from 'vitest'
import { classifyDays } from './calendar'
import { makeEntry, makeTracker } from './testFactories'

describe('classifyDays', () => {
  const t = makeTracker({
    createdAt: new Date(2026, 2, 20, 10, 0).toISOString(),
    startDate: new Date(2026, 2, 29, 23, 30).toISOString(),
    streakHistory: [
      {
        start: new Date(2026, 2, 20, 10, 0).toISOString(),
        end: new Date(2026, 2, 29, 23, 30).toISOString(),
        durationMs: 1,
      },
    ],
  })
  const entries = [
    makeEntry({ at: new Date(2026, 2, 30, 18, 0).toISOString(), intensity: 7 }),
    makeEntry({ at: new Date(2026, 2, 31, 18, 0).toISOString(), intensity: 9, trackerId: 'other' }),
  ]
  const days = classifyDays(t, entries, '2026-03-18', '2026-03-31')

  it('marks the relapse on the local day it happened', () => {
    expect(days.get('2026-03-29')).toBe('relapse')
  })
  it('marks strong cravings of this tracker', () => {
    expect(days.get('2026-03-30')).toBe('strong')
  })
  it('ignores other trackers and marks free days', () => {
    expect(days.get('2026-03-31')).toBe('free')
  })
  it('marks days before tracking began', () => {
    expect(days.get('2026-03-19')).toBe('before')
    expect(days.get('2026-03-20')).toBe('free')
  })
})
