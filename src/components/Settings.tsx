import { AlertTriangle, Download, Plus, Trash2, Upload, X } from 'lucide-react'
import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { useT } from '../hooks/useT'
import { useAddictionStore } from '../store/useAddictionStore'
import { useUiStore } from '../store/useUiStore'
import { SUPPORTED_COUNTRIES, currencyFor } from '../data/helplines'
import { kindInfo } from '../data/trackerKinds'
import { trackerLabel } from '../lib/labels'
import { parseImport, type BackupData } from '../lib/backup'
import { cryptoAvailable } from '../lib/crypto'
import { downloadBackup } from '../lib/download'
import type { MessageKey } from '../i18n'
import type { Tracker } from '../store/types'
import { APP_VERSION } from '../version'
import { Card, Label } from './ui/Card'
import { Chip } from './ui/Chip'
import { Button } from './ui/Button'
import { Field, Select, TextInput } from './ui/Field'
import { PageHeader } from './ui/PageHeader'
import { InstallCard } from './InstallCard'

const CURRENCIES = ['EUR', 'USD', 'MXN', 'ARS', 'COP', 'CLP', 'GBP', 'CAD']

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-xl">{title}</h2>
      {hint && <p className="mt-1 text-sm text-subtle">{hint}</p>}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  )
}

function PinSection() {
  const { t } = useT()
  const pinHash = useAddictionStore((s) => s.settings.pinHash)
  const setPin = useAddictionStore((s) => s.setPin)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const valid = /^\d{4,6}$/.test(value)
  const available = cryptoAvailable()

  // Sin WebCrypto no se puede cifrar: no ofrecer activar PIN (salvo quitar uno ya puesto).
  if (!available && !pinHash) {
    return (
      <Card className="space-y-2">
        <span className="text-[15px]">{t('settings.pinOff')}</span>
        <p className="text-xs text-subtle">{t('settings.pinUnavailable')}</p>
      </Card>
    )
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[15px]">{pinHash ? t('settings.pinOn') : t('settings.pinOff')}</span>
        <div className="flex gap-2">
          <Button variant="secondary" className="!py-2 text-sm" disabled={!available} onClick={() => setEditing((e) => !e)}>
            {pinHash ? t('settings.pinChange') : t('settings.pinSet')}
          </Button>
          {pinHash && (
            <Button variant="ghost" className="!py-2 text-sm" onClick={() => void setPin(null)}>
              {t('settings.pinRemove')}
            </Button>
          )}
        </div>
      </div>
      {editing && (
        <div className="flex gap-2">
          <TextInput
            type="password"
            inputMode="numeric"
            autoComplete="off"
            aria-label={t('settings.pinNew')}
            placeholder={t('settings.pinNew')}
            maxLength={6}
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
          />
          <Button
            disabled={!valid}
            onClick={() => {
              void setPin(value)
              setValue('')
              setEditing(false)
            }}
          >
            {t('ui.save')}
          </Button>
        </div>
      )}
      <p className="text-xs text-subtle">{t('settings.pinNote')}</p>
    </Card>
  )
}

