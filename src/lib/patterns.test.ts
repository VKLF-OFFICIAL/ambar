import { describe, expect, it } from 'vitest'
import { computePatterns } from './patterns'
import { makeEntry } from './testFactories'

describe('computePatterns', () => {
  it('needs at least 5 entries', () => {
    expect(computePatterns([1, 2, 3, 4].map(() => makeEntry()))).toBeNull()
  })

  it('ranks emotions among strong cravings', () => {
    const entries = [
      ...[1, 2, 3].map(() => makeEntry({ intensity: 8, emotions: ['stress'], environments: ['home'] })),
      ...[1, 2, 3].map(() => makeEntry({ intensity: 3, emotions: ['boredom', 'sadness'] })),
    ]
    const p = computePatterns(entries)
    expect(p?.topEmotions[0]).toEqual({ key: 'stress', count: 3 })
    expect(p?.topEnvironments[0]).toEqual({ key: 'home', count: 3 })
    expect(p?.strongCount).toBe(3)
  })

  it('buckets by local hour band and weekday (Monday = 0)', () => {
    const at = new Date(2026, 0, 5, 9, 0).toISOString() // lunes 09:00 local
    const p = computePatterns([1, 2, 3, 4, 5].map(() => makeEntry({ at })))
    expect(p?.byHourBand.morning).toBe(5)
    expect(p?.byWeekday[0]).toBe(5)
  })
})
