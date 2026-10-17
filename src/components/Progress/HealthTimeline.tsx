import { Check, Stethoscope } from 'lucide-react'
import { useState } from 'react'
import { useT } from '../../hooks/useT'
import type { Tracker } from '../../store/types'
import { HEALTH_TIMELINE } from '../../data/healthTimeline'
import { kindInfo } from '../../data/trackerKinds'
import { getElapsed } from '../../lib/time'
import { Card } from '../ui/Card'
import { Sheet } from '../ui/Sheet'

export function HealthTimeline({ tracker, now }: { tracker: Tracker; now: number }) {
  const { t } = useT()
  const [noticeOpen, setNoticeOpen] = useState(false)
  const info = kindInfo(tracker.kind)
  if (!info.healthTimeline) return null
  const points = HEALTH_TIMELINE[info.healthTimeline]
  const elapsed = getElapsed(tracker.startDate, now).totalMs
  const sources = [...new Set(points.map((p) => p.source))]

  return (
    <section>
      <h2 className="mb-3 font-serif text-xl">{t('progress.health')}</h2>
      <Card>
        <ol className="relative space-y-4 border-l border-border pl-5">
          {points.map((p) => {
            const done = elapsed >= p.afterMs
            return (
              <li key={p.textKey} className="relative">
                <span
                  aria-hidden
                  className={`absolute -left-[29px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full ${done ? 'bg-accent text-on-accent' : 'bg-surface-2 ring-1 ring-border'}`}
                >
                  {done && <Check size={10} strokeWidth={3} />}
                </span>
                <p className={`text-sm leading-relaxed ${done ? 'text-text' : 'text-subtle'}`}>{t(p.textKey)}</p>
              </li>
            )
          })}
        </ol>
        <p className="mt-5 text-[11px] leading-relaxed text-subtle">{t('progress.healthDisclaimer')}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-subtle">
          {t('progress.sources')}: {sources.join(' · ')}
        </p>
      </Card>
      {info.medicalNotice && (
        <>
          <button type="button" onClick={() => setNoticeOpen(true)} className="mt-3 inline-flex items-center gap-2 text-sm text-muted underline-offset-4 hover:text-text hover:underline">
            <Stethoscope size={15} /> {t('progress.medicalNotice')}
          </button>
          <Sheet open={noticeOpen} onClose={() => setNoticeOpen(false)} title={t('onboarding.medicalTitle')} closeLabel={t('ui.close')}>
            <p className="text-[15px] leading-relaxed text-muted">{t('onboarding.medicalBody')}</p>
          </Sheet>
        </>
      )}
    </section>
  )
}
