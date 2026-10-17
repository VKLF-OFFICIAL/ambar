import { Moon, Settings as SettingsIcon, Sun } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useT } from '../hooks/useT'
import { useAddictionStore } from '../store/useAddictionStore'
import { useUiStore } from '../store/useUiStore'
import { BottomNav } from './BottomNav'
import { SosFab } from './SosFab'

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useT()
  const theme = useAddictionStore((s) => s.settings.theme)
  const updateSettings = useAddictionStore((s) => s.updateSettings)
  const tab = useUiStore((s) => s.tab)
  const setTab = useUiStore((s) => s.setTab)
  const storageAvailable = useAddictionStore((s) => s.storageAvailable)
  const [storageNoticeSeen, setStorageNoticeSeen] = useState(false)

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-[480px] items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <button type="button" onClick={() => setTab('home')} className="flex items-center gap-2" aria-label={t('common.appName')}>
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
          <span className="font-serif text-lg tracking-tight">{t('common.appName')}</span>
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={theme === 'dark' ? t('ui.themeToLight') : t('ui.themeToDark')}
            onClick={() => updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' })}
            className="rounded-full p-2.5 text-muted transition hover:text-text"
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button
            type="button"
            aria-label={t('ui.nav.settings')}
            aria-current={tab === 'settings' ? 'page' : undefined}
            onClick={() => setTab('settings')}
            className={`rounded-full p-2.5 transition ${tab === 'settings' ? 'text-accent' : 'text-muted hover:text-text'}`}
          >
            <SettingsIcon size={19} />
          </button>
        </div>
      </header>
      {!storageAvailable && !storageNoticeSeen && tab !== 'settings' && (
        <div role="alert" className="mx-auto mt-2 flex max-w-[440px] items-start gap-3 rounded-[18px] bg-accent/15 px-4 py-3 text-sm max-[480px]:mx-5">
          <AlertTriangle size={17} className="mt-0.5 shrink-0 text-accent" />
          <span className="flex-1">{t('settings.storageWarning')}</span>
          <button type="button" onClick={() => setStorageNoticeSeen(true)} className="shrink-0 text-xs font-medium text-accent">
            {t('extra.gotIt')}
          </button>
        </div>
      )}
      <main className="pb-nav mx-auto max-w-[480px] px-5">{children}</main>
      {tab !== 'home' && <SosFab />}
      <BottomNav />
    </div>
  )
}
