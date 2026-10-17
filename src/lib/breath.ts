export type BreathPhase = 'inhale' | 'hold' | 'exhale'

export const BREATH_PHASES: readonly { phase: BreathPhase; s: number }[] = [
  { phase: 'inhale', s: 4 },
  { phase: 'hold', s: 7 },
  { phase: 'exhale', s: 8 },
] as const
export const BREATH_CYCLES = 4
const CYCLE_MS = BREATH_PHASES.reduce((a, p) => a + p.s * 1000, 0)
export const BREATH_TOTAL_MS = CYCLE_MS * BREATH_CYCLES

export interface BreathState {
  cycle: number
  phase: BreathPhase
  secondsLeft: number
  done: boolean
}

export function breathAt(elapsedMs: number): BreathState {
  if (elapsedMs >= BREATH_TOTAL_MS) return { cycle: BREATH_CYCLES, phase: 'exhale', secondsLeft: 0, done: true }
  const t = Math.max(0, elapsedMs)
  const cycle = Math.floor(t / CYCLE_MS) + 1
  let within = t % CYCLE_MS
  for (const p of BREATH_PHASES) {
    const ms = p.s * 1000
    if (within < ms) return { cycle, phase: p.phase, secondsLeft: Math.ceil((ms - within) / 1000), done: false }
    within -= ms
  }
  return { cycle, phase: 'exhale', secondsLeft: 0, done: false }
}
