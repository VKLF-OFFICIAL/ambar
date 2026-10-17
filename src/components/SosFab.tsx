import { Wind } from 'lucide-react'
import { useT } from '../hooks/useT'
import { useUiStore } from '../store/useUiStore'

/** SOS siempre a un toque en las pestañas que no son Inicio. */
export function SosFab() {
  const { t } = useT()
  const openSos = useUiStore((s) => s.openSos)
  return (
    <button
      type="button"
      onClick={openSos}
      aria-label={t('ui.sos')}
      className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-[max(1rem,calc(50vw-224px))] z-30 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-on-accent shadow-[0_10px_30px_-10px_var(--accent)] transition hover:brightness-105"
    >
      <Wind size={18} />
      {t('ui.sosShort')}
    </button>
  )
}
