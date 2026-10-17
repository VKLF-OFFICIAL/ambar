import { Delete, Lock, Wind } from 'lucide-react'
import { useState } from 'react'
import { useT } from '../hooks/useT'
import { useAddictionStore } from '../store/useAddictionStore'
import { useUiStore } from '../store/useUiStore'
import { verifyPin } from '../lib/pin'
import { Button } from './ui/Button'
import { Sheet } from './ui/Sheet'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const
const MAX = 6

export function LockScreen() {
  const { t } = useT()
  const pinHash = useAddictionStore((s) => s.settings.pinHash)
  const wipeAll = useAddictionStore((s) => s.wipeAll)
  const unlock = useUiStore((s) => s.unlock)
  const openSos = useUiStore((s) => s.openSos)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [sure, setSure] = useState(false)

  const press = (d: string) => {
    setError(false)
    setPin((p) => (p.length < MAX ? p + d : p))
  }

  const submit = async () => {
    if (!pinHash || (await verifyPin(pin, pinHash))) {
      unlock()
      return
    }
    setError(true)
    setPin('')
  }

  const keyClass = 'h-16 w-16 rounded-full bg-surface text-2xl font-light transition hover:bg-surface-2 active:scale-95'

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
        <Lock size={22} />
      </span>
      <h1 className="mt-5 font-serif text-[28px]">{t('lock.title')}</h1>
      <p className="mt-1 text-sm text-muted">{t('lock.subtitle')}</p>

      <div className="mt-8 flex h-4 gap-3" aria-hidden>
        {Array.from({ length: Math.max(4, pin.length) }, (_, i) => (
          <span key={i} className={`h-3.5 w-3.5 rounded-full transition ${i < pin.length ? 'bg-accent' : 'bg-surface-2'}`} />
        ))}
      </div>
      <p role="alert" className="mt-4 min-h-5 text-center text-sm text-accent">
        {error ? t('lock.wrong') : ''}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-4">
        {KEYS.map((k) => (
          <button key={k} type="button" className={keyClass} onClick={() => press(k)}>
            {k}
          </button>
        ))}
        <span />
        <button type="button" className={keyClass} onClick={() => press('0')}>
          0
        </button>
        <button type="button" aria-label={t('lock.erase')} className={`${keyClass} flex items-center justify-center !bg-transparent text-muted`} onClick={() => setPin((p) => p.slice(0, -1))}>
          <Delete size={22} />
        </button>
      </div>

      <Button size="lg" className="mt-8 w-full max-w-xs" disabled={pin.length < 4} onClick={() => void submit()}>
        {t('lock.unlock')}
      </Button>

      <div className="mt-auto w-full space-y-1 pt-8">
        <Button variant="ghost" className="w-full" onClick={openSos}>
          <Wind size={18} /> {t('ui.sos')}
        </Button>
        <Button variant="quiet" className="w-full text-sm" onClick={() => setForgotOpen(true)}>
          {t('lock.forgot')}
        </Button>
      </div>

      <Sheet open={forgotOpen} onClose={() => { setForgotOpen(false); setSure(false) }} title={t('lock.forgot')} closeLabel={t('ui.close')}>
        <p className="text-sm leading-relaxed text-muted">{t('lock.forgotBody')}</p>
        {sure && <p className="mt-3 text-sm text-accent">{t('lock.forgotSure')}</p>}
        <Button
          variant="secondary"
          className="mt-5 w-full"
          onClick={() => {
            if (!sure) return setSure(true)
            wipeAll()
            unlock()
          }}
        >
          {t('lock.forgotConfirm')}
        </Button>
      </Sheet>
    </div>
  )
}
