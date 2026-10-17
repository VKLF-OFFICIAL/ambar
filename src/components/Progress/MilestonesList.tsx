import { Check } from 'lucide-react'
import { useT } from '../../hooks/useT'
import type { Tracker } from '../../store/types'
import { streakStats } from '../../lib/stats'
import { milestonesUpTo, nextMilestone } from '../../lib/milestones'
import { milestoneTitle } from '../../lib/labels'
import { Card, Label } from '../ui/Card'

export function MilestonesList({ tracker, now }: { tracker: Tracker; now: number }) {
  const { t } = useT()
  const s = streakStats(tracker, now)
  const reached = milestonesUpTo(s.currentMs)
  const n1 = nextMilestone(s.currentMs)
  const n2 = nextMilestone(n1.ms)
  const best = milestonesUpTo(s.longestMs).at(-1)
  return (
    <Card className="space-y-4">
      <div>
        <Label>{t('progress.reachedThisStreak')}</Label>
        {reached.length === 0 ? (
          <p className="mt-2 text-sm text-subtle">{t('progress.noneReached')}</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {reached.map((m) => (
              <li key={m.id} className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-xs text-text">
                <Check size={12} className="text-accent" /> {milestoneTitle(t, m)}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <Label>{t('progress.upcoming')}</Label>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {[n1, n2].map((m) => (
            <li key={m.id} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted">
              {milestoneTitle(t, m)}
            </li>
          ))}
        </ul>
      </div>
      {best && (
        <div className="flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-sm text-muted">{t('progress.bestEver')}</span>
          <span className="font-serif text-lg text-accent">{milestoneTitle(t, best)}</span>
        </div>
      )}
    </Card>
  )
}
