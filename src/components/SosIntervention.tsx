import { AnimatePresence, motion } from 'framer-motion'
import { Phone, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useT } from '../hooks/useT'
import { useNow } from '../hooks/useNow'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { selectActiveTracker, useAddictionStore } from '../store/useAddictionStore'
import { useUiStore } from '../store/useUiStore'
import { twoDigits } from '../lib/time'
import { Button } from './ui/Button'
import { Breathing } from './sos/Breathing'
import { Grounding } from './sos/Grounding'
import { ReasonsStep } from './sos/ReasonsStep'
import { Distraction } from './sos/Distraction'
import { HelpSheet } from './sos/HelpSheet'
import { SosOutro } from './sos/SosOutro'

type Step = 'breathing' | 'grounding' | 'reasons' | 'distraction' | 'outro'
const ORDER: Step[] = ['breathing', 'grounding', 'reasons', 'distraction', 'outro']
const MIN_FOR_OUTRO_SEC = 60

/** Intervención en crisis a pantalla completa: recorrido guiado sin decisiones. */
export function SosIntervention({ locked = false }: { locked?: boolean }) {
  const { t } = useT()
  const reduced = useReducedMotion()
  const closeSos = useUiStore((s) => s.closeSos)
  const openRelapse = useUiStore((s) => s.openRelapse)
  const tracker = useAddictionStore(selectActiveTracker)
  const addJournalEntry = useAddictionStore((s) => s.addJournalEntry)
  const now = useNow(1000)
  const [start] = useState(() => Date.now())
  const [step, setStep] = useState<Step>('breathing')
  const [helpOpen, setHelpOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const elapsedSec = Math.max(0, Math.floor((now - start) / 1000))

  const next = useCallback(() => setStep((s) => ORDER[Math.min(ORDER.indexOf(s) + 1, ORDER.length - 1)] ?? 'outro'), [])

  useEffect(() => {
    dialogRef.current?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Escape no cierra: evitar salir por accidente en un mal momento.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.preventDefault()
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>('button, a[href], input, [tabindex]:not([tabindex="-1"])')
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const onClose = () => {
    if (step !== 'outro' && elapsedSec >= MIN_FOR_OUTRO_SEC) setStep('outro')
    else closeSos()
  }

  const save = (intensity: number) => {
    if (!tracker) return
    addJournalEntry({
      trackerId: tracker.id,
      source: 'sos',
      intensity,
      emotions: [],
      environments: [],
      overcame: true,
      sosDurationSec: elapsedSec,
    })
  }

  const stepIndex = ORDER.indexOf(step)

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t('sos.title')}
      tabIndex={-1}
      className="fixed inset-0 z-50 overflow-y-auto bg-bg outline-none"
    >
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between text-sm text-muted">
          <span className="tabular">
            {t('sos.title')} · {twoDigits(Math.floor(elapsedSec / 60))}:{twoDigits(elapsedSec % 60)}
          </span>
          <button type="button" onClick={onClose} aria-label={t('ui.close')} className="-mr-2 rounded-full p-2 hover:text-text">
            <X size={22} />
          </button>
        </div>

        {step === 'breathing' && (
          <div className="mt-6 font-serif text-[26px] leading-tight">
            {t('sos.safe')}
            <br />
            <span className="italic text-muted">{t('sos.wave')}</span>
          </div>
        )}

        <div className="flex-1 pt-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {step === 'breathing' && <Breathing onDone={next} />}
              {step === 'grounding' && <Grounding />}
              {step === 'reasons' && <ReasonsStep locked={locked} />}
              {step === 'distraction' && <Distraction />}
              {step === 'outro' && (
                <SosOutro
                  elapsedSec={elapsedSec}
                  locked={locked}
                  onSave={save}
                  onFinish={closeSos}
                  onRelapse={() => tracker && openRelapse(tracker.id)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {step !== 'outro' && (
          <div className="mt-6 space-y-3">
            <div className="flex justify-center gap-1.5" aria-hidden>
              {ORDER.slice(0, -1).map((s, i) => (
                <span key={s} className={`h-1.5 rounded-full transition-all ${i === stepIndex ? 'w-5 bg-accent' : 'w-1.5 bg-surface-2'}`} />
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setHelpOpen(true)}>
                <Phone size={16} /> {t('sos.talk')}
              </Button>
              <Button variant="secondary" className="w-32" onClick={next}>
                {t('ui.next')}
              </Button>
            </div>
          </div>
        )}
      </div>
      <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}
