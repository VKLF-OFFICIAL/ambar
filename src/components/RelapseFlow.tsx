import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useT } from '../hooks/useT'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useAddictionStore } from '../store/useAddictionStore'
import { useUiStore } from '../store/useUiStore'
import { streakStats } from '../lib/stats'
import { milestonesUpTo } from '../lib/milestones'
import { milestoneTitle } from '../lib/labels'
import { DAY } from '../lib/time'
import { EMOTION_CHIPS, ENVIRONMENT_CHIPS, RELAPSE_PLAN_CHIPS } from '../data/chips'
import type { MessageKey } from '../i18n'
import { Button } from './ui/Button'
import { Card, Label } from './ui/Card'
import { Chip } from './ui/Chip'
import { inputClass } from './ui/Field'

type Step = 'keep' | 'what' | 'plan' | 'done'
const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

/** Recaída como reflexión: compasión primero, luego entender, luego planificar. */
export function RelapseFlow({ trackerId }: { trackerId: string }) {
  const { t } = useT()
  const reduced = useReducedMotion()
  const tracker = useAddictionStore((s) => s.trackers.find((x) => x.id === trackerId))
  const resetStreak = useAddictionStore((s) => s.resetStreak)
  const closeRelapse = useUiStore((s) => s.closeRelapse)
  const [now] = useState(() => Date.now())
  const [step, setStep] = useState<Step>('keep')
  const [emotions, setEmotions] = useState<string[]>([])
  const [environments, setEnvironments] = useState<string[]>([])
  const [whatNote, setWhatNote] = useState('')
  const [plan, setPlan] = useState<string[]>([])
  const [planNote, setPlanNote] = useState('')
  const [message, setMessage] = useState<MessageKey | null>(null)

  if (!tracker) return null
  const stats = streakStats(tracker, now)
  const best = milestonesUpTo(stats.longestMs).at(-1)

  const finish = () => {
    const note = [whatNote.trim(), planNote.trim()].filter(Boolean).join('\n\n') || undefined
    setMessage(
      resetStreak(tracker.id, {
        trigger: [...emotions, ...environments],
        note,
        plan: plan.length ? plan : undefined,
      }),
    )
    setStep('done')
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={t('relapse.title')} className="fixed inset-0 z-[55] overflow-y-auto bg-bg">
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            className="flex flex-1 flex-col"
            initial={{ opacity: 0, y: reduced ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {step === 'keep' && (
              <>
                <h1 className="font-serif text-[30px] leading-tight">{t('relapse.title')}</h1>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('relapseMessages.m1')}</p>
                <Label className="mt-8">{t('relapse.keepTitle')}</Label>
                <div className="mt-3 space-y-2">
                  <Card className="flex items-baseline gap-3">
                    <span className="tabular font-serif text-3xl text-accent">{Math.floor(stats.totalFreeMs / DAY)}</span>
                    <span className="text-sm text-muted">{t('relapse.totalFree')}</span>
                  </Card>
                  <Card className="flex items-baseline gap-3">
                    <span data-testid="longest" className="tabular font-serif text-3xl text-accent">
                      {Math.floor(stats.longestMs / DAY)}
                    </span>
                    <span className="text-sm text-muted">{t('relapse.longest')}</span>
                  </Card>
                  <Card className="flex items-baseline gap-3">
                    <span className="font-serif text-2xl text-accent">{best ? milestoneTitle(t, best) : t('relapse.noneYet')}</span>
                    <span className="text-sm text-muted">{t('relapse.bestMilestone')}</span>
                  </Card>
                </div>
                <div className="mt-auto space-y-2 pt-10">
                  <Button size="lg" className="w-full" onClick={() => setStep('what')}>
                    {t('ui.next')}
                  </Button>
                  <Button variant="quiet" className="w-full" onClick={closeRelapse}>
                    {t('ui.cancel')}
                  </Button>
                </div>
              </>
            )}

            {step === 'what' && (
              <>
                <h1 className="font-serif text-[28px] leading-tight">{t('relapse.whatTitle')}</h1>
                <p className="mt-2 text-[15px] text-muted">{t('relapse.whatBody')}</p>
                <Label className="mt-6">{t('relapse.emotions')}</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {EMOTION_CHIPS.map((c) => (
                    <Chip key={c} selected={emotions.includes(c)} onClick={() => setEmotions((l) => toggle(l, c))}>
                      {t(`chips.emotions.${c}`)}
                    </Chip>
                  ))}
                </div>
                <Label className="mt-6">{t('relapse.environments')}</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ENVIRONMENT_CHIPS.map((c) => (
                    <Chip key={c} selected={environments.includes(c)} onClick={() => setEnvironments((l) => toggle(l, c))}>
                      {t(`chips.environments.${c}`)}
                    </Chip>
                  ))}
                </div>
                <textarea
                  aria-label={t('relapse.notePlaceholder')}
                  placeholder={t('relapse.notePlaceholder')}
                  value={whatNote}
                  onChange={(e) => setWhatNote(e.target.value)}
                  rows={2}
                  maxLength={500}
                  className={`${inputClass} mt-6`}
                />
                <div className="mt-auto space-y-2 pt-8">
                  <Button size="lg" className="w-full" onClick={() => setStep('plan')} disabled={!emotions.length && !environments.length && !whatNote.trim()}>
                    {t('ui.next')}
                  </Button>
                  <Button variant="quiet" className="w-full" onClick={() => setStep('plan')}>
                    {t('ui.skip')}
                  </Button>
                </div>
              </>
            )}

            {step === 'plan' && (
              <>
                <h1 className="font-serif text-[28px] leading-tight">{t('relapse.planTitle')}</h1>
                <p className="mt-2 text-[15px] text-muted">{t('relapse.planBody')}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {RELAPSE_PLAN_CHIPS.map((c) => (
                    <Chip key={c} selected={plan.includes(c)} onClick={() => setPlan((l) => toggle(l, c))}>
                      {t(`chips.plan.${c}`)}
                    </Chip>
                  ))}
                </div>
                <textarea
                  aria-label={t('relapse.notePlaceholder')}
                  placeholder={t('relapse.notePlaceholder')}
                  value={planNote}
                  onChange={(e) => setPlanNote(e.target.value)}
                  rows={2}
                  maxLength={500}
                  className={`${inputClass} mt-6`}
                />
                <div className="mt-auto space-y-2 pt-8">
                  <Button size="lg" className="w-full" onClick={finish} disabled={!plan.length && !planNote.trim()}>
                    {t('relapse.save')}
                  </Button>
                  <Button variant="quiet" className="w-full" onClick={finish}>
                    {t('ui.skip')}
                  </Button>
                </div>
              </>
            )}

            {step === 'done' && (
              <div className="flex flex-1 flex-col justify-center text-center">
                <div className="mx-auto mb-8 h-20 w-20 rounded-full bg-accent/15 ring-1 ring-accent/40" />
                <p className="font-serif text-[26px] leading-snug">{message ? t(message) : ''}</p>
                <p className="mt-4 text-[15px] text-muted">{t('relapse.newCounter')}</p>
                <Button size="lg" className="mt-12 w-full" onClick={closeRelapse}>
                  {t('relapse.restart')}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
