import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Journal } from './Journal'
import { seed } from '../test/seed'
import { useAddictionStore } from '../store/useAddictionStore'

describe('Journal', () => {
  it('saves a quick check-in without typing and resets the form', async () => {
    seed()
    const user = userEvent.setup()
    render(<Journal />)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '8' } })
    await user.click(screen.getByRole('button', { name: 'Estrés' }))
    await user.click(screen.getByRole('button', { name: 'Casa' }))
    await user.click(screen.getByRole('button', { name: 'Sí, lo superé' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(useAddictionStore.getState().journal[0]).toMatchObject({
      trackerId: 't1',
      intensity: 8,
      emotions: ['stress'],
      environments: ['home'],
      overcame: true,
      source: 'checkin',
    })
    expect(screen.getByRole('button', { name: 'Estrés' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('list', { name: /registros recientes/i })).toHaveTextContent('Estrés')
  })
})
