import type { MessageKey } from '../i18n'
import type { TrackerKind } from '../store/types'

export interface TrackerKindInfo {
  kind: TrackerKind
  icon: string
  category: 'substance' | 'behavior'
  /** Sin abstinencia total posible: la persona define su línea roja */
  needsRedLine: boolean
  /** Dejarlo de golpe puede ser peligroso: aviso médico */
  medicalNotice: boolean
  healthTimeline?: 'tobacco' | 'alcohol'
}

export const TRACKER_KINDS: TrackerKindInfo[] = [
  { kind: 'tobacco', icon: '🚬', category: 'substance', needsRedLine: false, medicalNotice: false, healthTimeline: 'tobacco' },
  { kind: 'vape', icon: '💨', category: 'substance', needsRedLine: false, medicalNotice: false, healthTimeline: 'tobacco' },
  { kind: 'alcohol', icon: '🍷', category: 'substance', needsRedLine: false, medicalNotice: true, healthTimeline: 'alcohol' },
  { kind: 'cannabis', icon: '🌿', category: 'substance', needsRedLine: false, medicalNotice: false },
  { kind: 'stimulants', icon: '⚡', category: 'substance', needsRedLine: false, medicalNotice: false },
  { kind: 'opioids', icon: '💊', category: 'substance', needsRedLine: false, medicalNotice: true },
  { kind: 'sedatives', icon: '🌙', category: 'substance', needsRedLine: false, medicalNotice: true },
  { kind: 'caffeine', icon: '☕', category: 'substance', needsRedLine: false, medicalNotice: false },
  { kind: 'gambling', icon: '🎰', category: 'behavior', needsRedLine: false, medicalNotice: false },
  { kind: 'porn', icon: '🔒', category: 'behavior', needsRedLine: false, medicalNotice: false },
  { kind: 'social', icon: '📱', category: 'behavior', needsRedLine: true, medicalNotice: false },
  { kind: 'gaming', icon: '🎮', category: 'behavior', needsRedLine: true, medicalNotice: false },
  { kind: 'shopping', icon: '🛍️', category: 'behavior', needsRedLine: true, medicalNotice: false },
  { kind: 'food', icon: '🍫', category: 'behavior', needsRedLine: true, medicalNotice: false },
  { kind: 'custom', icon: '✦', category: 'behavior', needsRedLine: true, medicalNotice: false },
]

export function kindInfo(kind: TrackerKind): TrackerKindInfo {
  return TRACKER_KINDS.find((k) => k.kind === kind) ?? (TRACKER_KINDS.at(-1) as TrackerKindInfo)
}

export const RED_LINE_SUGGESTIONS: Partial<Record<TrackerKind, MessageKey[]>> = {
  food: ['redLines.food1', 'redLines.food2'],
  social: ['redLines.social1', 'redLines.social2'],
  gaming: ['redLines.gaming1', 'redLines.gaming2'],
  shopping: ['redLines.shopping1', 'redLines.shopping2'],
  custom: ['redLines.custom1'],
}
