import type { JournalEntry } from '../store/types'

export type HourBand = 'morning' | 'afternoon' | 'evening' | 'night'

export interface Patterns {
  topEmotions: { key: string; count: number }[]
  topEnvironments: { key: string; count: number }[]
  byHourBand: Record<HourBand, number>
  /** 0 = lunes … 6 = domingo */
  byWeekday: number[]
  strongCount: number
}

export const MIN_ENTRIES_FOR_PATTERNS = 5
export const STRONG_INTENSITY = 7

function rank(lists: string[][]): { key: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const list of lists) for (const k of list) counts.set(k, (counts.get(k) ?? 0) + 1)
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count)
}

export function hourBand(hour: number): HourBand {
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18) return 'evening'
  return 'night'
}

export function computePatterns(entries: JournalEntry[]): Patterns | null {
  if (entries.length < MIN_ENTRIES_FOR_PATTERNS) return null
  const strong = entries.filter((e) => e.intensity >= STRONG_INTENSITY)
  const basis = strong.length > 0 ? strong : entries
  const byHourBand: Record<HourBand, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 }
  const byWeekday = [0, 0, 0, 0, 0, 0, 0]
  for (const e of entries) {
    const d = new Date(e.at)
    byHourBand[hourBand(d.getHours())]++
    const idx = (d.getDay() + 6) % 7
    byWeekday[idx] = (byWeekday[idx] ?? 0) + 1
  }
  return {
    topEmotions: rank(basis.map((e) => e.emotions)),
    topEnvironments: rank(basis.map((e) => e.environments)),
    byHourBand,
    byWeekday,
    strongCount: strong.length,
  }
}
