import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Reasons } from './Reasons'
import { seed } from '../test/seed'
import { useAddictionStore } from '../store/useAddictionStore'
import { DAY } from '../lib/time'

describe('Reasons', () => {
  it('adds and reorders reasons', async () => {
    seed([{ reasons: [{ id: 'a', text: 'Por mi salud' }] }])
    const user = userEvent.setup()
    render(<Reasons />)
    await user.type(screen.getByRole('textbox', { name: /nueva razón/i }), 'Por mis hijos')
    await user.click(screen.getByRole('button', { name: 'Añadir' }))
    expect(screen.getByText('Por mis hijos')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Subir: Por mis hijos' }))
    expect(useAddictionStore.getState().trackers[0]?.reasons.map((r) => r.text)).toEqual(['Por mis hijos', 'Por mi salud'])
  })

  it('shows money saved in the user currency', () => {
    seed([{ costPerDay: 10, startDate: new Date(Date.now() - 3 * DAY).toISOString() }])
    render(<Reasons />)
    expect(screen.getByTestId('money-current')).toHaveTextContent(/30,00\s€/)
  })
})
