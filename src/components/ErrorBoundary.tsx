import { Component, type ReactNode } from 'react'
import { Phone } from 'lucide-react'
import { t } from '../i18n'
import { useAddictionStore } from '../store/useAddictionStore'
import { helplinesFor } from '../data/helplines'
import { downloadBackup } from '../lib/download'

/**
 * Red de seguridad: si algo falla, la persona sigue teniendo los teléfonos de ayuda
 * y puede exportar sus datos. No depende de hooks ni de otros componentes de la app.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    const s = useAddictionStore.getState()
    const locale = s.settings?.locale === 'en' ? 'en' : 'es'
    const country = typeof s.settings?.country === 'string' ? s.settings.country : 'ES'
    const lines = helplinesFor(country)
    return (
      <div className="mx-auto min-h-dvh max-w-[480px] px-6 pt-16 pb-10">
        <h1 className="font-serif text-[28px]">{t(locale, 'crash.title')}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{t(locale, 'crash.body')}</p>
        <div className="mt-6 space-y-2">
          {lines.map((h) => (
            <a key={h.phone} href={`tel:${h.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3.5">
              <Phone size={17} className="text-accent" />
              <span>
                <span className="block text-sm text-muted">{t(locale, h.labelKey)}</span>
                <span className="block text-lg">{h.phone}</span>
              </span>
            </a>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-2">
          <button
            type="button"
            className="rounded-2xl bg-surface-2 px-4 py-3"
            onClick={() => {
              try {
                downloadBackup(s.exportData())
              } catch {
                // El salvavidas nunca debe romperse por un fallo al exportar.
              }
            }}
          >
            {t(locale, 'crash.export')}
          </button>
          <button type="button" className="rounded-2xl bg-accent px-4 py-3 font-medium text-on-accent" onClick={() => location.reload()}>
            {t(locale, 'crash.reload')}
          </button>
        </div>
      </div>
    )
  }
}
