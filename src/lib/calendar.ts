import type { JournalEntry, Tracker } from '../store/types'
import { STRONG_INTENSITY } from './patterns'
import { toLocalDateKey } from './time'

export type DayStatus = 'free' | 'strong' | 'relapse' | 'before'

function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

export function classifyDays(
  t: Tracker,
  entries: JournalEntry[],
  fromKey: string,
  toKey: string,
): Map<string, DayStatus> {
  const firstStart = [t.createdAt, t.startDate, ...t.streakHistory.map((s) => s.start)]
    .map((iso) => toLocalDateKey(new Date(iso)))
    .sort()[0] ?? toKey
  const relapseDays = new Set(t.streakHistory.map((s) => toLocalDateKey(new Date(s.end))))
  const strongDays = new Set(
    entries
      .filter((e) => e.trackerId === t.id && e.intensity >= STRONG_INTENSITY)
      .map((e) => toLocalDateKey(new Date(e.at))),
  )

  const result = new Map<string, DayStatus>()
  for (const d = parseKey(fromKey); toLocalDateKey(d) <= toKey; d.setDate(d.getDate() + 1)) {
    const key = toLocalDateKey(d)
    if (key < firstStart) result.set(key, 'before')
    else if (relapseDays.has(key)) result.set(key, 'relapse')
    else if (strongDays.has(key)) result.set(key, 'strong')
    else result.set(key, 'free')
  }
  return result
}
