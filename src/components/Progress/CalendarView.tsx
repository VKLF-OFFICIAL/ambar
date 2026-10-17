import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useT } from '../../hooks/useT'
import { useAddictionStore } from '../../store/useAddictionStore'
import type { Tracker } from '../../store/types'
import { classifyDays, type DayStatus } from '../../lib/calendar'
import { toLocalDateKey } from '../../lib/time'
import { Card } from '../ui/Card'

const CELL: Record<DayStatus, string> = {
  free: 'bg-accent/20 text-text',
  strong: 'bg-accent text-on-accent font-medium',
  relapse: 'bg-surface-2 text-subtle ring-1 ring-inset ring-subtle/50',
  before: 'text-subtle/50',
}

export function CalendarView({ tracker, now }: { tracker: Tracker; now: number }) {
  const { t, locale } = useT()
  const journal = useAddictionStore((s) => s.journal)
  const pledges = useAddictionStore((s) => s.pledges)
  const [offset, setOffset] = useState(0)

  const { cells, title } = useMemo(() => {
    const base = new Date(now)
    const first = new Date(base.getFullYear(), base.getMonth() + offset, 1)
    const last = new Date(first.getFullYear(), first.getMonth() + 1, 0)
    const todayKey = toLocalDateKey(now)
    const lastKey = toLocalDateKey(last) < todayKey ? toLocalDateKey(last) : todayKey
    const status = toLocalDateKey(first) <= todayKey ? classifyDays(tracker, journal, toLocalDateKey(first), lastKey) : new Map<string, DayStatus>()
    const pledged = new Set(pledges.filter((p) => p.pledgedAt).map((p) => p.date))
    const lead = (first.getDay() + 6) % 7
    const list: ({ key: string; day: number; status?: DayStatus; pledged: boolean; today: boolean } | null)[] = Array.from({ length: lead }, () => null)
    for (let d = 1; d <= last.getDate(); d++) {
      const key = toLocalDateKey(new Date(first.getFullYear(), first.getMonth(), d))
      list.push({ key, day: d, status: status.get(key), pledged: pledged.has(key), today: key === todayKey })
    }
    const title = new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-GB', { month: 'long', year: 'numeric' }).format(first)
    return { cells: list, title }
  }, [now, offset, tracker, journal, pledges, locale])

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" aria-label={t('progress.prevMonth')} onClick={() => setOffset((o) => o - 1)} className="rounded-full p-1.5 text-muted hover:text-text">
          <ChevronLeft size={18} />
        </button>
        <div className="text-sm font-medium capitalize">{title}</div>
        <button
          type="button"
          aria-label={t('progress.nextMonth')}
          disabled={offset >= 0}
          onClick={() => setOffset((o) => o + 1)}
          className="rounded-full p-1.5 text-muted hover:text-text disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] text-subtle">
        {t('progress.weekdays').split(',').map((d, i) => (
          <div key={i} aria-hidden>
            {d}
          </div>
        ))}
        {cells.map((c, i) =>
          c ? (
            <div
              key={c.key}
              title={c.key}
              className={`relative flex aspect-square items-center justify-center rounded-full text-xs ${c.status ? CELL[c.status] : 'text-subtle/40'} ${
                c.today ? 'outline-2 outline-offset-1 outline-accent' : ''
              }`}
            >
              {c.day}
              {c.pledged && <span aria-hidden className="absolute bottom-0.5 h-1 w-1 rounded-full bg-text/70" />}
            </div>
          ) : (
            <div key={`e${i}`} />
          ),
        )}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted">
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-accent/30" />{t('progress.legendFree')}</li>
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-accent" />{t('progress.legendStrong')}</li>
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full ring-1 ring-subtle" />{t('progress.legendRelapse')}</li>
        <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-text/70" />{t('progress.legendPledge')}</li>
      </ul>
    </Card>
  )
}
