import { beforeEach, describe, expect, it } from 'vitest'
import { initialState, mergePersisted, useAddictionStore } from './useAddictionStore'
import { makeTracker } from '../lib/testFactories'

const current = () => useAddictionStore.getState()

beforeEach(() => {
  useAddictionStore.setState(initialState(), false)
})

describe('mergePersisted', () => {
  it('adopts valid persisted data', () => {
    const t = makeTracker({ id: 'kept' })
    const merged = mergePersisted({ trackers: [t], journal: [], pledges: [] }, current())
    expect(merged.trackers.map((x) => x.id)).toEqual(['kept'])
  })

  it('falls back to defaults when persisted data is corrupt', () => {
    const merged = mergePersisted({ trackers: 'boom', settings: { theme: 'neon' } }, current())
    expect(merged.trackers).toEqual([])
    expect(merged.settings.theme).toBe('dark')
    // Las acciones del store siguen presentes tras la mezcla.
    expect(typeof merged.addTracker).toBe('function')
  })

  it('merges valid persisted settings over the defaults', () => {
    const merged = mergePersisted({ settings: { ...current().settings, locale: 'en', name: 'Río' } }, current())
    expect(merged.settings.locale).toBe('en')
    expect(merged.settings.name).toBe('Río')
  })
})
