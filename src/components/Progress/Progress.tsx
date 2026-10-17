import { useT } from '../../hooks/useT'
import { useNow } from '../../hooks/useNow'
import { selectActiveTracker, useAddictionStore } from '../../store/useAddictionStore'
import { PageHeader } from '../ui/PageHeader'
import { CalendarView } from './CalendarView'
import { StreaksCard } from './StreaksCard'
import { MilestonesList } from './MilestonesList'
import { PatternsView } from './PatternsView'
import { HealthTimeline } from './HealthTimeline'

export function Progress() {
  const { t } = useT()
  const now = useNow(60_000)
  const tracker = useAddictionStore(selectActiveTracker)
  if (!tracker) return null

  return (
    <div className="space-y-10">
      <PageHeader title={t('progress.title')} />
      <section className="-mt-6">
        <h2 className="mb-3 font-serif text-xl">{t('progress.calendar')}</h2>
        <CalendarView tracker={tracker} now={now} />
      </section>
      <section>
        <h2 className="mb-3 font-serif text-xl">{t('progress.streaks')}</h2>
        <StreaksCard tracker={tracker} now={now} />
      </section>
      <section>
        <h2 className="mb-3 font-serif text-xl">{t('progress.milestones')}</h2>
        <MilestonesList tracker={tracker} now={now} />
      </section>
      <section>
        <h2 className="mb-3 font-serif text-xl">{t('progress.patterns')}</h2>
        <PatternsView tracker={tracker} />
      </section>
      <HealthTimeline tracker={tracker} now={now} />
    </div>
  )
}
