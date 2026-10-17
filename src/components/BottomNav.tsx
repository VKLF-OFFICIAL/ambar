import { House, NotebookPen, Heart, Sprout } from 'lucide-react'
import type { ComponentType } from 'react'
import { useT } from '../hooks/useT'
import { useUiStore, type Tab } from '../store/useUiStore'
import type { MessageKey } from '../i18n'

const ITEMS: { tab: Tab; key: MessageKey; Icon: ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { tab: 'home', key: 'ui.nav.home', Icon: House },
  { tab: 'journal', key: 'ui.nav.journal', Icon: NotebookPen },
  { tab: 'reasons', key: 'ui.nav.reasons', Icon: Heart },
  { tab: 'progress', key: 'ui.nav.progress', Icon: Sprout },
]

export function BottomNav() {
  const { t } = useT()
  const tab = useUiStore((s) => s.tab)
  const setTab = useUiStore((s) => s.setTab)
  return (
    <nav
      aria-label={t('ui.nav.main')}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
    >
      <ul className="mx-auto flex max-w-[480px] justify-around px-2">
        {ITEMS.map(({ tab: id, key, Icon }) => {
          const active = tab === id
          return (
            <li key={id}>
              <button
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => setTab(id)}
                className={`flex min-w-16 flex-col items-center gap-1 px-3 py-2.5 text-[11px] transition ${
                  active ? 'text-accent' : 'text-subtle hover:text-muted'
                }`}
              >
                <Icon size={21} strokeWidth={active ? 2.2 : 1.8} />
                <span>{t(key)}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
