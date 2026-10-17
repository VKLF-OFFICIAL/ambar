import { ExternalLink, Phone } from 'lucide-react'
import { useT } from '../../hooks/useT'
import { useAddictionStore } from '../../store/useAddictionStore'
import { FIND_A_HELPLINE_URL, helplinesFor } from '../../data/helplines'
import { Sheet } from '../ui/Sheet'

function Line({ label, phone }: { label: string; phone: string }) {
  return (
    <a
      href={`tel:${phone.replace(/\s/g, '')}`}
      className="flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3.5 transition hover:ring-1 hover:ring-accent"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
        <Phone size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-muted">{label}</span>
        <span className="tabular block text-lg font-medium">{phone}</span>
      </span>
    </a>
  )
}

export function HelpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT()
  const country = useAddictionStore((s) => s.settings.country)
  const custom = useAddictionStore((s) => s.settings.customHelplines)
  return (
    <Sheet open={open} onClose={onClose} title={t('sos.talkTitle')} closeLabel={t('ui.close')}>
      <p className="mb-4 text-sm leading-relaxed text-muted">{t('sos.talkBody')}</p>
      <div className="space-y-2">
        {custom.length > 0 && <div className="pt-1 text-xs uppercase tracking-wider text-subtle">{t('sos.yourContacts')}</div>}
        {custom.map((h, i) => (
          <Line key={`c${i}`} label={h.label} phone={h.phone} />
        ))}
        {helplinesFor(country).map((h) => (
          <Line key={h.phone} label={t(h.labelKey)} phone={h.phone} />
        ))}
      </div>
      <a
        href={FIND_A_HELPLINE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-subtle underline-offset-4 hover:text-text hover:underline"
      >
        {t('sos.findHelpline')} <ExternalLink size={14} />
      </a>
    </Sheet>
  )
}
