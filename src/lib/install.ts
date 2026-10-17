import { create } from 'zustand'

export type Platform = 'ios' | 'android' | 'desktop'

/** Evento no estándar de Chromium que permite mostrar el diálogo de instalación nativo. */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallState {
  deferred: BeforeInstallPromptEvent | null
  installed: boolean
}

export const useInstallStore = create<InstallState>()(() => ({ deferred: null, installed: false }))

export function detectPlatform(ua: string, maxTouchPoints: number): Platform {
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  // iPadOS se presenta como Mac de escritorio; se distingue por la pantalla táctil.
  if (/Macintosh/i.test(ua) && maxTouchPoints > 1) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'desktop'
}

export function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  const displayStandalone = typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches
  return iosStandalone || displayStandalone
}

/** Lanza el diálogo nativo. Devuelve true si la persona aceptó. */
export async function promptInstall(): Promise<boolean> {
  const deferred = useInstallStore.getState().deferred
  if (!deferred) return false
  await deferred.prompt()
  const { outcome } = await deferred.userChoice
  // El evento solo se puede usar una vez.
  useInstallStore.setState({ deferred: null, installed: outcome === 'accepted' })
  return outcome === 'accepted'
}

let listening = false

/** Se registra al cargar el módulo para no perder `beforeinstallprompt`, que llega muy pronto. */
function listen(): void {
  if (listening || typeof window === 'undefined') return
  listening = true
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    useInstallStore.setState({ deferred: e as BeforeInstallPromptEvent })
  })
  window.addEventListener('appinstalled', () => useInstallStore.setState({ deferred: null, installed: true }))
  if (isStandalone()) useInstallStore.setState({ installed: true })
}

listen()

/** En el ordenador, Opera y Firefox no permiten instalar apps web. */
export function browserSupportsInstall(ua: string, platform: Platform): boolean {
  if (platform !== 'desktop') return true
  return !/OPR\/|Opera|Firefox\//.test(ua)
}
