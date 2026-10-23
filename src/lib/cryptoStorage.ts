import type { StateStorage } from 'zustand/middleware'
import { createSafeStorage } from './storage'
import { decryptString, encryptString } from './crypto'

/**
 * Almacenamiento para zustand/persist que cifra el estado en reposo cuando hay PIN.
 *
 * - Sin PIN: guarda texto plano de forma SÍNCRONA (comportamiento idéntico al anterior).
 * - Con PIN: cifra con AES-GCM usando una clave que vive solo en memoria (`sessionKey`),
 *   derivada del PIN al desbloquear. Sin clave, el dato cifrado no se puede leer.
 *
 * Guardia anti-borrado: si los metadatos dicen que está cifrado pero no hay clave en
 * memoria (app bloqueada al arrancar), `setItem` NO escribe, para que un estado por
 * defecto vacío jamás sobrescriba el blob cifrado del usuario.
 */

const META_KEY = 'ambar-enc'

interface SyncRaw {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

interface Meta {
  enc: boolean
  /** Verificador `sal:hash` (mismo formato que pin.ts), legible antes de descifrar. */
  pinHash?: string
}

type Envelope = { enc: false; state: string } | { enc: true; iv: string; ct: string }

let raw: SyncRaw = createSafeStorage(() => {}) as unknown as SyncRaw
let sessionKey: CryptoKey | null = null

function readMeta(): Meta | null {
  const s = raw.getItem(META_KEY)
  if (typeof s !== 'string') return null
  try {
    const m = JSON.parse(s) as unknown
    return m && typeof m === 'object' && typeof (m as Meta).enc === 'boolean' ? (m as Meta) : null
  } catch {
    return null
  }
}

function parseEnvelope(v: unknown): Envelope | null {
  if (typeof v !== 'object' || v === null) return null
  const o = v as Record<string, unknown>
  if (o.enc === false && typeof o.state === 'string') return { enc: false, state: o.state }
  if (o.enc === true && typeof o.iv === 'string' && typeof o.ct === 'string') return { enc: true, iv: o.iv, ct: o.ct }
  return null
}

function getItem(name: string): string | null | Promise<string | null> {
  const rawStr = raw.getItem(name)
  if (rawStr == null) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(rawStr)
  } catch {
    return rawStr
  }
  const env = parseEnvelope(parsed)
  if (!env) return rawStr // formato antiguo (texto plano sin envelope)
  if (env.enc === false) return env.state
  if (!sessionKey) return null // cifrado y bloqueado: aún no se puede leer
  return decryptString(sessionKey, { iv: env.iv, ct: env.ct })
}

async function setItem(name: string, value: string): Promise<void> {
  const meta = readMeta()
  if (meta?.enc && !sessionKey) return // guardia anti-borrado
  if (sessionKey) {
    const enc = await encryptString(sessionKey, value)
    raw.setItem(name, JSON.stringify({ enc: true, iv: enc.iv, ct: enc.ct }))
  } else {
    raw.setItem(name, JSON.stringify({ enc: false, state: value }))
  }
}

function removeItem(name: string): void {
  raw.removeItem(name)
}

/** Crea el almacenamiento y fija el `raw` subyacente (localStorage con respaldo en memoria). */
export function createCryptoStorage(onUnavailable: () => void): StateStorage {
  raw = createSafeStorage(onUnavailable) as unknown as SyncRaw
  return { getItem, setItem, removeItem }
}

/** ¿Hay datos cifrados en reposo? Lectura síncrona, usable antes de hidratar. */
export function isEncrypted(): boolean {
  return readMeta()?.enc === true
}

/** Verificador del PIN legible antes de descifrar (para la pantalla de bloqueo). */
export function metaPinHash(): string | undefined {
  return readMeta()?.pinHash
}

export function setSessionKey(key: CryptoKey | null): void {
  sessionKey = key
}

export function hasSessionKey(): boolean {
  return sessionKey !== null
}

/** Marca el almacenamiento como cifrado (guarda el verificador en claro). */
export function enableEncryptionMeta(pinHash: string): void {
  raw.setItem(META_KEY, JSON.stringify({ enc: true, pinHash }))
}

/** Quita el cifrado: borra los metadatos y la clave de sesión. */
export function disableEncryptionMeta(): void {
  sessionKey = null
  raw.removeItem(META_KEY)
}
