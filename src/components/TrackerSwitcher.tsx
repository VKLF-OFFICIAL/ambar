import { ChevronDown, Plus } from 'lucide-react'
import { useState } from 'react'
import { useT } from '../hooks/useT'
import { selectActiveTracker, useAddictionStore } from '../store/useAddictionStore'
import { trackerLabel } from '../lib/labels'
import { kindInfo } from '../data/trackerKinds'
import { Sheet } from './ui/Sheet'

export function TrackerSwitcher({ onAdd }: { onAdd: () => void }) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const trackers = useAddictionStore((s) => s.trackers)
  const active = useAddictionStore(selectActiveTracker)
  const setActive = useAddictionStore((s) => s.setActiveTracker)
  if (!active) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${t('ui.switchTracker')}: ${trackerLabel(t, active)}`}
        className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-xs text-muted transition hover:text-text"
      >
        <span aria-hidden>{kindInfo(active.kind).icon}</span>
        {trackerLabel(t, active)}
        <ChevronDown size={14} />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={t('ui.switchTracker')} closeLabel={t('ui.close')}>
        <ul className="space-y-2">
          {trackers.map((tr) => (
            <li key={tr.id}>
              <button
                type="button"
                onClick={() => {
                  setActive(tr.id)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                  tr.id === active.id ? 'bg-accent/15 text-text ring-1 ring-accent/50' : 'bg-surface-2 text-muted hover:text-text'
                }`}
              >
                <span aria-hidden className="text-lg">{kindInfo(tr.kind).icon}</span>
                {trackerLabel(t, tr)}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onAdd()
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-3 text-left text-muted transition hover:text-text"
            >
              <Plus size={18} /> {t('ui.addTracker')}
            </button>
          </li>
        </ul>
      </Sheet>
    </>
  )
}
