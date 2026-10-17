import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Settings } from '../components/Settings'
import { InstallBanner } from '../components/InstallBanner'
import { seed } from './seed'
import { androidNativeInstall, chromeIntentUrl, nav, useInstallStore, type BeforeInstallPromptEvent } from '../lib/install'

const FIREFOX_ANDROID = 'Mozilla/5.0 (Android 15; Mobile; rv:140.0) Gecko/140.0 Firefox/140.0'
const OPERA_ANDROID = 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36 OPR/90.0'
const CHROME_ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36'
const SAMSUNG = 'Mozilla/5.0 (Linux; Android 15; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/125.0 Mobile Safari/537.36'
const EDGE_ANDROID = 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36 EdgA/140.0'

afterEach(() => {
  vi.restoreAllMocks()
  useInstallStore.setState({ deferred: null, installed: false })
  window.history.replaceState(null, '', '/')
})

function fakePrompt() {
  const prompt = vi.fn().mockResolvedValue(undefined)
  const e = Object.assign(new Event('beforeinstallprompt'), { prompt, userChoice: Promise.resolve({ outcome: 'accepted' as const }) })
  return { prompt, e: e as unknown as BeforeInstallPromptEvent }
}

describe('Android browsers', () => {
  it('knows which ones can install natively', () => {
    expect(androidNativeInstall(CHROME_ANDROID)).toBe(true)
    expect(androidNativeInstall(SAMSUNG)).toBe(true)
    expect(androidNativeInstall(EDGE_ANDROID)).toBe(true)
    expect(androidNativeInstall(FIREFOX_ANDROID)).toBe(false)
    expect(androidNativeInstall(OPERA_ANDROID)).toBe(false)
  })

  it('builds a Chrome intent that keeps the page and asks to install', () => {
    expect(chromeIntentUrl('https://vklf-official.github.io/ambar/')).toBe(
      'intent://vklf-official.github.io/ambar/?install=1#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' +
        encodeURIComponent('https://vklf-official.github.io/ambar/?install=1') +
        ';end',
    )
  })
})

describe('install button on Android without native install', () => {
  it('opens Ambar in Chrome', async () => {
    seed()
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(FIREFOX_ANDROID)
    const open = vi.spyOn(nav, 'open').mockImplementation(() => {})
    const user = userEvent.setup()
    render(<Settings />)
    await user.click(screen.getByRole('button', { name: /añadir a la pantalla de inicio/i }))
    expect(open).toHaveBeenCalledWith(expect.stringMatching(/^intent:\/\/.*package=com\.android\.chrome/))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('install banner after arriving in Chrome', () => {
  it('offers a one-tap install when the page was opened to install', async () => {
    window.history.replaceState(null, '', '/?install=1')
    const { prompt, e } = fakePrompt()
    useInstallStore.setState({ deferred: e })
    const user = userEvent.setup()
    render(<InstallBanner />)
    await user.click(screen.getByRole('button', { name: /instalar ambar/i }))
    expect(prompt).toHaveBeenCalledOnce()
    expect(window.location.search).toBe('')
  })

  it('stays hidden on a normal visit', () => {
    const { e } = fakePrompt()
    act(() => useInstallStore.setState({ deferred: e }))
    render(<InstallBanner />)
    expect(screen.queryByRole('button', { name: /instalar ambar/i })).not.toBeInTheDocument()
  })
})
