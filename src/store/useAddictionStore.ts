import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { JournalEntry, Pledge, Reason, Settings, Tracker, TrackerKind } from './types'
import type { MessageKey } from '../i18n'
import { RELAPSE_MESSAGE_KEYS } from '../data/messages'
import { milestonesUpTo } from '../lib/milestones'
import { clampToNow, getElapsed } from '../lib/time'
import { hashPin } from '../lib/pin'
import { cryptoAvailable, deriveKey, randomSaltHex } from '../lib/crypto'
import { exportData as serialize, parseImport, sanitizeData } from '../lib/backup'
import { createCryptoStorage, disableEncryptionMeta, enableEncryptionMeta, setSessionKey } from '../lib/cryptoStorage'

export interface NewTrackerInput {
  kind: TrackerKind
  customName?: string
  startDate?: string
  costPerDay?: number
  minutesPerDay?: number
  redLine?: string
  medicalNoticeAck?: boolean
}

export interface Reflection {
  trigger?: string[]
  note?: string
  plan?: string[]
}

interface Data {
  trackers: Tracker[]
  journal: JournalEntry[]
  pledges: Pledge[]
  settings: Settings
  storageAvailable: boolean
}

interface Actions {
  addTracker: (input: NewTrackerInput) => string
  updateTracker: (id: string, patch: Partial<Omit<Tracker, 'id'>>) => void
  removeTracker: (id: string) => void
  setActiveTracker: (id: string) => void
  resetStreak: (id: string, reflection: Reflection, nowMs?: number) => MessageKey
  addJournalEntry: (e: Omit<JournalEntry, 'id' | 'at'> & { at?: string }) => void
  /** Encola una entrada creada con la app bloqueada y cifrada; se vuelca al desbloquear. */
  bufferJournalEntry: (e: Omit<JournalEntry, 'id' | 'at'> & { at?: string }) => void
  deleteJournalEntry: (id: string) => void
  addReason: (trackerId: string, text: string, emoji?: string) => void
  updateReason: (trackerId: string, reasonId: string, patch: Partial<Omit<Reason, 'id'>>) => void
  removeReason: (trackerId: string, reasonId: string) => void
  reorderReasons: (trackerId: string, ids: string[]) => void
  markMilestoneCelebrated: (trackerId: string, milestoneId: string) => void
  makePledge: (dateKey: string) => void
  closeDay: (dateKey: string, rating: 1 | 2 | 3 | 4 | 5, note?: string) => void
  updateSettings: (patch: Partial<Settings>) => void
  setPin: (pin: string | null) => Promise<void>
  /** Descifra y rehidrata al desbloquear, y vuelca lo encolado mientras estuvo bloqueado. */
  unlockAndRehydrate: () => Promise<void>
  exportData: () => string
  importData: (json: string) => { ok: true } | { ok: false; reason: 'parse' | 'shape' | 'version' }
  wipeAll: () => void
}

export type AmbarState = Data & Actions

const newId = () => crypto.randomUUID()

// Entradas creadas con la app bloqueada y cifrada (aún sin tracker ni clave): se vuelcan al desbloquear.
let pendingJournal: Array<Omit<JournalEntry, 'id' | 'at'> & { at?: string }> = []

function defaultSettings(): Settings {
  const lang = typeof navigator !== 'undefined' ? navigator.language : 'es-ES'
  const locale = lang.toLowerCase().startsWith('es') ? 'es' : 'en'
  return {
    theme: 'dark',
    locale,
    country: locale === 'es' ? 'ES' : 'US',
    currency: locale === 'es' ? 'EUR' : 'USD',
    reduceMotion: false,
    customHelplines: [],
    onboarded: false,
  }
}

export function initialState(): Data {
  return { trackers: [], journal: [], pledges: [], settings: defaultSettings(), storageAvailable: true }
}

