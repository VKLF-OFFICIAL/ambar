import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Onboarding } from './Onboarding'
import { initialState, useAddictionStore } from '../../store/useAddictionStore'

beforeEach(() => {
  const base = initialState()
  useAddictionStore.setState({ ...base, settings: { ...base.settings, locale: 'es' } }, false)
})

async function skipOptional(user: ReturnType<typeof userEvent.setup>) {
  // inicio (ahora) → coste → por qués → nombre → PIN
  await user.click(screen.getByRole('button', { name: 'Desde ahora mismo' }))
  for (let i = 0; i < 4; i++) await user.click(screen.getByRole('button', { name: 'Saltar' }))
}

describe('Onboarding', () => {
  it('shows the medical notice for alcohol and completes with defaults', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)
    await user.click(screen.getByRole('button', { name: 'Empezar' }))
    await user.click(screen.getByRole('button', { name: /Alcohol/ }))
    expect(screen.getByRole('heading', { name: /antes de dejarlo/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Entendido' }))
    await skipOptional(user)
    const s = useAddictionStore.getState()
    expect(s.settings.onboarded).toBe(true)
    expect(s.trackers).toHaveLength(1)
    expect(s.trackers[0]).toMatchObject({ kind: 'alcohol', medicalNoticeAck: true })
  })

  it('asks for a red line for food and no medical notice', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)
    await user.click(screen.getByRole('button', { name: 'Empezar' }))
    await user.click(screen.getByRole('button', { name: /Comida/ }))
    expect(screen.getByRole('heading', { name: /línea roja/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /antes de dejarlo/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Un atracón' }))
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    await skipOptional(user)
    expect(useAddictionStore.getState().trackers[0]).toMatchObject({ kind: 'food', redLine: 'Un atracón' })
  })
})
