import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import App from '../App'
import { seed } from '../test/seed'
import { createPinHash } from '../lib/pin'

afterEach(() => vi.useRealTimers())

async function seedWithPin() {
  seed([{}], { pinHash: await createPinHash('1234') })
}

async function typePin(pin: string) {
  for (const d of pin) fireEvent.click(screen.getByRole('button', { name: d }))
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Desbloquear' }))
  })
}

describe('Lock screen', () => {
  it('starts locked and unlocks only with the right PIN', async () => {
    await seedWithPin()
    render(<App />)
    expect(screen.getByRole('heading', { name: /introduce tu pin/i })).toBeInTheDocument()
    await typePin('1111')
    expect(await screen.findByText(/no es correcto/i)).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    await typePin('1234')
    expect(await screen.findByRole('navigation')).toBeInTheDocument()
  })

  it('opens calm mode without the PIN', async () => {
    await seedWithPin()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /necesito ayuda/i }))
    expect(screen.getByRole('dialog', { name: 'Modo calma' })).toBeInTheDocument()
  })

  it('locks again after 5 minutes hidden, not after 2', async () => {
    await seedWithPin()
    vi.useFakeTimers({ toFake: ['Date'] })
    render(<App />)
    await typePin('1234')
    expect(await screen.findByRole('navigation')).toBeInTheDocument()

    const hide = (hidden: boolean) => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (hidden ? 'hidden' : 'visible') })
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'))
      })
    }
    hide(true)
    vi.setSystemTime(Date.now() + 2 * 60_000)
    hide(false)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    hide(true)
    vi.setSystemTime(Date.now() + 6 * 60_000)
    hide(false)
    expect(screen.getByRole('heading', { name: /introduce tu pin/i })).toBeInTheDocument()
  })
})
