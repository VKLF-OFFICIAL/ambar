import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dashboard } from '../components/Dashboard'
import { Settings } from '../components/Settings'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { seed } from './seed'
import { useUiStore } from '../store/useUiStore'
import { useAddictionStore } from '../store/useAddictionStore'
import { parseImport } from '../lib/backup'
import { makeTracker } from '../lib/testFactories'
import { DAY } from '../lib/time'

function backup(patch: { trackers?: unknown[]; settings?: Record<string, unknown> } = {}) {
  const base = useAddictionStore.getState()
  return JSON.stringify({
    app: 'ambar',
    version: 1,
    exportedAt: '2026-01-01T00:00:00.000Z',
    data: {
      trackers: patch.trackers ?? [makeTracker({ id: 'imp', kind: 'tobacco' })],
      journal: [],
      pledges: [],
      settings: { ...base.settings, ...patch.settings },
    },
  })
}

describe('final review fixes', () => {
  it('does not celebrate on top of calm mode or the relapse flow', () => {
    seed([{ startDate: new Date(Date.now() - 8 * DAY).toISOString() }])
    useUiStore.setState({ sosOpen: true })
    const { unmount } = render(<Dashboard />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    unmount()
    useUiStore.setState({ sosOpen: false, relapseFor: 't1' })
    render(<Dashboard />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('locking closes an open relapse flow', () => {
    useUiStore.setState({ relapseFor: 't1', sosOpen: true })
    useUiStore.getState().lock()
    expect(useUiStore.getState().relapseFor).toBeNull()
  })

  it('rejects backups with malformed helplines, unknown kinds or bad PIN hashes', () => {
    seed()
    expect(parseImport(backup({ settings: { customHelplines: [{ label: 'Mamá' }] } }))).toMatchObject({ ok: false, reason: 'shape' })
    expect(parseImport(backup({ trackers: [makeTracker({ kind: 'nope' as never })] }))).toMatchObject({ ok: false, reason: 'shape' })
    expect(parseImport(backup({ settings: { pinHash: 'garbage' } }))).toMatchObject({ ok: false, reason: 'shape' })
  })

  it('clamps imported future start dates', () => {
    seed()
    const future = new Date(Date.now() + 5 * DAY).toISOString()
    const res = parseImport(backup({ trackers: [makeTracker({ startDate: future })] }))
    expect(res.ok && Date.parse(res.data.trackers[0]?.startDate ?? '') <= Date.now()).toBe(true)
  })

  it('asks for confirmation before importing and keeps the current PIN', async () => {
    seed([{}], { pinHash: 'a'.repeat(32) + ':' + 'b'.repeat(64) })
    const user = userEvent.setup()
    render(<Settings />)
    const file = new File([backup({ settings: { pinHash: undefined } })], 'b.json', { type: 'application/json' })
    await user.upload(screen.getByLabelText(/importar copia/i), file)
    expect(await screen.findByText(/1 seguimiento/i)).toBeInTheDocument()
    expect(useAddictionStore.getState().trackers[0]?.id).toBe('t1')
    await user.click(screen.getByRole('button', { name: /sustituir mis datos/i }))
    expect(useAddictionStore.getState().trackers[0]?.id).toBe('imp')
    expect(useAddictionStore.getState().settings.pinHash).toBe('a'.repeat(32) + ':' + 'b'.repeat(64))
  })

  it('shows helplines and a backup option if the app crashes', () => {
    seed()
    const Boom = () => {
      throw new Error('boom')
    }
    const spy = console.error
    console.error = () => {}
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    console.error = spy
    expect(screen.getByRole('link', { name: /024/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /exportar/i })).toBeInTheDocument()
  })
})
