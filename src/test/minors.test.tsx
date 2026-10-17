import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import App from '../App'
import { seed } from './seed'
import { useAddictionStore, mergePersisted, initialState } from '../store/useAddictionStore'
import { resolveEntryTime, DAY } from '../lib/time'
import { parseImport } from '../lib/backup'
import { createSafeStorage } from '../lib/storage'
import { lockoutMs, readPinGuard, recordPinFailure, resetPinGuard } from '../lib/pinGuard'
import { createPinHash } from '../lib/pin'

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('start date edits', () => {
  it('forgets celebrations beyond the new elapsed time when the start moves later', () => {
    seed([{ startDate: new Date(Date.now() - 400 * DAY).toISOString(), celebratedMilestones: ['12h', '24h', '3d', '1w', '1y'] }])
    useAddictionStore.getState().updateTracker('t1', { startDate: new Date(Date.now() - 4 * DAY).toISOString() })
    expect(useAddictionStore.getState().trackers[0]?.celebratedMilestones).toEqual(['12h', '24h', '3d'])
  })
})

describe('journal time', () => {
  it('treats a time later than now as yesterday', () => {
    const now = new Date(2026, 9, 18, 0, 15).getTime()
    expect(resolveEntryTime('23:40', now).getTime()).toBe(new Date(2026, 9, 17, 23, 40).getTime())
    expect(resolveEntryTime('00:05', now).getTime()).toBe(new Date(2026, 9, 18, 0, 5).getTime())
  })
})

describe('persisted state merge', () => {
  it('fills settings fields missing from older saved data', () => {
    const current = { ...useAddictionStore.getState(), ...initialState() }
    const merged = mergePersisted({ settings: { theme: 'light', locale: 'es', onboarded: true } }, current)
    expect(merged.settings.theme).toBe('light')
    expect(merged.settings.customHelplines).toEqual([])
    expect(merged.settings.reduceMotion).toBe(false)
    expect(merged.trackers).toEqual([])
  })
})

describe('PIN brute-force guard', () => {
  beforeEach(() => resetPinGuard())

  it('waits longer after repeated failures', () => {
    expect(lockoutMs(4)).toBe(0)
    expect(lockoutMs(5)).toBe(30_000)
    expect(lockoutMs(6)).toBe(60_000)
    expect(lockoutMs(20)).toBe(5 * 60_000)
  })

  it('persists failures and the lockout deadline', () => {
    for (let i = 0; i < 5; i++) recordPinFailure(1000)
    expect(readPinGuard()).toEqual({ failures: 5, until: 31_000 })
  })
})

describe('lock screen keyboard', () => {
  beforeEach(() => resetPinGuard())

  it('accepts digits and Enter from a physical keyboard', async () => {
    seed([{}], { pinHash: await createPinHash('1234') })
    render(<App />)
    for (const key of '1234') fireEvent.keyDown(window, { key })
    expect(screen.getByText(/4 dígitos/)).toBeInTheDocument()
    await act(async () => {
      fireEvent.keyDown(window, { key: 'Enter' })
    })
    expect(await screen.findByRole('navigation')).toBeInTheDocument()
  })

  it('blocks attempts during the lockout', async () => {
    seed([{}], { pinHash: await createPinHash('1234') })
    for (let i = 0; i < 5; i++) recordPinFailure(Date.now())
    render(<App />)
    expect(screen.getByText(/espera/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Desbloquear' })).toBeDisabled()
  })
})

describe('storage warning', () => {
  it('shows a discreet banner outside Settings', () => {
    seed()
    useAddictionStore.setState({ storageAvailable: false })
    render(<App />)
    expect(screen.getByRole('alert')).toHaveTextContent(/no permite guardar/i)
    fireEvent.click(screen.getByRole('button', { name: /entendido/i }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('extra robustness', () => {
  it('rejects JSON from another app', () => {
    expect(parseImport(JSON.stringify({ app: 'other', version: 1, data: {} }))).toEqual({ ok: false, reason: 'shape' })
  })

  it('falls back when reading localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    const onUnavailable = vi.fn()
    expect(createSafeStorage(onUnavailable).getItem('x')).toBeNull()
    expect(onUnavailable).toHaveBeenCalledOnce()
  })
})
