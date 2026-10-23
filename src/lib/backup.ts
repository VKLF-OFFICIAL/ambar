import type { Helpline, JournalEntry, Pledge, Settings, Tracker } from '../store/types'
import { TRACKER_KINDS } from '../data/trackerKinds'
import { clampToNow } from './time'

export const BACKUP_VERSION = 1

export interface BackupData {
  trackers: Tracker[]
  journal: JournalEntry[]
  pledges: Pledge[]
  settings: Settings
}

export type ImportResult = { ok: true; data: BackupData; exportedAt?: string } | { ok: false; reason: 'parse' | 'shape' | 'version' }

export function exportData(data: BackupData): string {
  return JSON.stringify({ app: 'ambar', version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data }, null, 2)
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isStr = (v: unknown): v is string => typeof v === 'string'
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr)
const optStr = (v: unknown) => v === undefined || isStr(v)
const KINDS = new Set<string>(TRACKER_KINDS.map((k) => k.kind))
const PIN_HASH = /^[0-9a-f]{32}:[0-9a-f]{64}$/

export function isTracker(v: unknown): v is Tracker {
  return (
    isObj(v) &&
    isStr(v.id) &&
    isStr(v.kind) &&
    KINDS.has(v.kind) &&
    optStr(v.customName) &&
    optStr(v.redLine) &&
    optStr(v.crisisLetter) &&
    isStr(v.startDate) &&
    Number.isFinite(Date.parse(v.startDate)) &&
    isStr(v.createdAt) &&
    Array.isArray(v.reasons) &&
    v.reasons.every((r) => isObj(r) && isStr(r.id) && isStr(r.text) && optStr(r.emoji)) &&
    Array.isArray(v.streakHistory) &&
    v.streakHistory.every((s) => isObj(s) && isStr(s.start) && isStr(s.end) && isNum(s.durationMs)) &&
    isStrArr(v.celebratedMilestones)
  )
}

export function isEntry(v: unknown): v is JournalEntry {
  return (
    isObj(v) &&
    isStr(v.id) &&
    isStr(v.trackerId) &&
    isStr(v.at) &&
    (v.source === 'checkin' || v.source === 'sos') &&
    isNum(v.intensity) &&
    isStrArr(v.emotions) &&
    isStrArr(v.environments)
  )
}

export function isPledge(v: unknown): v is Pledge {
  return isObj(v) && isStr(v.date)
}

export function isSettings(v: unknown): v is Settings {
  return (
    isObj(v) &&
    (v.theme === 'dark' || v.theme === 'light') &&
    (v.locale === 'es' || v.locale === 'en') &&
    isStr(v.country) &&
    isStr(v.currency) &&
    typeof v.reduceMotion === 'boolean' &&
    typeof v.onboarded === 'boolean' &&
    (v.pinHash === undefined || (isStr(v.pinHash) && PIN_HASH.test(v.pinHash))) &&
    optStr(v.name) &&
    optStr(v.activeTrackerId) &&
    Array.isArray(v.customHelplines) &&
    v.customHelplines.every((h) => isObj(h) && isStr(h.label) && isStr(h.phone))
  )
}

export function parseImport(json: string): ImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return { ok: false, reason: 'parse' }
  }
  if (!isObj(parsed) || parsed.app !== 'ambar' || !isObj(parsed.data)) return { ok: false, reason: 'shape' }
  if (parsed.version !== BACKUP_VERSION) return { ok: false, reason: 'version' }
  const d = parsed.data
  if (
    !Array.isArray(d.trackers) ||
    !d.trackers.every(isTracker) ||
    !Array.isArray(d.journal) ||
    !d.journal.every(isEntry) ||
    !Array.isArray(d.pledges) ||
    !d.pledges.every(isPledge) ||
    !isSettings(d.settings)
  ) {
    return { ok: false, reason: 'shape' }
  }
  const trackers = d.trackers.map((t) => ({ ...t, startDate: clampToNow(t.startDate) }))
  return {
    ok: true,
    data: { trackers, journal: d.journal, pledges: d.pledges, settings: d.settings },
    exportedAt: isStr(parsed.exportedAt) ? parsed.exportedAt : undefined,
  }
}

/**
 * Valida un objeto `settings` campo a campo: conserva los campos válidos y descarta
 * solo los corruptos, para que datos antiguos (a los que les falte algún campo nuevo)
 * sigan sirviendo y se completen después con los valores por defecto.
 */
export function sanitizeSettings(raw: unknown): Partial<Settings> {
  if (!isObj(raw)) return {}
  const s: Partial<Settings> = {}
  if (raw.theme === 'dark' || raw.theme === 'light') s.theme = raw.theme
  if (raw.locale === 'es' || raw.locale === 'en') s.locale = raw.locale
  if (isStr(raw.country)) s.country = raw.country
  if (isStr(raw.currency)) s.currency = raw.currency
  if (typeof raw.reduceMotion === 'boolean') s.reduceMotion = raw.reduceMotion
  if (typeof raw.onboarded === 'boolean') s.onboarded = raw.onboarded
  if (isStr(raw.pinHash) && PIN_HASH.test(raw.pinHash)) s.pinHash = raw.pinHash
  if (isStr(raw.name)) s.name = raw.name
  if (isStr(raw.activeTrackerId)) s.activeTrackerId = raw.activeTrackerId
  if (Array.isArray(raw.customHelplines) && raw.customHelplines.every((h) => isObj(h) && isStr(h.label) && isStr(h.phone))) {
    s.customHelplines = raw.customHelplines as Helpline[]
  }
  return s
}

/**
 * Valida datos ya persistidos (localStorage), tolerando corrupción: conserva los
 * registros válidos y descarta solo los que no lo son, para que un almacenamiento
 * dañado o de una versión futura no rompa la app ni cargue basura en memoria.
 * Devuelve solo las claves cuyo valor se pudo recuperar.
 */
export type SanitizedData = {
  trackers?: Tracker[]
  journal?: JournalEntry[]
  pledges?: Pledge[]
  settings?: Partial<Settings>
}

export function sanitizeData(raw: unknown): SanitizedData {
  const o = isObj(raw) ? raw : {}
  const out: SanitizedData = {}
  if (Array.isArray(o.trackers)) {
    out.trackers = o.trackers.filter(isTracker).map((t) => ({ ...t, startDate: clampToNow(t.startDate) }))
  }
  if (Array.isArray(o.journal)) out.journal = o.journal.filter(isEntry)
  if (Array.isArray(o.pledges)) out.pledges = o.pledges.filter(isPledge)
  if (isObj(o.settings)) out.settings = sanitizeSettings(o.settings)
  return out
}
