import { useCallback } from 'react'
import { t as translate, type MessageKey, type Vars } from '../i18n'
import { useAddictionStore } from '../store/useAddictionStore'

export function useT() {
  const locale = useAddictionStore((s) => s.settings.locale)
  const t = useCallback((key: MessageKey, vars?: Vars) => translate(locale, key, vars), [locale])
  return { t, locale }
}
