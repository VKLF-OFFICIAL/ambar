import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Progress } from './Progress'
import { seed } from '../../test/seed'
import { useAddictionStore } from '../../store/useAddictionStore'
import { makeEntry } from '../../lib/testFactories'

describe('Progress', () => {
  it('asks to keep logging with few entries', () => {
    seed()
    useAddictionStore.setState({ journal: [1, 2, 3].map(() => makeEntry()) })
    render(<Progress />)
    expect(screen.getByText(/sigue registrando/i)).toBeInTheDocument()
  })

  it('shows the top emotion with enough entries', () => {
    seed()
    useAddictionStore.setState({ journal: [1, 2, 3, 4, 5, 6].map(() => makeEntry({ intensity: 8, emotions: ['stress'] })) })
    render(<Progress />)
    expect(screen.getByTestId('top-emotions')).toHaveTextContent('Estrés')
  })

  it('shows the health timeline only for substances that have one', () => {
    seed([{ kind: 'alcohol' }])
    const { unmount } = render(<Progress />)
    expect(screen.getByRole('heading', { name: /cómo se recupera tu cuerpo/i })).toBeInTheDocument()
    unmount()
    seed([{ kind: 'gambling' }])
    render(<Progress />)
    expect(screen.queryByRole('heading', { name: /cómo se recupera tu cuerpo/i })).not.toBeInTheDocument()
  })
})
