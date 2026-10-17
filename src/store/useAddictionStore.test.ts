import { beforeEach, describe, expect, it } from 'vitest'
import { initialState, useAddictionStore } from './useAddictionStore'
import { RELAPSE_MESSAGE_KEYS } from '../data/messages'
import { DAY } from '../lib/time'

const S = () => useAddictionStore.getState()

beforeEach(() => {
  useAddictionStore.setState(initialState(), false)
})

describe('trackers', () => {
  it('clamps a future start date to now and activates the new tracker', () => {
    const before = Date.now()
    const id = S().addTracker({ kind: 'alcohol', startDate: new Date(Date.now() + DAY).toISOString() })
    const t = S().trackers.find((x) => x.id === id)
    expect(Date.parse(t?.startDate ?? '')).toBeLessThanOrEqual(Date.now())
    expect(Date.parse(t?.startDate ?? '')).toBeGreaterThanOrEqual(before)
    expect(S().settings.activeTrackerId).toBe(id)
  })

  it('removing the active tracker activates another one', () => {
    const a = S().addTracker({ kind: 'alcohol' })
    const b = S().addTracker({ kind: 'tobacco' })
    S().removeTracker(b)
    expect(S().settings.activeTrackerId).toBe(a)
  })
})

describe('resetStreak', () => {
  it('archives the streak, restarts the counter and returns a compassionate message', () => {
    const start = new Date(Date.now() - 3 * DAY).toISOString()
    const id = S().addTracker({ kind: 'alcohol', startDate: start })
    S().markMilestoneCelebrated(id, '24h')
    const key = S().resetStreak(id, { trigger: ['stress'], note: 'mal día' })
    const t = S().trackers[0]
    expect(t?.streakHistory).toHaveLength(1)
    expect(t?.streakHistory[0]?.durationMs).toBeGreaterThanOrEqual(3 * DAY)
    expect(t?.streakHistory[0]?.trigger).toEqual(['stress'])
    expect(Date.now() - Date.parse(t?.startDate ?? '')).toBeLessThan(1000)
    expect(t?.celebratedMilestones).toEqual([])
    expect(RELAPSE_MESSAGE_KEYS).toContain(key)
  })
})

describe('milestones', () => {
  it('marks the celebrated milestone and every lower one', () => {
    const id = S().addTracker({ kind: 'alcohol', startDate: new Date(Date.now() - 8 * DAY).toISOString() })
    S().markMilestoneCelebrated(id, '1w')
    expect(S().trackers[0]?.celebratedMilestones).toEqual(['12h', '24h', '3d', '1w'])
  })
})

describe('reasons', () => {
  it('adds and reorders reasons', () => {
    const id = S().addTracker({ kind: 'alcohol' })
    S().addReason(id, 'A')
    S().addReason(id, 'B')
    const ids = S().trackers[0]?.reasons.map((r) => r.id) ?? []
    S().reorderReasons(id, [...ids].reverse())
    expect(S().trackers[0]?.reasons.map((r) => r.text)).toEqual(['B', 'A'])
  })
})

describe('journal and pledges', () => {
  it('adds a journal entry with id and timestamp', () => {
    S().addJournalEntry({ trackerId: 'x', source: 'checkin', intensity: 8, emotions: ['stress'], environments: [] })
    expect(S().journal[0]).toMatchObject({ intensity: 8, source: 'checkin' })
    expect(S().journal[0]?.id).toBeTruthy()
  })

  it('stores one pledge per day', () => {
    S().makePledge('2026-10-17')
    S().closeDay('2026-10-17', 4, 'bien')
    expect(S().pledges).toHaveLength(1)
    expect(S().pledges[0]).toMatchObject({ date: '2026-10-17', dayRating: 4, note: 'bien' })
  })
})

describe('backup', () => {
  it('rejects broken JSON without touching data', () => {
    S().addTracker({ kind: 'alcohol' })
    const snapshot = JSON.stringify(S().trackers)
    expect(S().importData('{no json')).toEqual({ ok: false, reason: 'parse' })
    expect(S().importData('{"foo":1}')).toEqual({ ok: false, reason: 'shape' })
    expect(S().importData('{"app":"ambar","version":99,"data":{}}')).toEqual({ ok: false, reason: 'version' })
    expect(JSON.stringify(S().trackers)).toBe(snapshot)
  })

  it('round-trips an export', () => {
    S().addTracker({ kind: 'alcohol' })
    S().addJournalEntry({ trackerId: 'x', source: 'sos', intensity: 3, emotions: [], environments: [] })
    const dump = S().exportData()
    const before = { trackers: S().trackers, journal: S().journal, settings: S().settings }
    S().wipeAll()
    expect(S().trackers).toHaveLength(0)
    expect(S().importData(dump)).toEqual({ ok: true })
    expect({ trackers: S().trackers, journal: S().journal, settings: S().settings }).toEqual(before)
  })
})
