import { es } from './es'
import { en } from './en'

export type Locale = 'es' | 'en'

type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> }
export type Messages = Widen<typeof es>

type Paths<T, P extends string = ''> = T extends string
  ? P
  : { [K in keyof T & string]: Paths<T[K], P extends '' ? K : `${P}.${K}`> }[keyof T & string]

export type MessageKey = Paths<Messages>
export type Vars = Record<string, string | number>

const dictionaries: Record<Locale, Messages> = { es, en }

export function lookup(locale: Locale, key: string): string | undefined {
  let node: unknown = dictionaries[locale]
  for (const part of key.split('.')) {
    if (node && typeof node === 'object' && part in node) {
      node = (node as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return typeof node === 'string' ? node : undefined
}

export function t(locale: Locale, key: MessageKey, vars?: Vars): string {
  const raw = lookup(locale, key) ?? lookup('es', key) ?? key
  if (!vars) return raw
  return raw.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}
