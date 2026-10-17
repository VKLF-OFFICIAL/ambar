const KEY = 'ambar-pin-guard'
const FREE_ATTEMPTS = 5
const BASE_MS = 30_000
const MAX_MS = 5 * 60_000

export interface PinGuard {
  failures: number
  until: number
}

/** Espera tras fallos seguidos: 30 s al 5.º, y se dobla hasta un máximo de 5 min. */
export function lockoutMs(failures: number): number {
  if (failures < FREE_ATTEMPTS) return 0
  return Math.min(MAX_MS, BASE_MS * 2 ** (failures - FREE_ATTEMPTS))
}

export function readPinGuard(): PinGuard {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<PinGuard> | null
    return { failures: Number(raw?.failures) || 0, until: Number(raw?.until) || 0 }
  } catch {
    return { failures: 0, until: 0 }
  }
}

function write(g: PinGuard): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(g))
  } catch {
    // Sin almacenamiento la espera solo dura mientras la pestaña siga abierta.
  }
}

export function recordPinFailure(nowMs: number): PinGuard {
  const failures = readPinGuard().failures + 1
  const g = { failures, until: nowMs + lockoutMs(failures) }
  write(g)
  return g
}

export function resetPinGuard(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // nada que limpiar
  }
}
