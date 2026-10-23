import { beforeEach, describe, expect, it } from 'vitest'
import {
  createCryptoStorage,
  disableEncryptionMeta,
  enableEncryptionMeta,
  isEncrypted,
  metaPinHash,
  setSessionKey,
} from './cryptoStorage'
import { deriveKey, randomSaltHex } from './crypto'

const KEY = 'ambar-store'

beforeEach(() => {
  localStorage.clear()
  createCryptoStorage(() => {})
  disableEncryptionMeta() // limpia metadatos y clave de sesión
})

describe('cryptoStorage', () => {
  it('stores and reads plain text when there is no PIN', async () => {
    const storage = createCryptoStorage(() => {})
    await storage.setItem(KEY, 'INNER')
    expect(storage.getItem(KEY)).toBe('INNER')
    expect(JSON.parse(localStorage.getItem(KEY) ?? '{}')).toEqual({ enc: false, state: 'INNER' })
    expect(isEncrypted()).toBe(false)
  })

  it('encrypts at rest and decrypts with the session key', async () => {
    const storage = createCryptoStorage(() => {})
    const salt = randomSaltHex()
    setSessionKey(await deriveKey('1234', salt))
    enableEncryptionMeta(`${salt}:verifier`)

    await storage.setItem(KEY, 'SECRET')

    expect(isEncrypted()).toBe(true)
    const stored = localStorage.getItem(KEY) ?? ''
    expect(stored).not.toContain('SECRET')
    expect(JSON.parse(stored).enc).toBe(true)
    expect(await storage.getItem(KEY)).toBe('SECRET')
  })

  it('never overwrites encrypted data while locked (no session key)', async () => {
    const storage = createCryptoStorage(() => {})
    const salt = randomSaltHex()
    const key = await deriveKey('1234', salt)
    setSessionKey(key)
    enableEncryptionMeta(`${salt}:verifier`)
    await storage.setItem(KEY, 'SECRET')

    // Simula el arranque bloqueado: metadatos cifrados pero sin clave.
    setSessionKey(null)
    await storage.setItem(KEY, 'EMPTY') // debe ser un no-op
    expect(storage.getItem(KEY)).toBeNull() // sin clave no se puede leer

    // La clave vuelve: el dato original sigue intacto, no se escribió 'EMPTY'.
    setSessionKey(key)
    expect(await storage.getItem(KEY)).toBe('SECRET')
  })

  it('reads legacy plain-text data without an envelope', () => {
    const storage = createCryptoStorage(() => {})
    const legacy = '{"state":{"x":1},"version":1}'
    localStorage.setItem(KEY, legacy)
    expect(storage.getItem(KEY)).toBe(legacy)
  })

  it('tracks encryption metadata', () => {
    expect(isEncrypted()).toBe(false)
    enableEncryptionMeta('aa:bb')
    expect(isEncrypted()).toBe(true)
    expect(metaPinHash()).toBe('aa:bb')
    disableEncryptionMeta()
    expect(isEncrypted()).toBe(false)
    expect(metaPinHash()).toBeUndefined()
  })
})
