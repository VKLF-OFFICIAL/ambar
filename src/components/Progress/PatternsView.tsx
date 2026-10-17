import { useT } from '../../hooks/useT'
import { useAddictionStore } from '../../store/useAddictionStore'
import type { Tracker } from '../../store/types'
import { computePatterns, type HourBand } from '../../lib/patterns'
import type { MessageKey } from '../../i18n'
import { Card, Label } from '../ui/Card'

function Bars({ items, testId }: { items: { label: string; value: number }[]; testId?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <ul data-testid={testId} className="mt-2 space-y-1.5">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-3 text-xs">
          <span className="w-28 shrink-0 truncate text-muted">{i.label}</span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
            <span className="block h-full rounded-full bg-accent" style={{ width: `${(i.value / max) * 100}%` }} />
          </span>
          <span className="tabular w-5 text-right text-subtle">{i.value}</span>
        </li>
      ))}
    </ul>
  )
}

const BANDS: HourBand[] = ['morning', 'afternoon', 'evening', 'night']

export function PatternsView({ tracker }: { tracker: Tracker }) {
  const { t } = useT()
  const journal = useAddictionStore((s) => s.journal)
  const p = computePatterns(journal.filter((e) => e.trackerId === tracker.id))
  if (!p) return <p className="text-sm text-subtle">{t('progress.keepLogging')}</p>
  const weekdays = t('progress.weekdays').split(',')

  return (
    <Card className="space-y-5">
      {p.strongCount > 0 && <p className="text-xs text-subtle">{t('progress.patternsHint')}</p>}
      {p.topEmotions.length > 0 && (
        <div>
          <Label>{t('progress.topEmotions')}</Label>
          <Bars testId="top-emotions" items={p.topEmotions.slice(0, 4).map((e) => ({ label: t(`chips.emotions.${e.key}` as MessageKey), value: e.count }))} />
        </div>
      )}
      {p.topEnvironments.length > 0 && (
        <div>
          <Label>{t('progress.topEnvironments')}</Label>
          <Bars items={p.topEnvironments.slice(0, 4).map((e) => ({ label: t(`chips.environments.${e.key}` as MessageKey), value: e.count }))} />
        </div>
      )}
      <div>
        <Label>{t('progress.byHour')}</Label>
        <Bars items={BANDS.map((b) => ({ label: t(`progress.${b}`), value: p.byHourBand[b] }))} />
      </div>
      <div>
        <Label>{t('progress.byWeekday')}</Label>
        <div className="mt-3 flex h-20 items-end gap-2">
          {p.byWeekday.map((v, i) => {
            const max = Math.max(1, ...p.byWeekday)
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t-md bg-accent/80" style={{ height: `${Math.max(4, (v / max) * 56)}px` }} title={String(v)} />
                <span className="text-[10px] text-subtle">{weekdays[i]}</span>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
