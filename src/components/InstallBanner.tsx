import { Smartphone, X } from 'lucide-react'
import { useState } from 'react'
import { useT } from '../hooks/useT'
import { cameToInstall, clearInstallParam, promptInstall, useInstallStore } from '../lib/install'

/**
 * Aviso destacado cuando se llega desde el botón de instalar (p. ej. abierto en Chrome desde Firefox):
 * un toque y aparece el diálogo de instalación del navegador.
 */
export function InstallBanner() {
  const { t } = useT()
  const deferred = useInstallStore((s) => s.deferred)
  const installed = useInstallStore((s) => s.installed)
  const [wanted, setWanted] = useState(cameToInstall)

  if (!wanted || installed || !deferred) return null

  const dismiss = () => {
    clearInstallParam()
    setWanted(false)
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[80] px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div role="region" aria-label={t('install.bannerTitle')} className="mx-auto flex max-w-[456px] items-center gap-3 rounded-[22px] bg-surface p-3.5 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.6)] ring-1 ring-accent/40">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-on-accent">
          <Smartphone size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-medium">{t('install.bannerTitle')}</div>
          <div className="text-xs text-muted">{t('install.bannerBody')}</div>
        </div>
        <button
          type="button"
          onClick={() => {
            dismiss()
            void promptInstall()
          }}
          className="shrink-0 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent"
        >
          {t('install.bannerButton')}
        </button>
        <button type="button" aria-label={t('install.bannerLater')} onClick={dismiss} className="shrink-0 rounded-full p-1.5 text-subtle hover:text-text">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
