import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RelapseFlow } from './RelapseFlow'
import { seed } from '../test/seed'
import { useAddictionStore } from '../store/useAddictionStore'
import { DAY } from '../lib/time'

describe('RelapseFlow', () => {
  it('shows what is not lost, archives the streak and never blames', async () => {
    seed([{ startDate: new Date(Date.now() - 10 * DAY - 1000).toISOString() }])
    const user = userEvent.setup()
    render(<RelapseFlow trackerId="t1" />)
    expect(screen.getByTestId('longest')).toHaveTextContent('10')
    expect(document.body.textContent).not.toMatch(/fracas|culpa|failure/i)
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    await user.click(screen.getByRole('button', { name: 'Estrés' }))
    await user.click(screen.getByRole('button', { name: 'Saltar' }))
    await user.click(screen.getByRole('button', { name: 'Saltar' }))
    const t = useAddictionStore.getState().trackers[0]
    expect(t?.streakHistory).toHaveLength(1)
    expect(t?.streakHistory[0]?.trigger).toEqual(['stress'])
    expect(Date.now() - Date.parse(t?.startDate ?? '')).toBeLessThan(5000)
    expect(screen.getByRole('button', { name: 'Empezar de nuevo' })).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/fracas|culpa|failure/i)
  })
})
