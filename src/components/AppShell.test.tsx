import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { seed } from '../test/seed'

describe('App shell', () => {
  it('navigates between tabs and toggles the theme', async () => {
    seed()
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Diario' }))
    expect(screen.getByRole('button', { name: 'Diario' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: /necesito ayuda/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /modo claro/i }))
    expect(document.documentElement.dataset.theme).toBe('light')
    await user.click(screen.getByRole('button', { name: /modo oscuro/i }))
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
