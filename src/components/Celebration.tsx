import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useT } from '../hooks/useT'
import { useReducedMotion } from '../hooks/useReducedMotion'
import type { Milestone } from '../lib/milestones'
import { milestoneMessage, milestoneTitle } from '../lib/labels'
import { Button } from './ui/Button'

const PARTICLES = 28

export function Celebration({ milestone, onClose }: { milestone: Milestone; onClose: () => void }) {
  const { t } = useT()
  const reduced = useReducedMotion()
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLES }, (_, i) => {
        const angle = (i / PARTICLES) * Math.PI * 2
        const dist = 90 + ((i * 37) % 70)
        return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, size: 4 + (i % 4) * 2, delay: (i % 7) * 0.03 }
      }),
    [],
  )

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
        className="relative w-full max-w-sm overflow-visible rounded-[28px] bg-surface px-6 pt-10 pb-6 text-center"
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 12 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {!reduced && (
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-16">
            {particles.map((p, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full"
                style={{ width: p.size, height: p.size, background: i % 3 ? 'var(--accent)' : 'var(--accent-2)' }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                animate={{ x: p.x, y: p.y, opacity: [0, 1, 0], scale: 1 }}
                transition={{ duration: 1.6, delay: 0.15 + p.delay, ease: 'easeOut' }}
              />
            ))}
          </div>
        )}
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-accent/15 ring-1 ring-accent/40">
          <span className="h-8 w-8 rounded-full bg-accent shadow-[0_0_40px_var(--accent)]" />
        </div>
        <div className="text-[11px] uppercase tracking-[0.14em] text-subtle">{t('celebration.label')}</div>
        <h2 id="celebration-title" className="mt-2 font-serif text-3xl">
          {milestoneTitle(t, milestone)}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{milestoneMessage(t, milestone)}</p>
        <Button size="lg" className="mt-7 w-full" onClick={onClose} autoFocus>
          {t('celebration.thanks')}
        </Button>
      </motion.div>
    </motion.div>
  )
}
