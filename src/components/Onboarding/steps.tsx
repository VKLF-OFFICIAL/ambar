import { ShieldCheck, Stethoscope } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useT } from '../../hooks/useT'
import { TRACKER_KINDS, RED_LINE_SUGGESTIONS } from '../../data/trackerKinds'
import { SUPPORTED_COUNTRIES } from '../../data/helplines'
import type { MessageKey } from '../../i18n'
import type { TrackerKind } from '../../store/types'
import { Button } from '../ui/Button'
import { Chip } from '../ui/Chip'
import { Field, Select, TextInput } from '../ui/Field'
import type { Draft } from './Onboarding'

export interface StepProps {
  draft: Draft
  update: (patch: Partial<Draft>) => void
  next: () => void
}

export function StepLayout({ title, body, children, footer }: { title: string; body?: string; children?: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-[70dvh] flex-col">
      <h1 className="font-serif text-[28px] leading-tight">{title}</h1>
      {body && <p className="mt-3 text-[15px] leading-relaxed text-muted">{body}</p>}
      <div className="mt-6 flex-1 space-y-4">{children}</div>
      <div className="mt-8 space-y-2">{footer}</div>
    </div>
  )
}

function SkipNext({ onNext, onSkip, nextDisabled, nextLabel }: { onNext: () => void; onSkip: () => void; nextDisabled?: boolean; nextLabel?: string }) {
  const { t } = useT()
  return (
    <>
      <Button size="lg" className="w-full" onClick={onNext} disabled={nextDisabled}>
        {nextLabel ?? t('ui.next')}
      </Button>
      <Button variant="quiet" className="w-full" onClick={onSkip}>
        {t('ui.skip')}
      </Button>
    </>
  )
}

export function StepWelcome({ draft, update, next }: StepProps) {
  const { t } = useT()
  return (
    <StepLayout
      title={t('onboarding.welcomeTitle')}
      body={t('onboarding.welcomeBody')}
      footer={
        <Button size="lg" className="w-full" onClick={next}>
          {t('onboarding.start')}
        </Button>
      }
    >
      <div className="flex items-start gap-3 rounded-[18px] bg-surface p-4 text-sm text-muted">
        <ShieldCheck size={20} className="mt-0.5 shrink-0 text-accent" />
        <p>{t('onboarding.privacy')}</p>
      </div>
      <div className="space-y-2">
        <span className="text-sm text-muted">{t('onboarding.language')}</span>
        <div className="flex gap-2">
          <Chip selected={draft.locale === 'es'} onClick={() => update({ locale: 'es' })}>Español</Chip>
          <Chip selected={draft.locale === 'en'} onClick={() => update({ locale: 'en' })}>English</Chip>
        </div>
      </div>
      <Field label={t('onboarding.country')}>
        <Select value={draft.country} onChange={(e) => update({ country: e.target.value })}>
          {SUPPORTED_COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {t(`countries.${c}` as MessageKey)}
            </option>
          ))}
          {!SUPPORTED_COUNTRIES.includes(draft.country) && <option value={draft.country}>{t('onboarding.countryOther')}</option>}
        </Select>
      </Field>
    </StepLayout>
  )
}

export function StepKind({ draft, update, next }: StepProps) {
  const { t } = useT()
  const choose = (kind: TrackerKind) => {
    update({ kind })
    if (kind !== 'custom') next()
  }
  return (
    <StepLayout
      title={t('onboarding.kindTitle')}
      body={t('onboarding.kindHint')}
      footer={
        draft.kind === 'custom' && (
          <Button size="lg" className="w-full" onClick={next} disabled={!draft.customName?.trim()}>
            {t('ui.next')}
          </Button>
        )
      }
    >
      <div className="grid grid-cols-2 gap-2">
        {TRACKER_KINDS.map((k) => (
          <button
            key={k.kind}
            type="button"
            aria-pressed={draft.kind === k.kind}
            onClick={() => choose(k.kind)}
            className={`flex items-center gap-2.5 rounded-2xl px-3.5 py-3 text-left text-sm transition ${
              draft.kind === k.kind ? 'bg-accent/15 ring-1 ring-accent' : 'bg-surface hover:bg-surface-2'
            }`}
          >
            <span aria-hidden className="text-lg">{k.icon}</span>
            <span>{t(`kinds.${k.kind}`)}</span>
          </button>
        ))}
      </div>
      {draft.kind === 'custom' && (
        <Field label={t('onboarding.customName')}>
          <TextInput autoFocus value={draft.customName ?? ''} onChange={(e) => update({ customName: e.target.value })} maxLength={40} />
        </Field>
      )}
    </StepLayout>
  )
}

