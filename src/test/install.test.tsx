import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Settings } from '../components/Settings'
import { seed } from './seed'
import { detectPlatform, useInstallStore } from '../lib/install'

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
const IPAD_DESKTOP = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'
const ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36'

afterEach(() => {
  vi.restoreAllMocks()
  useInstallStore.setState({ deferred: null, installed: false })
})

describe('detectPlatform', () => {
  it('recognises iPhone, iPad in desktop mode, Android and desktop', () => {
    expect(detectPlatform(IPHONE, 5)).toBe('ios')
    expect(detectPlatform(IPAD_DESKTOP, 5)).toBe('ios')
    expect(detectPlatform(IPAD_DESKTOP, 0)).toBe('desktop')
    expect(detectPlatform(ANDROID, 5)).toBe('android')
  })
})

describe('install button in Settings', () => {
  it('uses the native install prompt when the browser offers it', async () => {
    seed()
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(ANDROID)
    const prompt = vi.fn().mockResolvedValue(undefined)
    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt,
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    })
    act(() => {
      window.dispatchEvent(event)
    })
    const user = userEvent.setup()
    render(<Settings />)
    await user.click(screen.getByRole('button', { name: /añadir a la pantalla de inicio/i }))
    expect(prompt).toHaveBeenCalledOnce()
    expect(await screen.findByText(/ya está en tu pantalla de inicio/i)).toBeInTheDocument()
  })

  it('shows step-by-step instructions on iOS', async () => {
    seed()
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(IPHONE)
    const user = userEvent.setup()
    render(<Settings />)
    await user.click(screen.getByRole('button', { name: /añadir a la pantalla de inicio/i }))
    expect(screen.getByRole('dialog')).toHaveTextContent(/compartir/i)
    expect(screen.getByRole('dialog')).toHaveTextContent(/añadir a pantalla de inicio/i)
  })

  it('falls back to Android browser-menu instructions without a native prompt', async () => {
    seed()
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(ANDROID)
    const user = userEvent.setup()
    render(<Settings />)
    await user.click(screen.getByRole('button', { name: /añadir a la pantalla de inicio/i }))
    expect(screen.getByRole('dialog')).toHaveTextContent(/menú/i)
  })

  it('says so when the app is already installed', () => {
    seed()
    useInstallStore.setState({ installed: true })
    render(<Settings />)
    expect(screen.getByText(/ya está en tu pantalla de inicio/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /añadir a la pantalla de inicio/i })).not.toBeInTheDocument()
  })
})