export const useAddictionStore = create<AmbarState>()(
  persist(
    (set, get) => {
      const mapTracker = (id: string, fn: (t: Tracker) => Tracker) =>
        set((s) => ({ trackers: s.trackers.map((t) => (t.id === id ? fn(t) : t)) }))

      const upsertPledge = (dateKey: string, fn: (p: Pledge) => Pledge) =>
        set((s) => {
          const existing = s.pledges.find((p) => p.date === dateKey) ?? { date: dateKey }
          return { pledges: [...s.pledges.filter((p) => p.date !== dateKey), fn(existing)] }
        })

      return {
        ...initialState(),

        addTracker: (input) => {
          const id = newId()
          const now = new Date().toISOString()
          const tracker: Tracker = {
            id,
            kind: input.kind,
            customName: input.customName,
            startDate: clampToNow(input.startDate),
            createdAt: now,
            costPerDay: input.costPerDay,
            minutesPerDay: input.minutesPerDay,
            redLine: input.redLine,
            medicalNoticeAck: input.medicalNoticeAck,
            reasons: [],
            streakHistory: [],
            celebratedMilestones: [],
          }
          set((s) => ({ trackers: [...s.trackers, tracker], settings: { ...s.settings, activeTrackerId: id } }))
          return id
        },

        updateTracker: (id, patch) =>
          mapTracker(id, (t) => {
            if (!patch.startDate) return { ...t, ...patch }
            // Si la racha ahora es más corta, los hitos que aún no tocan se volverán a celebrar.
            const startDate = clampToNow(patch.startDate)
            const reached = new Set(milestonesUpTo(getElapsed(startDate, Date.now()).totalMs).map((m) => m.id))
            return { ...t, ...patch, startDate, celebratedMilestones: t.celebratedMilestones.filter((m) => reached.has(m)) }
          }),

        removeTracker: (id) =>
          set((s) => {
            const trackers = s.trackers.filter((t) => t.id !== id)
            const activeTrackerId =
              s.settings.activeTrackerId === id ? trackers[0]?.id : s.settings.activeTrackerId
            return {
              trackers,
              journal: s.journal.filter((e) => e.trackerId !== id),
              settings: { ...s.settings, activeTrackerId },
            }
          }),

        setActiveTracker: (id) => set((s) => ({ settings: { ...s.settings, activeTrackerId: id } })),

        resetStreak: (id, reflection, nowMs = Date.now()) => {
          const end = new Date(nowMs).toISOString()
          mapTracker(id, (t) => ({
            ...t,
            streakHistory: [
              ...t.streakHistory,
              {
                start: t.startDate,
                end,
                durationMs: getElapsed(t.startDate, nowMs).totalMs,
                trigger: reflection.trigger,
                note: reflection.note,
                plan: reflection.plan,
              },
            ],
            startDate: end,
            celebratedMilestones: [],
          }))
          const idx = Math.floor(Math.random() * RELAPSE_MESSAGE_KEYS.length)
          return RELAPSE_MESSAGE_KEYS[idx] ?? 'relapseMessages.m1'
        },

        addJournalEntry: (e) =>
          set((s) => ({ journal: [{ ...e, id: newId(), at: e.at ?? new Date().toISOString() }, ...s.journal] })),

        bufferJournalEntry: (e) => {
          pendingJournal.push(e)
        },

        deleteJournalEntry: (id) => set((s) => ({ journal: s.journal.filter((e) => e.id !== id) })),

        addReason: (trackerId, text, emoji) =>
          mapTracker(trackerId, (t) => ({ ...t, reasons: [...t.reasons, { id: newId(), text, emoji }] })),

        updateReason: (trackerId, reasonId, patch) =>
          mapTracker(trackerId, (t) => ({
            ...t,
            reasons: t.reasons.map((r) => (r.id === reasonId ? { ...r, ...patch } : r)),
          })),

        removeReason: (trackerId, reasonId) =>
          mapTracker(trackerId, (t) => ({ ...t, reasons: t.reasons.filter((r) => r.id !== reasonId) })),

        reorderReasons: (trackerId, ids) =>
          mapTracker(trackerId, (t) => ({
            ...t,
            reasons: ids.map((id) => t.reasons.find((r) => r.id === id)).filter((r): r is Reason => !!r),
          })),

        markMilestoneCelebrated: (trackerId, milestoneId) =>
          mapTracker(trackerId, (t) => {
            const reached = milestonesUpTo(getElapsed(t.startDate, Date.now()).totalMs)
            const idx = reached.findIndex((m) => m.id === milestoneId)
            const ids = idx >= 0 ? reached.slice(0, idx + 1).map((m) => m.id) : [milestoneId]
            return { ...t, celebratedMilestones: [...new Set([...t.celebratedMilestones, ...ids])] }
          }),

        makePledge: (dateKey) => upsertPledge(dateKey, (p) => ({ ...p, pledgedAt: new Date().toISOString() })),

        closeDay: (dateKey, rating, note) => upsertPledge(dateKey, (p) => ({ ...p, dayRating: rating, note })),

        updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

        setPin: async (pin) => {
          if (pin) {
            // Sin WebCrypto (contexto no seguro) no se puede cifrar: no se activa el PIN.
            if (!cryptoAvailable()) return
            // Sal única: sirve de verificador (sal:hash) y de semilla para la clave AES.
            const salt = randomSaltHex()
            const pinHash = `${salt}:${await hashPin(pin, salt)}`
            const key = await deriveKey(pin, salt)
            setSessionKey(key)
            enableEncryptionMeta(pinHash)
            set((s) => ({ settings: { ...s.settings, pinHash } })) // provoca el guardado cifrado
          } else {
            disableEncryptionMeta()
            set((s) => ({ settings: { ...s.settings, pinHash: undefined } })) // vuelve a texto plano
          }
        },

        unlockAndRehydrate: async () => {
          await useAddictionStore.persist.rehydrate()
          if (pendingJournal.length === 0) return
          const buffered = pendingJournal
          pendingJournal = []
          const active = selectActiveTracker(get())
          if (!active) return // sin tracker al que asociar; se descarta
          set((s) => ({
            journal: [
              ...buffered.map((e) => ({
                ...e,
                id: newId(),
                trackerId: e.trackerId || active.id,
                at: e.at ?? new Date().toISOString(),
              })),
              ...s.journal,
            ],
          }))
        },

        exportData: () => {
          const { trackers, journal, pledges, settings } = get()
          return serialize({ trackers, journal, pledges, settings })
        },

        importData: (json) => {
          const result = parseImport(json)
          if (!result.ok) return result
          // El PIN actual se conserva: una copia antigua no debe dejar a nadie fuera de su app.
          set((s) => ({ ...result.data, settings: { ...result.data.settings, pinHash: s.settings.pinHash } }))
          return { ok: true }
        },

        wipeAll: () => {
          // Quita el cifrado para que el estado vacío se escriba en claro (y no lo bloquee la guardia).
          disableEncryptionMeta()
          pendingJournal = []
          set({ ...initialState(), storageAvailable: get().storageAvailable })
        },
      }
    },
    {
      name: 'ambar-store',
      version: 1,
      // Valida al migrar en lugar de confiar a ciegas; `merge` vuelve a sanear en cada carga.
      migrate: (persisted) => sanitizeData(persisted) as AmbarState,
      merge: mergePersisted,
      storage: createJSONStorage(() =>
        createCryptoStorage(() => {
          queueMicrotask(() => useAddictionStore.setState({ storageAvailable: false }))
        }),
      ),
      partialize: ({ trackers, journal, pledges, settings }) => ({ trackers, journal, pledges, settings }),
    },
  ),
)

export function selectActiveTracker(s: AmbarState): Tracker | undefined {
  return s.trackers.find((t) => t.id === s.settings.activeTrackerId) ?? s.trackers[0]
}

/**
 * Mezcla lo guardado con el estado actual saneando los datos: los registros corruptos
 * se descartan y lo que falte o no sea válido cae a los valores por defecto, de modo que
 * un `localStorage` dañado nunca rompe la app ni carga datos inválidos en memoria.
 */
export function mergePersisted(persisted: unknown, current: AmbarState): AmbarState {
  const clean = sanitizeData(persisted)
  return {
    ...current,
    trackers: clean.trackers ?? current.trackers,
    journal: clean.journal ?? current.journal,
    pledges: clean.pledges ?? current.pledges,
    settings: { ...current.settings, ...(clean.settings ?? {}) },
  }
}
