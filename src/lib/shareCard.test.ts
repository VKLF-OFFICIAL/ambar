import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pickIndex, shareOrDownload } from './shareCard'

describe('pickIndex', () => {
  it('is stable and wraps by the number of days', () => {
    expect(pickIndex(0, 3)).toBe(0)
    expect(pickIndex(3, 3)).toBe(0)
    expect(pickIndex(4, 3)).toBe(1)
    expect(pickIndex(0, 0)).toBe(0)
    expect(pickIndex(-1, 3)).toBeGreaterThanOrEqual(0)
  })
})

describe('shareOrDownload', () => {
  const blob = new Blob(['x'], { type: 'image/png' })

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:x')
    URL.revokeObjectURL = vi.fn()
  })
  afterEach(() => {
    delete (navigator as { share?: unknown }).share
    delete (navigator as { canShare?: unknown }).canShare
    vi.restoreAllMocks()
  })

  it('shares via the system dialog when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    ;(navigator as { share?: unknown }).share = share
    ;(navigator as { canShare?: unknown }).canShare = () => true

    expect(await shareOrDownload(blob, 'x.png')).toBe('shared')
    expect(share).toHaveBeenCalledOnce()
  })

  it('falls back to download when sharing is unavailable', async () => {
    expect(await shareOrDownload(blob, 'x.png')).toBe('downloaded')
    expect(URL.createObjectURL).toHaveBeenCalledOnce()
  })

  it('treats a user cancel (AbortError) as shared, without downloading', async () => {
    ;(navigator as { share?: unknown }).share = vi.fn().mockRejectedValue(new DOMException('cancel', 'AbortError'))
    ;(navigator as { canShare?: unknown }).canShare = () => true

    expect(await shareOrDownload(blob, 'x.png')).toBe('shared')
    expect(URL.createObjectURL).not.toHaveBeenCalled()
  })
})
