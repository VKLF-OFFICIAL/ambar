import { Check, Share, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { useT } from '../hooks/useT'
import { detectPlatform, promptInstall, useInstallStore, type Platform } from '../lib/install'
import type { MessageKey } from '../i18n'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Sheet } from './ui/Sheet'

const GUIDES: Record<Platform, { title: MessageKey; steps: MessageKey[] }> = {
  ios: { title: 'install.iosTitle', steps: ['install.iosStep1', 'install.iosStep2', 'install.iosStep3', 'install.iosStep4'] },
  android: {
    title: 'install.androidTitle',
    steps: ['install.androidStep1', 'install.androidStep2', 'install.androidStep3', 'install.androidStep4'],
  },
  desktop: { title: 'install.desktopTitle', steps: ['install.desktopStep1', 'install.desktopStep2', 'install.desktopStep3'] },
}

/** Botón para añadir Ambar a la pantalla de inicio: diálogo nativo si existe, guía paso a paso si no (iOS). */
export function InstallCard() {
  const { t } = useT()
  const deferred = useInstallStore((s) => s.deferred)
  const installed = useInstallStore((s) => s.installed)
  const [guideOpen, setGuideOpen] = useState(false)
  const [platform] = useState(() => detectPlatform(navigator.userAgent, navigator.maxTouchPoints ?? 0))
  const guide = GUIDES[platform]

  const onClick = async () => {
    if (deferred) {
      const accepted = await promptInstall()
      if (!accepted && !useInstallStore.getState().deferred) setGuideOpen(true)
      return
    }
    setGuideOpen(true)
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Smartphone size={19} />
        </span>
        <div>
          <div className="text-[15px] font-medium">{t('install.title')}</div>
          <p className="mt-0.5 text-sm text-muted">{t('install.hint')}</p>
        </div>
      </div>
      {installed ? (
        <p className="flex items-center gap-2 text-sm text-accent">
          <Check size={16} /> {t('install.installed')}
        </p>
      ) : (
        <Button className="w-full" onClick={() => void onClick()}>
          {platform === 'ios' ? <Share size={17} /> : <Smartphone size={17} />} {t('install.button')}
        </Button>
      )}
      <Sheet open={guideOpen} onClose={() => setGuideOpen(false)} title={t(guide.title)} closeLabel={t('ui.close')}>
        <ol className="space-y-3">
          {guide.steps.map((key, i) => (
            <li key={key} className="flex gap-3">
              <span className="tabular flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-on-accent">
                {i + 1}
              </span>
              <span className="pt-0.5 text-[15px] leading-relaxed">{t(key)}</span>
            </li>
          ))}
        </ol>
        <Button variant="secondary" className="mt-6 w-full" onClick={() => setGuideOpen(false)}>
          {t('extra.gotIt')}
        </Button>
      </Sheet>
    </Card>
  )
}