export function StepRedLine({ draft, update, next }: StepProps) {
  const { t } = useT()
  const suggestions = (draft.kind && RED_LINE_SUGGESTIONS[draft.kind]) || []
  return (
    <StepLayout
      title={t('onboarding.redLineTitle')}
      body={t('onboarding.redLineBody')}
      footer={
        <Button size="lg" className="w-full" onClick={next} disabled={!draft.redLine?.trim()}>
          {t('ui.next')}
        </Button>
      }
    >
      <div className="flex flex-wrap gap-2">
        {suggestions.map((key) => {
          const text = t(key)
          return (
            <Chip key={key} selected={draft.redLine === text} onClick={() => update({ redLine: text })}>
              {text}
            </Chip>
          )
        })}
      </div>
      <TextInput
        aria-label={t('onboarding.redLineTitle')}
        placeholder={t('onboarding.redLinePlaceholder')}
        value={draft.redLine ?? ''}
        onChange={(e) => update({ redLine: e.target.value })}
        maxLength={80}
      />
    </StepLayout>
  )
}

export function StepMedical({ update, next }: StepProps) {
  const { t } = useT()
  return (
    <StepLayout
      title={t('onboarding.medicalTitle')}
      footer={
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            update({ medicalNoticeAck: true })
            next()
          }}
        >
          {t('onboarding.medicalOk')}
        </Button>
      }
    >
      <div className="flex gap-3 rounded-[18px] bg-surface p-4">
        <Stethoscope size={22} className="mt-0.5 shrink-0 text-accent" />
        <p className="text-[15px] leading-relaxed text-muted">{t('onboarding.medicalBody')}</p>
      </div>
    </StepLayout>
  )
}

function toLocalInput(ms: number): string {
  const d = new Date(ms - new Date(ms).getTimezoneOffset() * 60_000)
  return d.toISOString().slice(0, 16)
}

export function StepStart({ draft, update, next }: StepProps) {
  const { t } = useT()
  const [past, setPast] = useState(false)
  const [max] = useState(() => toLocalInput(Date.now()))
  return (
    <StepLayout
      title={t('onboarding.startTitle')}
      footer={
        past ? (
          <Button size="lg" className="w-full" onClick={next} disabled={!draft.startDate}>
            {t('ui.next')}
          </Button>
        ) : null
      }
    >
      <Button
        size="lg"
        className="w-full"
        onClick={() => {
          update({ startDate: undefined })
          next()
        }}
      >
        {t('onboarding.startNow')}
      </Button>
      <Button size="lg" variant="secondary" className="w-full" onClick={() => setPast(true)} aria-expanded={past}>
        {t('onboarding.startPast')}
      </Button>
      {past && (
        <Field label={t('onboarding.startPastLabel')}>
          <TextInput
            type="datetime-local"
            max={max}
            value={draft.startDate ? toLocalInput(Date.parse(draft.startDate)) : ''}
            onChange={(e) => {
              const ms = new Date(e.target.value).getTime()
              update({ startDate: Number.isFinite(ms) ? new Date(Math.min(ms, Date.now())).toISOString() : undefined })
            }}
          />
        </Field>
      )}
    </StepLayout>
  )
}

