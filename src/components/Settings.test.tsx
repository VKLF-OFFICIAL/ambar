import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Settings } from './Settings'
import { seed } from '../test/seed'
import { useAddictionStore } from '../store/useAddictionStore'

describe('Settings', () => {
  it('rejects an invalid backup file kindly and keeps the data', async () => {
    seed()
    const user = userEvent.setup()
    render(<Settings />)
    const before = JSON.stringify(useAddictionStore.getState().trackers)
    const file = new File(['{bad json'], 'backup.json', { type: 'application/json' })
    await user.upload(screen.getByLabelText(/importar copia/i), file)
    expect(await screen.findByRole('alert')).toHaveTextContent(/no se ha podido leer/i)
    expect(JSON.stringify(useAddictionStore.getState().trackers)).toBe(before)
  })

  it('switches the language', async () => {
    seed()
    const user = userEvent.setup()
    render(<Settings />)
    await user.click(screen.getByRole('button', { name: 'English' }))
    expect(useAddictionStore.getState().settings.locale).toBe('en')
  })
})
