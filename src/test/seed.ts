import { initialState, useAddictionStore } from '../store/useAddictionStore'
import { useUiStore } from '../store/useUiStore'
import type { Tracker } from '../store/types'
import { makeTracker } from '../lib/testFactories'

export function seed(trackers: Partial<Tracker>[] = [{}], settings: Partial<ReturnType<typeof initialState>['settings']> = {}) {
  const ts = trackers.map((t, i) => makeTracker({ id: `t${i + 1}`, ...t }))
  const base = initialState()
  useAddictionStore.setState(
    {
      ...base,
      trackers: ts,
      settings: { ...base.settings, locale: 'es', country: 'ES', currency: 'EUR', onboarded: true, activeTrackerId: ts[0]?.id, ...settings },
    },
    false,
  )
  useUiStore.setState(useUiStore.getInitialState(), true)
  return ts
}
