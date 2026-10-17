import { describe, expect, it } from 'vitest'
import { createPinHash, verifyPin } from './pin'

describe('pin', () => {
  it('verifies the right pin and rejects others', async () => {
    const stored = await createPinHash('1234')
    expect(stored).not.toContain('1234')
    expect(await verifyPin('1234', stored)).toBe(true)
    expect(await verifyPin('1235', stored)).toBe(false)
  })
})
