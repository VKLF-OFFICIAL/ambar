import { useEffect, useState } from 'react'
import { useAddictionStore } from './store/useAddictionStore'
import { useUiStore } from './store/useUiStore'
import { AppShell } from './components/AppShell'
import { Onboarding } from './components/Onboarding/Onboarding'
import { Dashboard } from './components/Dashboard'
import { SosIntervention } from './components/SosIntervention'
import { Journal } from './components/Journal'
import { RelapseFlow } from './components/RelapseFlow'
import { Reasons } from './components/Reasons'
import { Progress } from './components/Progress/Progress'
import { Settings } from './components/Settings'
import { LockScreen } from './components/LockScreen'
import { isEncrypted } from './lib/cryptoStorage'

const LOCK_AFTER_MS = 5 * 60_000

function Screen() {
  const tab = useUiStore((s) => s.tab)
  switch (tab) {
    case 'home':
      return <Dashboard />
    case 'journal':
      return <Journal />
    case 'reasons':
      return <Reasons />
    case 'progress':
      return <Progress />
    case 'settings':
      return <Settings />
    default:
      return <div data-testid={`screen-${tab}`} />
  }
}

export default function App() {
  const theme = useAddictionStore((s) => s.settings.theme)
  const locale = useAddictionStore((s) => s.settings.locale)
  const onboarded = useAddictionStore((s) => s.settings.onboarded && s.trackers.length > 0)
  const addingTracker = useUiStore((s) => s.addingTracker)
  const sosOpen = useUiStore((s) => s.sosOpen)
  const relapseFor = useUiStore((s) => s.relapseFor)
  const locked = useUiStore((s) => s.locked)
  // Con datos cifrados, settings.pinHash no está en memoria hasta desbloquear: isEncrypted() lo detecta.
  const hasPin = useAddictionStore((s) => !!s.settings.pinHash) || isEncrypted()
  // Bloqueo al arrancar si hay PIN (antes del primer render), y al volver tras 5 min o más en segundo plano.
  useState(() => {
    if (isEncrypted() || useAddictionStore.getState().settings.pinHash) useUiStore.getState().lock()
    return true
  })

  useEffect(() => {
    let hiddenAt: number | null = null
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') hiddenAt = Date.now()
      else if (hiddenAt !== null) {
        if (Date.now() - hiddenAt >= LOCK_AFTER_MS && (isEncrypted() || useAddictionStore.getState().settings.pinHash)) useUiStore.getState().lock()
        hiddenAt = null
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])
  const setAddingTracker = useUiStore((s) => s.setAddingTracker)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.lang = locale
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1a1715' : '#f7f2ea')
  }, [theme, locale])

  if (locked && hasPin) {
    return (
      <>
        <LockScreen />
        {sosOpen && <SosIntervention locked />}
      </>
    )
  }
  if (!onboarded) return <Onboarding />
  if (addingTracker) return <Onboarding mode="addTracker" onDone={() => setAddingTracker(false)} />

  return (
    <>
      <AppShell>
        <Screen />
      </AppShell>
      {sosOpen && <SosIntervention />}
      {relapseFor && <RelapseFlow trackerId={relapseFor} />}
    </>
  )
}
