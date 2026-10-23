import { Delete, Lock, Wind } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useT } from '../hooks/useT'
import { useAddictionStore } from '../store/useAddictionStore'
import { useUiStore } from '../store/useUiStore'
import { verifyPin } from '../lib/pin'
import { deriveKey } from '../lib/crypto'
import { isEncrypted, metaPinHash, setSessionKey } from '../lib/cryptoStorage'
import { readPinGuard, recordPinFailure, resetPinGuard } from '../lib/pinGuard'
import { useNow } from '../hooks/useNow'
import { Button } from './ui/Button'
import { Sheet } from './ui/Sheet'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const
const MAX = 6

export function LockScreen() {
  const { t } = useT()
  const settingsPinHash = useAddictionStore((s) => s.settings.pinHash)
  // Con datos cifrados y bloqueados, settings aún no está en memoria: el verificador vive en los metadatos.
  const pinHash = settingsPinHash ?? metaPinHash()
  const wipeAll = useAddictionStore((s) => s.wipeAll)
  const unlock = useUiStore((s) => s.unlock)
  const openSos = useUiStore((s) => s.openSos)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [sure, setSure] = useState(false)
  const [guard, setGuard] = useState(readPinGuard)
  const [unlocking, setUnlocking] = useState(false)
  const unlockAndRehydrate = useAddictionStore((s) => s.unlockAndRehydrate)
  const now = useNow(1000)
  const waitSec = Math.max(0, Math.ceil((guard.until - now) / 1000))

  const press = (d: string) => {
    if (unlocking) return
    setError(false)
    setPin((p) => (p.length < MAX ? p + d : p))
  }

  const submit = async () => {
    if (unlocking || waitSec > 0 || pin.length < 4) return
    if (!pinHash || (await verifyPin(pin, pinHash))) {
      // Datos cifrados: deriva la clave del PIN y descífralos antes de entrar (puede tardar).
      if (pinHash && isEncrypted()) {
        setUnlocking(true)
        try {
          setSessionKey(await deriveKey(pin, pinHash.split(':')[0] ?? ''))
          await unlockAndRehydrate()
        } catch {
          // Dato dañado: no entres ni borres nada, el cifrado sigue intacto.
          setSessionKey(null)
          setUnlocking(false)
          setError(true)
          setPin('')
          return
        }
      }
      resetPinGuard()
      unlock()
      return
    }
    setGuard(recordPinFailure(Date.now()))
    setError(true)
    setPin('')
  }

  // Teclado físico: cifras, borrar y Enter.
  const submitRef = useRef(submit)
  useEffect(() => {
    submitRef.current = submit
  })
  useEffect(() => {
    if (forgotOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) {
        setError(false)
        setPin((p) => (p.length < MAX ? p + e.key : p))
      } else if (e.key === 'Backspace') setPin((p) => p.slice(0, -1))
      else if (e.key === 'Enter') void submitRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [forgotOpen])

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
      <p className="sr-only" aria-live="polite">
        {t('extra.digits', { n: pin.length })}
      </p>
      <p role="alert" className="mt-4 min-h-5 text-center text-sm text-accent">
        {waitSec > 0 ? t('extra.wait', { s: waitSec }) : error ? t('lock.wrong') : ''}
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

      <Button size="lg" className="mt-8 w-full max-w-xs" disabled={pin.length < 4 || waitSec > 0 || unlocking} onClick={() => void submit()}>
        {unlocking ? t('lock.unlocking') : t('lock.unlock')}
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
            resetPinGuard()
            unlock()
          }}
        >
          {t('lock.forgotConfirm')}
        </Button>
      </Sheet>
    </div>
  )
}
