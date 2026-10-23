import { Share2 } from 'lucide-react'
import type { MessageKey } from '../../i18n'
import { useT } from '../../hooks/useT'
import { useNow } from '../../hooks/useNow'
import { selectActiveTracker, useAddictionStore } from '../../store/useAddictionStore'
import { getElapsed } from '../../lib/time'
import { pickIndex, renderShareCard, shareOrDownload } from '../../lib/shareCard'
import { Button } from '../ui/Button'
import { PageHeader } from '../ui/PageHeader'
import { CalendarView } from './CalendarView'
import { StreaksCard } from './StreaksCard'
import { MilestonesList } from './MilestonesList'
import { PatternsView } from './PatternsView'
import { HealthTimeline } from './HealthTimeline'

const SHARE_MSG_KEYS: MessageKey[] = ['progress.shareMsg1', 'progress.shareMsg2', 'progress.shareMsg3']

export function Progress() {
  const { t } = useT()
  const now = useNow(60_000)
  const tracker = useAddictionStore(selectActiveTracker)
  if (!tracker) return null

  const share = async () => {
    const days = getElapsed(tracker.startDate, now).days
    try {
      const blob = await renderShareCard({
        days: String(days),
        daysLabel: days === 1 ? t('progress.shareDay') : t('progress.shareDays'),
        message: t(SHARE_MSG_KEYS[pickIndex(days, SHARE_MSG_KEYS.length)] ?? 'progress.shareMsg1'),
        brand: 'Ambar',
      })
      await shareOrDownload(blob, 'ambar-progreso.png')
    } catch {
      // Si el navegador no puede generar o compartir la imagen, no se interrumpe nada.
    }
  }

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
      <section>
        <Button variant="secondary" className="w-full" onClick={() => void share()}>
          <Share2 size={18} /> {t('progress.share')}
        </Button>
      </section>
    </div>
  )
}
