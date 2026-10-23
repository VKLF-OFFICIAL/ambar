import { describe, expect, it } from 'vitest'
import { decryptString, deriveKey, encryptString, randomSaltHex } from './crypto'

describe('crypto', () => {
  it('encrypts and decrypts a round trip with the same PIN', async () => {
    const salt = randomSaltHex()
    const key = await deriveKey('1234', salt)
    const enc = await encryptString(key, 'datos privados de recuperación')
    expect(enc.ct).not.toContain('recuperación')
    expect(await decryptString(key, enc)).toBe('datos privados de recuperación')
  })

  it('fails to decrypt with the wrong PIN', async () => {
    const salt = randomSaltHex()
    const enc = await encryptString(await deriveKey('1234', salt), 'secreto')
    const wrong = await deriveKey('0000', salt)
    await expect(decryptString(wrong, enc)).rejects.toBeTruthy()
  })

  it('produces a 32-char hex salt', () => {
    expect(randomSaltHex()).toMatch(/^[0-9a-f]{32}$/)
  })
})
