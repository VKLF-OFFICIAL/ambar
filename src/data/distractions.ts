import type { MessageKey } from '../i18n'

export type DistractionId = 'countdown7' | 'category5' | 'memory' | 'action'

export interface Distraction {
  id: DistractionId
  titleKey: MessageKey
  bodyKey: MessageKey
}

export const DISTRACTIONS: Distraction[] = [
  { id: 'countdown7', titleKey: 'distractions.countdown7.title', bodyKey: 'distractions.countdown7.body' },
  { id: 'category5', titleKey: 'distractions.category5.title', bodyKey: 'distractions.category5.body' },
  { id: 'memory', titleKey: 'distractions.memory.title', bodyKey: 'distractions.memory.body' },
  { id: 'action', titleKey: 'distractions.action.title', bodyKey: 'distractions.action.body' },
]

export const CATEGORY_KEYS: MessageKey[] = [
  'distractions.categories.fruits',
  'distractions.categories.cities',
  'distractions.categories.animals',
  'distractions.categories.films',
  'distractions.categories.colors',
]
