import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSafeStorage } from './storage'

afterEach(() => vi.restoreAllMocks())

describe('safeStorage', () => {
  it('falls back to memory when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded')
    })
    const onUnavailable = vi.fn()
    const s = createSafeStorage(onUnavailable)
    s.setItem('k', 'v')
    expect(s.getItem('k')).toBe('v')
    expect(onUnavailable).toHaveBeenCalled()
  })

  it('uses localStorage when it works', () => {
    const s = createSafeStorage(() => {})
    s.setItem('k2', 'v2')
    expect(localStorage.getItem('k2')).toBe('v2')
  })
})
