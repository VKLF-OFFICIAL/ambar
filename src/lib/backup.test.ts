import { describe, expect, it } from 'vitest'
import { sanitizeData } from './backup'
import { makeEntry, makeTracker } from './testFactories'
import type { Settings } from '../store/types'

const validSettings: Settings = {
  theme: 'dark',
  locale: 'es',
  country: 'ES',
  currency: 'EUR',
  reduceMotion: false,
  customHelplines: [],
  onboarded: true,
}

describe('sanitizeData', () => {
  it('keeps valid records and drops only the corrupt ones', () => {
    const good = makeTracker({ id: 'ok' })
    const result = sanitizeData({
      trackers: [good, { id: 'broken', kind: 'alcohol' }, null, 42],
      journal: [makeEntry({ id: 'e1' }), { id: 'bad' }],
      pledges: [{ date: '2026-01-01' }, { nope: true }],
    })
    expect(result.trackers?.map((t) => t.id)).toEqual(['ok'])
    expect(result.journal?.map((e) => e.id)).toEqual(['e1'])
    expect(result.pledges).toEqual([{ date: '2026-01-01' }])
  })

  it('keeps a tracker crisis letter', () => {
    const t = makeTracker({ id: 'ok', crisisLetter: 'querido yo, aguanta' })
    const result = sanitizeData({ trackers: [t] })
    expect(result.trackers?.[0]?.crisisLetter).toBe('querido yo, aguanta')
  })

  it('omits keys whose value is missing or not an array', () => {
    const result = sanitizeData({ trackers: 'not-an-array' })
    expect(result.trackers).toBeUndefined()
    expect(result.journal).toBeUndefined()
    expect(result.settings).toBeUndefined()
  })

  it('validates settings field by field, dropping only corrupt fields', () => {
    expect(sanitizeData({ settings: validSettings }).settings).toEqual(validSettings)
    // Un campo inválido se descarta, pero los demás válidos se conservan.
    expect(sanitizeData({ settings: { theme: 'neon', locale: 'en' } }).settings).toEqual({ locale: 'en' })
    // Sin clave settings, no se devuelve nada para esa clave.
    expect(sanitizeData({ trackers: 'not-an-array' }).settings).toBeUndefined()
  })

  it('tolerates non-object input', () => {
    expect(sanitizeData(null)).toEqual({})
    expect(sanitizeData('corrupt')).toEqual({})
    expect(sanitizeData(undefined)).toEqual({})
  })
})
