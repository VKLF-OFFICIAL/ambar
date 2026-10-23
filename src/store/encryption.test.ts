import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { initialState, useAddictionStore } from './useAddictionStore'
import { isEncrypted, setSessionKey } from '../lib/cryptoStorage'
import { deriveKey } from '../lib/crypto'

const S = () => useAddictionStore.getState()

beforeEach(() => {
  localStorage.clear()
  setSessionKey(null)
  useAddictionStore.setState(initialState(), false)
})

afterEach(() => {
  setSessionKey(null)
  localStorage.clear()
})

describe('store encryption at rest', () => {
  it('encrypts persisted data once a PIN is set and decrypts it on unlock', async () => {
    const id = S().addTracker({ kind: 'alcohol' })
    await S().setPin('1234')

    // El guardado cifrado llega a localStorage de forma asíncrona.
    await vi.waitFor(() => {
      const raw = localStorage.getItem('ambar-store')
      expect(raw).toBeTruthy()
      expect(JSON.parse(raw ?? '{}').enc).toBe(true)
    })
    expect(isEncrypted()).toBe(true)
    // El tipo de adicción no aparece en claro en el dato en reposo.
    expect(localStorage.getItem('ambar-store') ?? '').not.toContain('alcohol')

    // Simula una recarga bloqueada: sin clave y con el estado en memoria vacío.
    setSessionKey(null)
    useAddictionStore.setState(initialState(), false)

    // Desbloqueo: deriva la clave del PIN (sal guardada en los metadatos) y descifra.
    const pinHash = JSON.parse(localStorage.getItem('ambar-enc') ?? '{}').pinHash as string
    setSessionKey(await deriveKey('1234', pinHash.split(':')[0] ?? ''))
    await useAddictionStore.persist.rehydrate()

    expect(S().trackers.map((t) => t.id)).toContain(id)
  })

  it('returns to plain text when the PIN is removed', async () => {
    S().addTracker({ kind: 'tobacco' })
    await S().setPin('1234')
    await vi.waitFor(() => expect(JSON.parse(localStorage.getItem('ambar-store') ?? '{}').enc).toBe(true))

    await S().setPin(null)
    await vi.waitFor(() => expect(JSON.parse(localStorage.getItem('ambar-store') ?? '{}').enc).toBe(false))
    expect(isEncrypted()).toBe(false)
  })
})
