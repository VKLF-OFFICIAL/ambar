import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useT } from '../../hooks/useT'
import { useNow } from '../../hooks/useNow'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { BREATH_CYCLES, BREATH_PHASES, breathAt } from '../../lib/breath'

const SCALE = { inhale: 1, hold: 1, exhale: 0.62 } as const

export function Breathing({ onDone }: { onDone: () => void }) {
  const { t } = useT()
  const reduced = useReducedMotion()
  const now = useNow(250)
  const [start] = useState(() => Date.now())
  const state = breathAt(now - start)
  const phaseSeconds = BREATH_PHASES.find((p) => p.phase === state.phase)?.s ?? 4

  useEffect(() => {
    if (state.done) onDone()
  }, [state.done, onDone])

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative my-6 flex h-64 w-64 items-center justify-center">
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 38%, transparent) 0%, color-mix(in srgb, var(--accent) 10%, transparent) 58%, transparent 72%)' }}
          initial={{ scale: 0.62 }}
          animate={reduced ? { scale: 0.85, opacity: state.phase === 'exhale' ? 0.55 : 1 } : { scale: SCALE[state.phase] }}
          transition={{ duration: reduced ? 0.6 : phaseSeconds, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="absolute inset-8 rounded-full border-[1.5px] border-accent/60"
          initial={{ scale: 0.62 }}
          animate={reduced ? { scale: 0.85 } : { scale: SCALE[state.phase] }}
          transition={{ duration: reduced ? 0.6 : phaseSeconds, ease: 'easeInOut' }}
        />
        <div className="relative">
          <div aria-live="polite" className="font-serif text-3xl">
            {t(`sos.${state.phase}`)}
          </div>
          <div className="tabular mt-1 text-5xl font-light">{state.secondsLeft}</div>
        </div>
      </div>
      <p className="text-xs text-subtle">{t('sos.cycle', { n: state.cycle, total: BREATH_CYCLES })}</p>
      <p className="mt-3 max-w-xs text-sm text-muted">{t('sos.breathHint')}</p>
    </div>
  )
}