function toLocalInput(iso: string): string {
  const ms = Date.parse(iso)
  return new Date(ms - new Date(ms).getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

function TrackerRow({ tracker }: { tracker: Tracker }) {
  const { t } = useT()
  const updateTracker = useAddictionStore((s) => s.updateTracker)
  const removeTracker = useAddictionStore((s) => s.removeTracker)
  const count = useAddictionStore((s) => s.trackers.length)
  const [sure, setSure] = useState(false)
  const [max] = useState(() => toLocalInput(new Date().toISOString()))
  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2 text-[15px]">
        <span aria-hidden>{kindInfo(tracker.kind).icon}</span> {trackerLabel(t, tracker)}
      </div>
      <Field label={t('settings.rename')}>
        <TextInput value={tracker.customName ?? ''} placeholder={t(`kinds.${tracker.kind}`)} maxLength={40} onChange={(e) => updateTracker(tracker.id, { customName: e.target.value || undefined })} />
      </Field>
      <Field label={t('settings.startDate')}>
        <TextInput
          type="datetime-local"
          value={toLocalInput(tracker.startDate)}
          max={max}
          onChange={(e) => {
            const ms = new Date(e.target.value).getTime()
            if (Number.isFinite(ms)) updateTracker(tracker.id, { startDate: new Date(ms).toISOString() })
          }}
        />
      </Field>
      {count > 1 && (
        <div>
          {sure && <p className="mb-2 text-xs text-accent">{t('settings.removeTrackerConfirm')}</p>}
          <Button variant="quiet" className="!px-0 text-sm" onClick={() => (sure ? removeTracker(tracker.id) : setSure(true))}>
            <Trash2 size={15} /> {t('settings.removeTracker')}
          </Button>
        </div>
      )}
    </Card>
  )
}

function ContactsSection() {
  const { t } = useT()
  const contacts = useAddictionStore((s) => s.settings.customHelplines)
  const updateSettings = useAddictionStore((s) => s.updateSettings)
  const [label, setLabel] = useState('')
  const [phone, setPhone] = useState('')
  return (
    <Section title={t('settings.contacts')} hint={t('settings.contactsHint')}>
      {contacts.map((c, i) => (
        <Card key={`${c.phone}-${i}`} className="flex items-center justify-between !py-3">
          <div>
            <div className="text-[15px]">{c.label}</div>
            <div className="tabular text-sm text-muted">{c.phone}</div>
          </div>
          <button
            type="button"
            aria-label={t('settings.removeContact', { name: c.label })}
            onClick={() => updateSettings({ customHelplines: contacts.filter((_, j) => j !== i) })}
            className="rounded-full p-2 text-subtle hover:text-text"
          >
            <X size={16} />
          </button>
        </Card>
      ))}
      <div className="flex gap-2">
        <TextInput aria-label={t('settings.contactName')} placeholder={t('settings.contactName')} value={label} onChange={(e) => setLabel(e.target.value)} maxLength={30} />
        <TextInput aria-label={t('settings.contactPhone')} placeholder={t('settings.contactPhone')} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s*#-]/g, ''))} maxLength={20} />
        <Button
          variant="secondary"
          aria-label={t('settings.addContact')}
          disabled={!label.trim() || !phone.trim()}
          onClick={() => {
            updateSettings({ customHelplines: [...contacts, { label: label.trim(), phone: phone.trim() }] })
            setLabel('')
            setPhone('')
          }}
        >
          <Plus size={18} />
        </Button>
      </div>
    </Section>
  )
}

function DataSection() {
  const { t } = useT()
  const exportData = useAddictionStore((s) => s.exportData)
  const importData = useAddictionStore((s) => s.importData)
  const wipeAll = useAddictionStore((s) => s.wipeAll)
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<{ ok: boolean; key: MessageKey } | null>(null)
  const [word, setWord] = useState('')
  const [pending, setPending] = useState<{ json: string; data: BackupData; exportedAt?: string } | null>(null)
  const { locale } = useT()

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const json = await file.text()
    const res = parseImport(json)
    if (res.ok) {
      setStatus(null)
      setPending({ json, data: res.data, exportedAt: res.exportedAt })
    } else {
      setStatus({ ok: false, key: res.reason === 'parse' ? 'settings.importParse' : res.reason === 'version' ? 'settings.importVersion' : 'settings.importShape' })
    }
  }

  const confirmImport = () => {
    if (!pending) return
    const res = importData(pending.json)
    setPending(null)
    setStatus(res.ok ? { ok: true, key: 'settings.importOk' } : { ok: false, key: 'settings.importShape' })
  }

  return (
    <Section title={t('settings.data')} hint={t('settings.dataHint')}>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={() => downloadBackup(exportData())}>
          <Download size={17} /> {t('settings.export')}
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          <Upload size={17} /> {t('settings.import')}
        </Button>
      </div>
      <input ref={fileRef} type="file" accept="application/json,.json" aria-label={t('settings.import')} className="sr-only" onChange={(e) => void onFile(e)} />
      {pending && (
        <Card className="space-y-3 ring-1 ring-accent/50">
          <div className="text-[15px] font-medium">{t('importConfirm.title')}</div>
          <p className="text-sm leading-relaxed text-muted">
            {t('importConfirm.body', {
              date: pending.exportedAt ? new Date(pending.exportedAt).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB') : '—',
              trackers: pending.data.trackers.length,
              entries: pending.data.journal.length,
            })}
          </p>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={confirmImport}>
              {t('importConfirm.confirm')}
            </Button>
            <Button variant="ghost" onClick={() => setPending(null)}>
              {t('ui.cancel')}
            </Button>
          </div>
        </Card>
      )}
      {status && (
        <p role={status.ok ? 'status' : 'alert'} className={`text-sm ${status.ok ? 'text-muted' : 'text-accent'}`}>
          {t(status.key)}
        </p>
      )}
      <Card className="space-y-3">
        <Label>{t('settings.wipe')}</Label>
        <p className="text-xs text-subtle">{t('settings.wipeHint', { word: t('settings.wipeWord') })}</p>
        <div className="flex gap-2">
          <TextInput aria-label={t('settings.wipe')} value={word} onChange={(e) => setWord(e.target.value)} />
          <Button variant="ghost" disabled={word.trim().toUpperCase() !== t('settings.wipeWord')} onClick={() => wipeAll()}>
            {t('ui.delete')}
          </Button>
        </div>
      </Card>
    </Section>
  )
}

