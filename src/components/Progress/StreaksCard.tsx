import { useT } from '../../hooks/useT'
import type { Tracker } from '../../store/types'
import { streakStats } from '../../lib/stats'
import { shortDuration } from '../../lib/format'
import { Card } from '../ui/Card'

export function StreaksCard({ tracker, now }: { tracker: Tracker; now: number }) {
  const { t } = useT()
  const s = streakStats(tracker, now)
  const items = [
    { label: t('progress.current'), value: shortDuration(t, s.currentMs) },
    { label: t('progress.longest'), value: shortDuration(t, s.longestMs) },
    { label: t('progress.average'), value: shortDuration(t, s.averageMs) },
    { label: t('progress.count'), value: String(s.streakCount) },
  ]
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((i) => (
        <Card key={i.label}>
          <div className="tabular font-serif text-2xl">{i.value}</div>
          <div className="mt-0.5 text-xs text-subtle">{i.label}</div>
        </Card>
      ))}
    </div>
  )
}
