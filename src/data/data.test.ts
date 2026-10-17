import { describe, expect, it } from 'vitest'
import { FALLBACK_HELPLINES, detectCountry, helplinesFor, HELPLINES } from './helplines'
import { TRACKER_KINDS, RED_LINE_SUGGESTIONS } from './trackerKinds'
import { HEALTH_TIMELINE } from './healthTimeline'
import { DISTRACTIONS } from './distractions'
import { EMOTION_CHIPS, ENVIRONMENT_CHIPS, RELAPSE_PLAN_CHIPS } from './chips'
import { MILESTONES_BASE } from '../lib/milestones'
import { lookup } from '../i18n'
import type { TrackerKind } from '../store/types'

const ALL_KINDS: TrackerKind[] = [
  'tobacco', 'vape', 'alcohol', 'cannabis', 'stimulants', 'opioids', 'sedatives',
  'gambling', 'porn', 'social', 'gaming', 'shopping', 'food', 'caffeine', 'custom',
]

const exists = (key: string) => {
  expect(lookup('es', key), `es:${key}`).toBeTypeOf('string')
  expect(lookup('en', key), `en:${key}`).toBeTypeOf('string')
}

describe('helplines', () => {
  it('detects the country from the browser language', () => {
    expect(detectCountry('es-MX')).toBe('MX')
    expect(detectCountry('en-GB')).toBe('GB')
    expect(detectCountry('es')).toBe('ES')
    expect(detectCountry('en')).toBe('US')
    expect(detectCountry('fr-FR')).toBe('FR')
  })

  it('returns local numbers and a fallback for uncovered countries', () => {
    const es = helplinesFor('ES').map((h) => h.phone)
    expect(es).toContain('024')
    expect(es).toContain('112')
    expect(helplinesFor('FR')).toBe(FALLBACK_HELPLINES)
  })

  it('covers the countries in the spec, with translated labels', () => {
    for (const c of ['ES', 'MX', 'AR', 'CO', 'CL', 'US', 'GB', 'IE', 'CA']) {
      expect(HELPLINES[c]?.length, c).toBeGreaterThan(0)
      for (const h of HELPLINES[c] ?? []) exists(h.labelKey)
    }
  })
})

describe('content catalog', () => {
  it('has one entry per tracker kind, with labels', () => {
    expect(TRACKER_KINDS.map((k) => k.kind).sort()).toEqual([...ALL_KINDS].sort())
    for (const k of TRACKER_KINDS) exists(`kinds.${k.kind}`)
  })

  it('flags red lines and medical notices as the spec says', () => {
    const by = (kind: TrackerKind) => TRACKER_KINDS.find((k) => k.kind === kind)
    expect(['food', 'social', 'gaming', 'shopping', 'custom'].every((k) => by(k as TrackerKind)?.needsRedLine)).toBe(true)
    expect(['alcohol', 'opioids', 'sedatives'].every((k) => by(k as TrackerKind)?.medicalNotice)).toBe(true)
    expect(by('gambling')?.medicalNotice).toBe(false)
    expect(by('vape')?.healthTimeline).toBe('tobacco')
  })

  it('has translations for every referenced key', () => {
    for (const list of Object.values(RED_LINE_SUGGESTIONS)) list.forEach(exists)
    for (const items of Object.values(HEALTH_TIMELINE)) items.forEach((i) => exists(i.textKey))
    DISTRACTIONS.forEach((d) => { exists(d.titleKey); exists(d.bodyKey) })
    EMOTION_CHIPS.forEach((c) => exists(`chips.emotions.${c}`))
    ENVIRONMENT_CHIPS.forEach((c) => exists(`chips.environments.${c}`))
    RELAPSE_PLAN_CHIPS.forEach((c) => exists(`chips.plan.${c}`))
    MILESTONES_BASE.forEach((m) => { exists(`milestones.${m.id}.title`); exists(`milestones.${m.id}.message`) })
    expect(DISTRACTIONS.length).toBeGreaterThanOrEqual(4)
  })
})
