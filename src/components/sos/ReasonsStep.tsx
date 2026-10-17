import { Heart } from 'lucide-react'
import { useT } from '../../hooks/useT'
import { selectActiveTracker, useAddictionStore } from '../../store/useAddictionStore'
import type { MessageKey } from '../../i18n'

const GENERIC: MessageKey[] = ['sos.genericReason1', 'sos.genericReason2', 'sos.genericReason3']

export function ReasonsStep({ locked }: { locked: boolean }) {
  const { t } = useT()
  const tracker = useAddictionStore(selectActiveTracker)
  const personal = locked ? [] : (tracker?.reasons ?? []).map((r) => `${r.emoji ? `${r.emoji} ` : ''}${r.text}`)
  const items = personal.length > 0 ? personal : GENERIC.map((k) => t(k))

  return (
    <div>
      <h2 className="text-center font-serif text-2xl">{t('sos.reasonsTitle')}</h2>
      <ul className="mt-8 space-y-3">
        {items.map((text, i) => (
          <li key={i} className="flex items-start gap-3 rounded-[18px] bg-surface p-4 text-[16px] leading-snug">
            <Heart size={18} className="mt-0.5 shrink-0 text-accent" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
