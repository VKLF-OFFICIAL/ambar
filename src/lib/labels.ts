import type { MessageKey, Vars } from '../i18n'
import type { Tracker } from '../store/types'
import type { Milestone } from './milestones'

type T = (key: MessageKey, vars?: Vars) => string

export function trackerLabel(t: T, tracker: Pick<Tracker, 'kind' | 'customName'>): string {
  return tracker.customName?.trim() || t(`kinds.${tracker.kind}`)
}

function generated(id: string): { kind: 'year' | 'day'; n: number } | null {
  const m = /^(year|day)-(\d+)$/.exec(id)
  return m ? { kind: m[1] as 'year' | 'day', n: Number(m[2]) } : null
}

export function milestoneTitle(t: T, m: Milestone): string {
  const g = generated(m.id)
  return g ? t(`milestones.${g.kind}.title`, { n: g.n }) : t(`milestones.${m.id}.title` as MessageKey)
}

export function milestoneMessage(t: T, m: Milestone): string {
  const g = generated(m.id)
  return g ? t(`milestones.${g.kind}.message`, { n: g.n }) : t(`milestones.${m.id}.message` as MessageKey)
}

export function intensityKey(v: number): MessageKey {
  if (v === 0) return 'journal.level0'
  if (v <= 3) return 'journal.level1'
  if (v <= 6) return 'journal.level2'
  if (v <= 8) return 'journal.level3'
  return 'journal.level4'
}
