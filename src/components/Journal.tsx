import { AnimatePresence, motion } from 'framer-motion'
import { Check, Trash2, Wind } from 'lucide-react'
import { useState } from 'react'
import { useT } from '../hooks/useT'
import { selectActiveTracker, useAddictionStore } from '../store/useAddictionStore'
import { EMOTION_CHIPS, ENVIRONMENT_CHIPS } from '../data/chips'
import { intensityKey, trackerLabel } from '../lib/labels'
import { resolveEntryTime } from '../lib/time'
import { kindInfo } from '../data/trackerKinds'
import type { MessageKey } from '../i18n'
import { Card, Label } from './ui/Card'
import { Chip } from './ui/Chip'
import { Slider } from './ui/Slider'
import { Button } from './ui/Button'
import { inputClass } from './ui/Field'
import { PageHeader } from './ui/PageHeader'

const RECENT = 20

function nowTime(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

export function Journal() {
  const { t, locale } = useT()
  const trackers = useAddictionStore((s) => s.trackers)
  const active = useAddictionStore(selectActiveTracker)
  const journal = useAddictionStore((s) => s.journal)
  const addEntry = useAddictionStore((s) => s.addJournalEntry)
  const deleteEntry = useAddictionStore((s) => s.deleteJournalEntry)

  const [trackerId, setTrackerId] = useState(active?.id ?? '')
  const [intensity, setIntensity] = useState(5)
  const [emotions, setEmotions] = useState<string[]>([])
  const [environments, setEnvironments] = useState<string[]>([])
  const [overcame, setOvercame] = useState<boolean | undefined>(undefined)
  const [time, setTime] = useState(nowTime)
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState('')
  const [justSaved, setJustSaved] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const save = () => {
    const at = resolveEntryTime(time, Date.now())
    addEntry({
      trackerId: trackerId || active?.id || '',
      source: 'checkin',
      intensity,
      emotions,
      environments,
      overcame,
      note: note.trim() || undefined,
      at: at.toISOString(),
    })
    setIntensity(5)
    setEmotions([])
    setEnvironments([])
    setOvercame(undefined)
    setNote('')
    setNoteOpen(false)
    setTime(nowTime())
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2500)
  }

  const fmt = new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <div>
      <PageHeader title={t('journal.title')} subtitle={t('journal.subtitle')} />

      <div className="space-y-6">
        {trackers.length > 1 && (
          <section className="space-y-2">
            <Label>{t('journal.tracker')}</Label>
            <div className="flex flex-wrap gap-2">
              {trackers.map((tr) => (
                <Chip key={tr.id} selected={trackerId === tr.id} onClick={() => setTrackerId(tr.id)}>
                  {kindInfo(tr.kind).icon} {trackerLabel(t, tr)}
                </Chip>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-baseline justify-between">
            <Label>{t('journal.intensity')}</Label>
            <span className="text-sm text-muted">{t(intensityKey(intensity))}</span>
          </div>
          <div className="tabular mt-2 font-serif text-5xl text-accent">{intensity}</div>
          <div className="mt-4">
            <Slider value={intensity} min={0} max={10} onChange={setIntensity} label={t('journal.intensity')} valueText={`${intensity} — ${t(intensityKey(intensity))}`} />
          </div>
        </section>

        <section className="space-y-2">
          <Label>{t('journal.emotion')}</Label>
          <div className="flex flex-wrap gap-2">
            {EMOTION_CHIPS.map((c) => (
              <Chip key={c} selected={emotions.includes(c)} onClick={() => setEmotions((l) => toggle(l, c))}>
                {t(`chips.emotions.${c}`)}
              </Chip>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <Label>{t('journal.environment')}</Label>
          <div className="flex flex-wrap gap-2">
            {ENVIRONMENT_CHIPS.map((c) => (
              <Chip key={c} selected={environments.includes(c)} onClick={() => setEnvironments((l) => toggle(l, c))}>
                {t(`chips.environments.${c}`)}
              </Chip>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <Label>{t('journal.overcame')}</Label>
          <div className="flex flex-wrap gap-2">
            <Chip selected={overcame === true} onClick={() => setOvercame(overcame === true ? undefined : true)}>
              {t('journal.yes')}
            </Chip>
            <Chip selected={overcame === false} onClick={() => setOvercame(overcame === false ? undefined : false)}>
              {t('journal.stillGoing')}
            </Chip>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted">
            {t('journal.time')}
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={`${inputClass} !w-auto !py-2`} />
          </label>
          {!noteOpen && (
            <Button variant="quiet" className="!px-1 text-sm" onClick={() => setNoteOpen(true)}>
              {t('journal.addNote')}
            </Button>
          )}
        </div>
        {noteOpen && (
          <textarea
            aria-label={t('journal.addNote')}
            placeholder={t('journal.notePlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={3}
            className={inputClass}
          />
        )}

        <Button size="lg" className="w-full" onClick={save}>
          {t('ui.save')}
        </Button>
        <AnimatePresence>
          {justSaved && (
            <motion.p
              role="status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 text-sm text-accent"
            >
              <Check size={16} /> {t('journal.saved')}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <section className="mt-10">
        <h2 className="mb-3 font-serif text-xl" id="recent-title">
          {t('journal.recent')}
        </h2>
        {journal.length === 0 ? (
          <p className="text-sm text-subtle">{t('journal.empty')}</p>
        ) : (
          <ul aria-labelledby="recent-title" className="space-y-2">
            {journal.slice(0, RECENT).map((e) => {
              const tr = trackers.find((x) => x.id === e.trackerId)
              return (
                <li key={e.id}>
                  <Card className="!p-3.5">
                    <div className="flex items-start gap-3">
                      <div className="tabular flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 font-serif text-lg text-accent">
                        {e.intensity}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-subtle">
                          {fmt.format(new Date(e.at))}
                          {tr && trackers.length > 1 ? ` · ${trackerLabel(t, tr)}` : ''}
                        </div>
                        <div className="mt-0.5 text-sm">
                          {e.source === 'sos' ? (
                            <span className="inline-flex items-center gap-1.5 text-muted">
                              <Wind size={14} /> {t('journal.fromSos', { n: Math.max(1, Math.round((e.sosDurationSec ?? 0) / 60)) })}
                            </span>
                          ) : (
                            [...e.emotions.map((c) => t(`chips.emotions.${c}` as MessageKey)), ...e.environments.map((c) => t(`chips.environments.${c}` as MessageKey))].join(' · ') ||
                            t(intensityKey(e.intensity))
                          )}
                        </div>
                        {e.note && <p className="mt-1 text-sm text-muted">{e.note}</p>}
                      </div>
                      {confirmId === e.id ? (
                        <div className="flex shrink-0 gap-1">
                          <Button variant="secondary" className="!px-2.5 !py-1.5 text-xs" onClick={() => deleteEntry(e.id)}>
                            {t('ui.delete')}
                          </Button>
                          <Button variant="quiet" className="!px-2 !py-1.5 text-xs" onClick={() => setConfirmId(null)}>
                            {t('ui.cancel')}
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          aria-label={t('journal.deleteConfirm')}
                          onClick={() => setConfirmId(e.id)}
                          className="shrink-0 rounded-full p-1.5 text-subtle hover:text-text"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </Card>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
