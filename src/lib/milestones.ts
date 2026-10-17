import { DAY, HOUR } from './time'

export interface Milestone {
  id: string
  ms: number
}

const MONTH = 30 * DAY
const YEAR = 365 * DAY

export const MILESTONES_BASE: Milestone[] = [
  { id: '12h', ms: 12 * HOUR },
  { id: '24h', ms: 24 * HOUR },
  { id: '3d', ms: 3 * DAY },
  { id: '1w', ms: 7 * DAY },
  { id: '2w', ms: 14 * DAY },
  { id: '1m', ms: MONTH },
  { id: '2m', ms: 2 * MONTH },
  { id: '3m', ms: 3 * MONTH },
  { id: '6m', ms: 6 * MONTH },
  { id: '9m', ms: 9 * MONTH },
  { id: '1y', ms: YEAR },
  { id: '18m', ms: 18 * MONTH },
  { id: '2y', ms: 2 * YEAR },
]

/** Hitos base + aniversarios (año 3 en adelante) + cada 100 días, hasta `limitMs` incluido. */
function milestonesThrough(limitMs: number): Milestone[] {
  const list = [...MILESTONES_BASE]
  for (let n = 3; n * YEAR <= limitMs; n++) list.push({ id: `year-${n}`, ms: n * YEAR })
  for (let n = 100; n * DAY <= limitMs; n += 100) list.push({ id: `day-${n}`, ms: n * DAY })
  return list.filter((m) => m.ms <= limitMs).sort((a, b) => a.ms - b.ms)
}

export function milestonesUpTo(totalMs: number): Milestone[] {
  return milestonesThrough(totalMs)
}

export function nextMilestone(totalMs: number): Milestone {
  // El siguiente hito siempre está como mucho a 100 días.
  const candidates = milestonesThrough(totalMs + 100 * DAY)
  const next = candidates.find((m) => m.ms > totalMs)
  if (!next) throw new Error('unreachable: there is always a next milestone')
  return next
}

export function getMilestoneState(totalMs: number): {
  reached: Milestone[]
  next: Milestone
  progress: number
} {
  const reached = milestonesUpTo(totalMs)
  const next = nextMilestone(totalMs)
  const prevMs = reached.at(-1)?.ms ?? 0
  const progress = Math.min(1, Math.max(0, (totalMs - prevMs) / (next.ms - prevMs)))
  return { reached, next, progress }
}

export function pendingCelebration(totalMs: number, celebrated: string[]): Milestone | null {
  const highest = milestonesUpTo(totalMs).at(-1)
  if (!highest || celebrated.includes(highest.id)) return null
  return highest
}
