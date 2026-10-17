import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useMemo, useRef, useState, type ComponentType } from 'react'
import { useT } from '../../hooks/useT'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useAddictionStore } from '../../store/useAddictionStore'
import type { TrackerKind } from '../../store/types'
import { kindInfo } from '../../data/trackerKinds'
import { currencyFor, detectCountry } from '../../data/helplines'
import {
  StepCost,
  StepKind,
  StepMedical,
  StepName,
  StepPin,
  StepReasons,
  StepRedLine,
  StepStart,
  StepWelcome,
  type StepProps,
} from './steps'

export interface Draft {
  locale: 'es' | 'en'
  country: string
  currency: string
  kind?: TrackerKind
  customName?: string
  redLine?: string
  medicalNoticeAck?: boolean
  startDate?: string
  costPerDay?: number
  minutesPerDay?: number
  reasons: string[]
  name?: string
  pin?: string
}

type StepId = 'welcome' | 'kind' | 'redLine' | 'medical' | 'start' | 'cost' | 'reasons' | 'name' | 'pin'

const STEPS: Record<StepId, ComponentType<StepProps>> = {
  welcome: StepWelcome,
  kind: StepKind,
  redLine: StepRedLine,
  medical: StepMedical,
  start: StepStart,
  cost: StepCost,
  reasons: StepReasons,
  name: StepName,
  pin: StepPin,
}

export function Onboarding({ mode = 'first', onDone }: { mode?: 'first' | 'addTracker'; onDone?: () => void }) {
  const { t } = useT()
  const reduced = useReducedMotion()
  const settings = useAddictionStore((s) => s.settings)
  const [draft, setDraft] = useState<Draft>(() => {
    const country = mode === 'first' ? detectCountry(navigator.language || 'es-ES') : settings.country
    return { locale: settings.locale, country, currency: mode === 'first' ? currencyFor(country) : settings.currency, reasons: [] }
  })
  const [index, setIndex] = useState(0)

  const steps = useMemo<StepId[]>(() => {
    const info = draft.kind ? kindInfo(draft.kind) : undefined
    return [
      ...(mode === 'first' ? (['welcome'] as const) : []),
      'kind',
      ...(info?.needsRedLine ? (['redLine'] as const) : []),
      ...(info?.medicalNotice ? (['medical'] as const) : []),
      'start',
      'cost',
      'reasons',
      ...(mode === 'first' ? (['name', 'pin'] as const) : []),
    ]
  }, [draft.kind, mode])

  // Ref con el borrador más reciente: update() y next() pueden llamarse en el mismo evento.
  const draftRef = useRef(draft)
  const update = (patch: Partial<Draft>) => {
    const d = draftRef.current
    const nextDraft = { ...d, ...patch }
    if (patch.country && patch.country !== d.country) nextDraft.currency = currencyFor(patch.country)
    if (patch.locale) useAddictionStore.getState().updateSettings({ locale: patch.locale })
    draftRef.current = nextDraft
    setDraft(nextDraft)
  }

  const finish = (d: Draft) => {
    const s = useAddictionStore.getState()
    if (!d.kind) return
    const id = s.addTracker({
      kind: d.kind,
      customName: d.kind === 'custom' ? d.customName?.trim() : undefined,
      startDate: d.startDate,
      costPerDay: d.costPerDay,
      minutesPerDay: d.minutesPerDay,
      redLine: d.redLine?.trim() || undefined,
      medicalNoticeAck: d.medicalNoticeAck,
    })
    d.reasons.map((r) => r.trim()).filter(Boolean).forEach((r) => s.addReason(id, r))
    if (mode === 'first') {
      s.updateSettings({ locale: d.locale, country: d.country, currency: d.currency, name: d.name?.trim() || undefined, onboarded: true })
      if (d.pin) void s.setPin(d.pin)
    }
    onDone?.()
  }

  const next = () => {
    if (index >= steps.length - 1) finish(draftRef.current)
    else setIndex(index + 1)
  }

  const stepId = steps[Math.min(index, steps.length - 1)] ?? 'kind'
  const Step = STEPS[stepId]

  return (
    <div className="mx-auto min-h-dvh max-w-[480px] px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-8">
      <div className="mb-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => (index === 0 ? onDone?.() : setIndex((i) => i - 1))}
          aria-label={t('ui.back')}
          className={`-ml-2 rounded-full p-2 text-muted hover:text-text ${index === 0 && mode === 'first' ? 'invisible' : ''}`}
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex flex-1 gap-1.5" aria-label={t('onboarding.step', { n: index + 1, total: steps.length })} role="img">
          {steps.map((s, i) => (
            <span key={s} className={`h-1 flex-1 rounded-full transition ${i <= index ? 'bg-accent' : 'bg-surface-2'}`} />
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stepId}
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: -24 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <Step draft={draft} update={update} next={next} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
