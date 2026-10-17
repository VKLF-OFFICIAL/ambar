import { Check } from 'lucide-react'
import { useT } from '../hooks/useT'
import { useAddictionStore } from '../store/useAddictionStore'
import { toLocalDateKey } from '../lib/time'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

const CLOSE_HOUR = 18
const FACES = ['😣', '😕', '😐', '🙂', '😊'] as const

export function DailyPledge({ now }: { now: number }) {
  const { t } = useT()
  const today = toLocalDateKey(now)
  const pledge = useAddictionStore((s) => s.pledges.find((p) => p.date === today))
  const makePledge = useAddictionStore((s) => s.makePledge)
  const closeDay = useAddictionStore((s) => s.closeDay)
  const evening = new Date(now).getHours() >= CLOSE_HOUR

  if (evening && !pledge?.dayRating) {
    return (
      <Card>
        <div className="text-[15px]">{t('pledge.closeQuestion')}</div>
        <div className="mt-3 flex justify-between">
          {FACES.map((face, i) => (
            <button
              key={face}
              type="button"
              aria-label={t('pledge.rating', { n: i + 1 })}
              onClick={() => closeDay(today, (i + 1) as 1 | 2 | 3 | 4 | 5)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-2xl transition hover:scale-105 hover:bg-accent/20"
            >
              {face}
            </button>
          ))}
        </div>
      </Card>
    )
  }

  if (pledge?.dayRating) {
    return (
      <Card className="flex items-center gap-3 text-sm text-muted">
        <Check size={18} className="text-accent" /> {t('pledge.closed')}
      </Card>
    )
  }

  if (pledge?.pledgedAt) {
    return (
      <Card className="flex items-center gap-3 text-sm text-muted">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-accent">
          <Check size={16} />
        </span>
        {t('pledge.done')}
      </Card>
    )
  }

  return (
    <Card className="flex items-center justify-between gap-3">
      <div>
        <div className="text-[15px]">{t('pledge.question')}</div>
        <div className="mt-0.5 text-xs text-subtle">{t('pledge.hint')}</div>
      </div>
      <Button variant="secondary" className="shrink-0 !px-3.5 !py-2.5 text-sm" onClick={() => makePledge(today)}>
        {t('pledge.make')}
      </Button>
    </Card>
  )
}
