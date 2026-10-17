import { ChevronDown, ChevronUp, Heart, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useT } from '../hooks/useT'
import { useNow } from '../hooks/useNow'
import { selectActiveTracker, useAddictionStore } from '../store/useAddictionStore'
import { savings, streakStats } from '../lib/stats'
import { formatHours, formatMoney } from '../lib/format'
import { Card, Label } from './ui/Card'
import { Button } from './ui/Button'
import { Field, TextInput } from './ui/Field'
import { PageHeader } from './ui/PageHeader'

function SavingsCard() {
  const { t, locale } = useT()
  const now = useNow(60_000)
  const tracker = useAddictionStore(selectActiveTracker)
  const currency = useAddictionStore((s) => s.settings.currency)
  const updateTracker = useAddictionStore((s) => s.updateTracker)
  const [editing, setEditing] = useState(false)
  const [cost, setCost] = useState('')
  const [minutes, setMinutes] = useState('')
  if (!tracker) return null

  const stats = streakStats(tracker, now)
  const current = savings(tracker, stats.currentMs)
  const total = savings(tracker, stats.totalFreeMs)
  const configured = current.money !== null || current.minutes !== null

  const startEdit = () => {
    setCost(tracker.costPerDay ? String(Math.round(tracker.costPerDay * 100) / 100) : '')
    setMinutes(tracker.minutesPerDay ? String(Math.round(tracker.minutesPerDay)) : '')
    setEditing(true)
  }
  const save = () => {
    const c = Number(cost.replace(',', '.'))
    const m = Number(minutes)
    updateTracker(tracker.id, { costPerDay: c > 0 ? c : undefined, minutesPerDay: m > 0 ? m : undefined })
    setEditing(false)
  }

  return (
    <section className="mt-10">
      <h2 className="mb-3 font-serif text-xl">{t('reasons.savingsTitle')}</h2>
      {configured && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: t('reasons.thisStreak'), s: current, id: 'current' },
            { label: t('reasons.allTime'), s: total, id: 'total' },
          ].map(({ label, s, id }) => (
            <Card key={id}>
              <Label>{label}</Label>
              {s.money !== null && (
                <div data-testid={`money-${id}`} className="tabular mt-2 text-xl font-medium">
                  {formatMoney(s.money, locale, currency)}
                </div>
              )}
              {s.minutes !== null && <div className="tabular mt-1 text-sm text-muted">{formatHours(s.minutes, locale)}</div>}
            </Card>
          ))}
        </div>
      )}
      {!configured && !editing && <p className="text-sm text-subtle">{t('reasons.noCost')}</p>}
      {editing ? (
        <Card className="mt-3 space-y-3">
          <Field label={t('reasons.costPerDay', { currency })}>
            <TextInput inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} />
          </Field>
          <Field label={t('reasons.minutesPerDay')}>
            <TextInput inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ''))} />
          </Field>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={save}>
              {t('ui.save')}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              {t('ui.cancel')}
            </Button>
          </div>
        </Card>
      ) : (
        <Button variant="quiet" className="mt-2 !px-1 text-sm" onClick={startEdit}>
          {t('reasons.editCost')}
        </Button>
      )}
    </section>
  )
}

export function Reasons() {
  const { t } = useT()
  const tracker = useAddictionStore(selectActiveTracker)
  const addReason = useAddictionStore((s) => s.addReason)
  const removeReason = useAddictionStore((s) => s.removeReason)
  const reorderReasons = useAddictionStore((s) => s.reorderReasons)
  const [text, setText] = useState('')
  const [emoji, setEmoji] = useState('')
  if (!tracker) return null

  const ids = tracker.reasons.map((r) => r.id)
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= ids.length) return
    const next = [...ids]
    ;[next[i], next[j]] = [next[j] as string, next[i] as string]
    reorderReasons(tracker.id, next)
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    addReason(tracker.id, text.trim(), emoji.trim() || undefined)
    setText('')
    setEmoji('')
  }

  return (
    <div>
      <PageHeader title={t('reasons.title')} subtitle={t('reasons.subtitle')} />

      {tracker.reasons.length === 0 ? (
        <p className="text-sm text-subtle">{t('reasons.empty')}</p>
      ) : (
        <ul className="space-y-2">
          {tracker.reasons.map((r, i) => (
            <li key={r.id}>
              <Card className="flex items-center gap-3 !py-3">
                <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  {r.emoji ?? <Heart size={16} />}
                </span>
                <span className="min-w-0 flex-1 text-[15px] leading-snug">{r.text}</span>
                <div className="flex shrink-0 items-center text-subtle">
                  <button type="button" aria-label={t('reasons.up', { text: r.text })} disabled={i === 0} onClick={() => move(i, -1)} className="rounded-full p-1.5 hover:text-text disabled:opacity-30">
                    <ChevronUp size={17} />
                  </button>
                  <button
                    type="button"
                    aria-label={t('reasons.down', { text: r.text })}
                    disabled={i === tracker.reasons.length - 1}
                    onClick={() => move(i, 1)}
                    className="rounded-full p-1.5 hover:text-text disabled:opacity-30"
                  >
                    <ChevronDown size={17} />
                  </button>
                  <button type="button" aria-label={t('reasons.remove', { text: r.text })} onClick={() => removeReason(tracker.id, r.id)} className="rounded-full p-1.5 hover:text-text">
                    <X size={16} />
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <TextInput aria-label={t('reasons.emoji')} placeholder="✦" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} className="!w-14 text-center" />
        <TextInput aria-label={t('reasons.newReason')} placeholder={t('reasons.placeholder')} value={text} onChange={(e) => setText(e.target.value)} maxLength={120} />
        <Button type="submit" variant="secondary" disabled={!text.trim()}>
          {t('reasons.add')}
        </Button>
      </form>

      <SavingsCard />
    </div>
  )
}
