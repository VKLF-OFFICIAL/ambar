import { describe, expect, it } from 'vitest'
import { breathAt, BREATH_TOTAL_MS } from './breath'

describe('breathAt (4-7-8, 4 ciclos)', () => {
  it('follows inhale 4 s, hold 7 s, exhale 8 s', () => {
    expect(breathAt(0)).toEqual({ cycle: 1, phase: 'inhale', secondsLeft: 4, done: false })
    expect(breathAt(4000)).toMatchObject({ cycle: 1, phase: 'hold', secondsLeft: 7 })
    expect(breathAt(11000)).toMatchObject({ cycle: 1, phase: 'exhale', secondsLeft: 8 })
    expect(breathAt(18500)).toMatchObject({ phase: 'exhale', secondsLeft: 1 })
    expect(breathAt(19000)).toMatchObject({ cycle: 2, phase: 'inhale', secondsLeft: 4 })
  })

  it('is done after 4 cycles (76 s)', () => {
    expect(BREATH_TOTAL_MS).toBe(76000)
    expect(breathAt(75999).done).toBe(false)
    expect(breathAt(76000).done).toBe(true)
  })
})
