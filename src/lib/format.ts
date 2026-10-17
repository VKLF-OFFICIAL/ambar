import type { MessageKey, Vars } from '../i18n'
import { DAY, HOUR, MINUTE } from './time'

type T = (key: MessageKey, vars?: Vars) => string

/** Duración compacta: "3 d 4 h", "5 h 12 min", "8 min". */
export function shortDuration(t: T, ms: number): string {
  const d = Math.floor(ms / DAY)
  const h = Math.floor((ms % DAY) / HOUR)
  const m = Math.max(0, Math.ceil((ms % HOUR) / MINUTE))
  if (d > 0) return [t('dashboard.durationDays', { n: d }), h > 0 ? t('dashboard.durationHours', { n: h }) : ''].filter(Boolean).join(' ')
  if (h > 0) return [t('dashboard.durationHours', { n: h }), m > 0 ? t('dashboard.durationMinutes', { n: m }) : ''].filter(Boolean).join(' ')
  return t('dashboard.durationMinutes', { n: m })
}

export function formatMoney(amount: number, locale: string, currency: string): string {
  try {
    return new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: amount >= 100 ? 0 : 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

export function formatHours(minutes: number, locale: string): string {
  const h = minutes / 60
  return new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: h < 10 ? 1 : 0 }).format(h) + ' h'
}
