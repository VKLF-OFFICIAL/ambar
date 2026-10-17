import type { JournalEntry, Tracker } from '../store/types'

export function makeTracker(patch: Partial<Tracker> = {}): Tracker {
  return {
    id: 't1',
    kind: 'alcohol',
    startDate: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    reasons: [],
    streakHistory: [],
    celebratedMilestones: [],
    ...patch,
  }
}

export function makeEntry(patch: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: Math.random().toString(36).slice(2),
    trackerId: 't1',
    at: '2026-01-01T12:00:00.000Z',
    source: 'checkin',
    intensity: 5,
    emotions: [],
    environments: [],
    ...patch,
  }
}
