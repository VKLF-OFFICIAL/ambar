import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { Dashboard } from './Dashboard'
import { seed } from '../test/seed'
import { useAddictionStore } from '../store/useAddictionStore'
import { DAY, HOUR, MINUTE } from '../lib/time'

const NOW = new Date(2026, 9, 17, 10, 0, 0).getTime()

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: false })
  vi.setSystemTime(NOW)
})
afterEach(() => vi.useRealTimers())

describe('Dashboard', () => {
  it('shows the live counter', () => {
    seed([{ startDate: new Date(NOW - (DAY + 2 * HOUR + 3 * MINUTE + 4000)).toISOString(), celebratedMilestones: ['24h'] }])
    render(<Dashboard />)
    expect(screen.getByTestId('days')).toHaveTextContent('1')
    expect(screen.getByTestId('hms')).toHaveTextContent('02 h · 03 min · 04 s')
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByTestId('hms')).toHaveTextContent('02 h · 03 min · 05 s')
  })

  it('celebrates only the highest pending milestone, once', async () => {
    seed([{ startDate: new Date(NOW - 8 * DAY).toISOString() }])
    render(<Dashboard />)
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    expect(screen.getByRole('dialog')).toHaveTextContent('Una semana')
    act(() => {
      screen.getByRole('button', { name: 'Gracias' }).click()
    })
    expect(useAddictionStore.getState().trackers[0]?.celebratedMilestones).toEqual(['12h', '24h', '3d', '1w'])
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('lets the user make the daily pledge', () => {
    seed([{ startDate: new Date(NOW - HOUR).toISOString() }])
    render(<Dashboard />)
    act(() => {
      screen.getByRole('button', { name: /hoy me comprometo/i }).click()
    })
    expect(useAddictionStore.getState().pledges[0]).toMatchObject({ date: '2026-10-17' })
    expect(screen.getByText(/compromiso de hoy/i)).toBeInTheDocument()
  })
})
