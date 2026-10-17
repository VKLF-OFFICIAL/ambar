export interface Elapsed {
  totalMs: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

export const SECOND = 1000
export const MINUTE = 60 * SECOND
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR

export function getElapsed(startISO: string, nowMs: number): Elapsed {
  const start = Date.parse(startISO)
  const totalMs = Number.isFinite(start) ? Math.max(0, nowMs - start) : 0
  return {
    totalMs,
    days: Math.floor(totalMs / DAY),
    hours: Math.floor((totalMs % DAY) / HOUR),
    minutes: Math.floor((totalMs % HOUR) / MINUTE),
    seconds: Math.floor((totalMs % MINUTE) / SECOND),
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Fecha local `YYYY-MM-DD` (no UTC), para agrupar por día del calendario. */
export function toLocalDateKey(d: Date | number): string {
  const date = typeof d === 'number' ? new Date(d) : d
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function twoDigits(n: number): string {
  return pad(n)
}

/** ISO de la fecha dada, sin pasar de ahora; ahora si no es válida. */
export function clampToNow(iso: string | undefined, nowMs = Date.now()): string {
  const ms = iso ? Date.parse(iso) : NaN
  return new Date(Number.isFinite(ms) ? Math.min(ms, nowMs) : nowMs).toISOString()
}

/** Hora "HH:MM" de hoy; si cae después de ahora, se entiende que fue ayer. */
export function resolveEntryTime(hhmm: string, nowMs: number): Date {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(nowMs)
  if (Number.isFinite(h) && Number.isFinite(m)) d.setHours(h as number, m as number, 0, 0)
  if (d.getTime() > nowMs) d.setDate(d.getDate() - 1)
  return d
}
