import { describe, expect, it } from 'vitest'
import { es } from './es'
import { en } from './en'
import { t } from './index'

function collect(obj: unknown, prefix = ''): Map<string, string> {
  const out = new Map<string, string>()
  if (typeof obj === 'string') {
    out.set(prefix, obj)
    return out
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      for (const [kk, vv] of collect(v, prefix ? `${prefix}.${k}` : k)) out.set(kk, vv)
    }
  }
  return out
}

describe('i18n', () => {
  it('translates the app name in both locales', () => {
    expect(t('es', 'common.appName')).toBe('Ambar')
    expect(t('en', 'common.appName')).toBe('Ambar')
  })

  it('interpolates variables', () => {
    expect(t('es', 'common.greeting', { name: 'Álex' })).toBe('Hola, Álex')
    expect(t('en', 'common.greeting', { name: 'Álex' })).toBe('Hi, Álex')
  })

  it('has the same keys in es and en', () => {
    expect([...collect(en).keys()].sort()).toEqual([...collect(es).keys()].sort())
  })

  it('never uses blaming words', () => {
    for (const dict of [es, en]) {
      for (const [key, value] of collect(dict)) {
        expect(value, key).not.toMatch(/fracas|failure|\bfail(ed)?\b/i)
      }
    }
  })
})
