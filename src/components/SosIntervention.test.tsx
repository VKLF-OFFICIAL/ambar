import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { SosIntervention } from './SosIntervention'
import { seed } from '../test/seed'
import { useAddictionStore } from '../store/useAddictionStore'
import { useUiStore } from '../store/useUiStore'

beforeEach(() => {
  vi.useFakeTimers()
  seed([{ reasons: [{ id: 'r', text: 'Por mis hijos' }] }])
  useUiStore.setState({ sosOpen: true })
})
afterEach(() => vi.useRealTimers())

// Pulsa y deja que terminen las transiciones de salida (AnimatePresence).
const click = async (name: RegExp | string) => {
  act(() => {
    screen.getByRole('button', { name }).click()
  })
  await act(async () => {
    await vi.advanceTimersByTimeAsync(600)
  })
}

describe('SosIntervention', () => {
  it('starts breathing immediately, without questions, and Escape does not close it', () => {
    render(<SosIntervention />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Inhala')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(useUiStore.getState().sosOpen).toBe(true)
  })

  it('walks the guided path and saves the craving at the end', async () => {
    render(<SosIntervention />)
    await click('Siguiente')
    expect(screen.getByText(/5 cosas que puedes ver/i)).toBeInTheDocument()
    await click('Siguiente')
    expect(screen.getByText('Por mis hijos')).toBeInTheDocument()
    await click('Siguiente')
    await click('Siguiente')
    expect(screen.getByText(/cómo está ahora el antojo/i)).toBeInTheDocument()
    act(() => {
      fireEvent.change(screen.getByRole('slider'), { target: { value: '3' } })
    })
    await click('Guardar')
    expect(useAddictionStore.getState().journal[0]).toMatchObject({ source: 'sos', intensity: 3, trackerId: 't1' })
  })

  it('shows helplines for the user country', async () => {
    render(<SosIntervention />)
    await click(/hablar con alguien/i)
    expect(screen.getByRole('link', { name: /024/ })).toHaveAttribute('href', 'tel:024')
  })

  it('in locked mode hides personal reasons and the relapse option', async () => {
    render(<SosIntervention locked />)
    await click('Siguiente')
    await click('Siguiente')
    expect(screen.queryByText('Por mis hijos')).not.toBeInTheDocument()
    await click('Siguiente')
    await click('Siguiente')
    expect(screen.queryByRole('button', { name: /he recaído/i })).not.toBeInTheDocument()
  })
})