export function StepCost({ draft, update, next }: StepProps) {
  const { t } = useT()
  const [period, setPeriod] = useState<'day' | 'week'>('day')
  const [money, setMoney] = useState('')
  const [minutes, setMinutes] = useState('')
  const save = () => {
    const m = Number(money.replace(',', '.'))
    const min = Number(minutes)
    update({
      costPerDay: m > 0 ? (period === 'week' ? m / 7 : m) : undefined,
      minutesPerDay: min > 0 ? min : undefined,
    })
    next()
  }
  return (
    <StepLayout
      title={t('onboarding.costTitle')}
      body={t('onboarding.costBody')}
      footer={<SkipNext onNext={save} onSkip={next} />}
    >
      <Field label={`${t('onboarding.moneyLabel')} (${draft.currency})`}>
        <div className="flex gap-2">
          <TextInput inputMode="decimal" value={money} onChange={(e) => setMoney(e.target.value)} placeholder="0" />
          <Chip selected={period === 'day'} onClick={() => setPeriod('day')}>{t('onboarding.perDay')}</Chip>
          <Chip selected={period === 'week'} onClick={() => setPeriod('week')}>{t('onboarding.perWeek')}</Chip>
        </div>
      </Field>
      <Field label={t('onboarding.minutesLabel')}>
        <TextInput inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ''))} placeholder="0" />
      </Field>
    </StepLayout>
  )
}

export function StepReasons({ draft, update, next }: StepProps) {
  const { t } = useT()
  const reasons = [...draft.reasons, '', '', ''].slice(0, 3)
  const set = (i: number, v: string) => update({ reasons: reasons.map((r, j) => (j === i ? v : r)) })
  return (
    <StepLayout
      title={t('onboarding.reasonsTitle')}
      body={t('onboarding.reasonsBody')}
      footer={
        <SkipNext
          onNext={next}
          onSkip={() => {
            update({ reasons: [] })
            next()
          }}
          nextDisabled={!reasons.some((r) => r.trim())}
        />
      }
    >
      {reasons.map((r, i) => (
        <TextInput
          key={i}
          aria-label={`${t('onboarding.reasonsTitle')} ${i + 1}`}
          placeholder={t('onboarding.reasonPlaceholder')}
          value={r}
          maxLength={120}
          onChange={(e) => set(i, e.target.value)}
        />
      ))}
    </StepLayout>
  )
}

export function StepName({ draft, update, next }: StepProps) {
  const { t } = useT()
  return (
    <StepLayout
      title={t('onboarding.nameTitle')}
      body={t('onboarding.nameBody')}
      footer={
        <SkipNext
          onNext={next}
          onSkip={() => {
            update({ name: undefined })
            next()
          }}
          nextDisabled={!draft.name?.trim()}
        />
      }
    >
      <TextInput
        aria-label={t('onboarding.namePlaceholder')}
        placeholder={t('onboarding.namePlaceholder')}
        value={draft.name ?? ''}
        maxLength={30}
        onChange={(e) => update({ name: e.target.value })}
      />
    </StepLayout>
  )
}

export function StepPin({ update, next }: StepProps) {
  const { t } = useT()
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const valid = /^\d{4,6}$/.test(pin)
  const mismatch = confirm.length >= pin.length && confirm !== pin
  return (
    <StepLayout
      title={t('onboarding.pinTitle')}
      body={t('onboarding.pinBody')}
      footer={
        <SkipNext
          nextLabel={t('onboarding.pinSet')}
          onNext={() => {
            update({ pin })
            next()
          }}
          onSkip={() => {
            update({ pin: undefined })
            next()
          }}
          nextDisabled={!valid || confirm !== pin}
        />
      }
    >
      <Field label={t('onboarding.pinLabel')}>
        <TextInput type="password" inputMode="numeric" autoComplete="off" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
      </Field>
      <Field label={t('onboarding.pinConfirm')} hint={valid && mismatch ? t('onboarding.pinMismatch') : undefined}>
        <TextInput type="password" inputMode="numeric" autoComplete="off" maxLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ''))} />
      </Field>
    </StepLayout>
  )
}
