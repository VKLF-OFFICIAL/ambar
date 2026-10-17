import { AnimatePresence } from 'framer-motion'
import { HeartPulse, Wind } from 'lucide-react'
import { useT } from '../hooks/useT'
import { useNow } from '../hooks/useNow'
import { selectActiveTracker, useAddictionStore } from '../store/useAddictionStore'
import { useUiStore } from '../store/useUiStore'
import { getElapsed, twoDigits } from '../lib/time'
import { getMilestoneState, pendingCelebration } from '../lib/milestones'
import { milestoneTitle } from '../lib/labels'
import { savings } from '../lib/stats'
import { formatHours, formatMoney, shortDuration } from '../lib/format'
import { kindInfo } from '../data/trackerKinds'
import { Card, Label } from './ui/Card'
import { ProgressBar } from './ui/ProgressBar'
import { Button } from './ui/Button'
import { TrackerSwitcher } from './TrackerSwitcher'
import { DailyPledge } from './DailyPledge'
import { Celebration } from './Celebration'
import type { MessageKey } from '../i18n'

function greetingKey(hour: number): MessageKey {
  if (hour >= 6 && hour < 13) return 'dashboard.morning'
  if (hour >= 13 && hour < 20) return 'dashboard.afternoon'
  return 'dashboard.evening'
}

export function Dashboard() {
  const { t, locale } = useT()
  const now = useNow()
  const tracker = useAddictionStore(selectActiveTracker)
  const settings = useAddictionStore((s) => s.settings)
  const markCelebrated = useAddictionStore((s) => s.markMilestoneCelebrated)
  const openSos = useUiStore((s) => s.openSos)
  const openRelapse = useUiStore((s) => s.openRelapse)
  const setTab = useUiStore((s) => s.setTab)
  const setAddingTracker = useUiStore((s) => s.setAddingTracker)
  const overlayOpen = useUiStore((s) => s.sosOpen || s.relapseFor !== null)

  if (!tracker) return null

  const elapsed = getElapsed(tracker.startDate, now)
  const ms = getMilestoneState(elapsed.totalMs)
  // Nunca celebrar encima del modo calma o de la reflexión tras una recaída.
  const pending = overlayOpen ? null : pendingCelebration(elapsed.totalMs, tracker.celebratedMilestones)
  const saved = savings(tracker, elapsed.totalMs)
  const greeting = t(greetingKey(new Date(now).getHours()))
  const info = kindInfo(tracker.kind)

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {settings.name ? t('dashboard.withName', { greeting, name: settings.name }) : greeting}
        </p>
        <TrackerSwitcher onAdd={() => setAddingTracker(true)} />
      </div>

      <section aria-live="off" className="pt-6 pb-4">
        <Label>{t('dashboard.youveBeen')}</Label>
        <div className="mt-2 flex items-baseline gap-3">
          <span data-testid="days" className="tabular font-serif text-[76px] leading-none font-normal tracking-tight">
            {elapsed.days}
          </span>
          <span className="font-serif text-xl italic text-muted">
            {elapsed.days === 1 ? t('dashboard.day') : t('dashboard.days')}
          </span>
        </div>
        <div data-testid="hms" className="tabular mt-3 text-xl text-accent">
          {t('dashboard.hms', { h: twoDigits(elapsed.hours), m: twoDigits(elapsed.minutes), s: twoDigits(elapsed.seconds) })}
        </div>
        {tracker.redLine && <p className="mt-3 text-xs text-subtle">{t('dashboard.redLine', { text: tracker.redLine })}</p>}
      </section>

      <Card>
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-xs text-muted">{t('dashboard.nextMilestone')}</div>
          <div className="text-xs text-subtle">
            {t('dashboard.remaining', { time: shortDuration(t, ms.next.ms - elapsed.totalMs) })}
          </div>
        </div>
        <div className="mt-1 text-[17px] font-medium">{milestoneTitle(t, ms.next)}</div>
        <div className="mt-3">
          <ProgressBar value={ms.progress} label={t('dashboard.nextMilestone')} />
        </div>
      </Card>

      {saved.money !== null || saved.minutes !== null ? (
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <div className="tabular text-xl font-medium">
              {saved.money !== null ? formatMoney(saved.money, locale, settings.currency) : '—'}
            </div>
            <div className="mt-0.5 text-xs text-subtle">{t('dashboard.saved')}</div>
          </Card>
          <Card>
            <div className="tabular text-xl font-medium">{saved.minutes !== null ? formatHours(saved.minutes, locale) : '—'}</div>
            <div className="mt-0.5 text-xs text-subtle">{t('dashboard.timeBack')}</div>
          </Card>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setTab('reasons')}
          className="w-full rounded-[18px] border border-dashed border-border px-4 py-3 text-left text-sm text-subtle transition hover:text-muted"
        >
          {t('dashboard.setupSavings')}
        </button>
      )}

      <DailyPledge now={now} />

      <Button size="lg" className="mt-2 w-full !py-5 text-[16px]" onClick={openSos}>
        <Wind size={20} /> {t('ui.sos')}
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <Button variant="quiet" className="!px-1 text-sm" onClick={() => openRelapse(tracker.id)}>
          {t('dashboard.relapse')}
        </Button>
        {info.healthTimeline && (
          <Button variant="quiet" className="!px-1 text-sm" onClick={() => setTab('progress')}>
            <HeartPulse size={16} /> {t('dashboard.health')}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {pending && (
          <Celebration key={pending.id} milestone={pending} onClose={() => markCelebrated(tracker.id, pending.id)} />
        )}
      </AnimatePresence>
    </div>
  )
}
