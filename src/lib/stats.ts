import type { Tracker } from '../store/types'
import { DAY, getElapsed } from './time'

export interface StreakStats {
  currentMs: number
  longestMs: number
  averageMs: number
  totalFreeMs: number
  streakCount: number
}

export function streakStats(t: Tracker, nowMs: number): StreakStats {
  const currentMs = getElapsed(t.startDate, nowMs).totalMs
  const durations = [...t.streakHistory.map((s) => s.durationMs), currentMs]
  const totalFreeMs = durations.reduce((a, b) => a + b, 0)
  return {
    currentMs,
    longestMs: Math.max(...durations),
    averageMs: totalFreeMs / durations.length,
    totalFreeMs,
    streakCount: durations.length,
  }
}

export function savings(t: Tracker, ms: number): { money: number | null; minutes: number | null } {
  const days = ms / DAY
  return {
    money: t.costPerDay ? t.costPerDay * days : null,
    minutes: t.minutesPerDay ? t.minutesPerDay * days : null,
  }
}