export function Settings() {
  const { t } = useT()
  const settings = useAddictionStore((s) => s.settings)
  const trackers = useAddictionStore((s) => s.trackers)
  const storageAvailable = useAddictionStore((s) => s.storageAvailable)
  const updateSettings = useAddictionStore((s) => s.updateSettings)
  const setAddingTracker = useUiStore((s) => s.setAddingTracker)

  return (
    <div className="space-y-10">
      <PageHeader title={t('settings.title')} />

      {!storageAvailable && (
        <div role="alert" className="-mt-6 flex gap-3 rounded-[18px] bg-accent/15 p-4 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-accent" />
          {t('settings.storageWarning')}
        </div>
      )}

      <InstallCard />

      <Section title={t('settings.appearance')}>
        <div className="flex gap-2">
          <Chip selected={settings.theme === 'dark'} onClick={() => updateSettings({ theme: 'dark' })}>{t('settings.themeDark')}</Chip>
          <Chip selected={settings.theme === 'light'} onClick={() => updateSettings({ theme: 'light' })}>{t('settings.themeLight')}</Chip>
        </div>
        <label className="flex items-center justify-between rounded-[18px] bg-surface px-4 py-3.5 text-[15px]">
          {t('settings.reduceMotion')}
          <input
            type="checkbox"
            role="switch"
            checked={settings.reduceMotion}
            onChange={(e) => updateSettings({ reduceMotion: e.target.checked })}
            className="h-5 w-5 accent-[var(--accent)]"
          />
        </label>
      </Section>

      <Section title={t('settings.region')}>
        <div className="flex gap-2">
          <Chip selected={settings.locale === 'es'} onClick={() => updateSettings({ locale: 'es' })}>Español</Chip>
          <Chip selected={settings.locale === 'en'} onClick={() => updateSettings({ locale: 'en' })}>English</Chip>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('settings.country')}>
            <Select value={settings.country} onChange={(e) => updateSettings({ country: e.target.value, currency: currencyFor(e.target.value) })}>
              {SUPPORTED_COUNTRIES.map((c) => (
                <option key={c} value={c}>{t(`countries.${c}` as MessageKey)}</option>
              ))}
              {!SUPPORTED_COUNTRIES.includes(settings.country) && <option value={settings.country}>{t('onboarding.countryOther')}</option>}
            </Select>
          </Field>
          <Field label={t('settings.currency')}>
            <Select value={settings.currency} onChange={(e) => updateSettings({ currency: e.target.value })}>
              {[...new Set([settings.currency, ...CURRENCIES])].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>

      <Section title={t('settings.security')}>
        <PinSection />
      </Section>

      <Section title={t('settings.trackers')}>
        {trackers.map((tr) => (
          <TrackerRow key={tr.id} tracker={tr} />
        ))}
        <Button variant="ghost" className="w-full" onClick={() => setAddingTracker(true)}>
          <Plus size={17} /> {t('ui.addTracker')}
        </Button>
      </Section>

      <ContactsSection />

      <DataSection />

      <Section title={t('settings.about')}>
        <p className="text-sm leading-relaxed text-muted">{t('settings.disclaimer')}</p>
        <p className="text-xs text-subtle">{t('settings.version', { v: APP_VERSION })}</p>
      </Section>
    </div>
  )
}
