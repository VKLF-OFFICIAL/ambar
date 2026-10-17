import { Check } from 'lucide-react'
import { useState } from 'react'
import { useT } from '../../hooks/useT'
import type { MessageKey } from '../../i18n'

const SENSES: { key: MessageKey; n: number }[] = [
  { key: 'sos.see', n: 5 },
  { key: 'sos.touch', n: 4 },
  { key: 'sos.hear', n: 3 },
  { key: 'sos.smell', n: 2 },
  { key: 'sos.taste', n: 1 },
]

export function Grounding() {
  const { t } = useT()
  const [sense, setSense] = useState(0)
  const [count, setCount] = useState(0)
  const current = SENSES[sense]

  const tap = () => {
    if (!current) return
    if (count + 1 >= current.n) {
      setSense((s) => s + 1)
      setCount(0)
    } else {
      setCount((c) => c + 1)
    }
  }

  return (
    <div className="text-center">
      <h2 className="font-serif text-2xl">{t('sos.groundingTitle')}</h2>
      {current ? (
        <>
          <p className="mt-8 font-serif text-[26px] leading-snug">{t(current.key)}</p>
          <p className="mt-2 text-sm text-subtle">{t('sos.groundingHint')}</p>
          <div className="mt-8 flex justify-center gap-3">
            {Array.from({ length: current.n }, (_, i) => (
              <button
                key={`${sense}-${i}`}
                type="button"
                aria-label={`${i + 1} / ${current.n}`}
                aria-pressed={i < count}
                onClick={tap}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                  i < count ? 'bg-accent text-on-accent' : 'bg-surface-2 ring-1 ring-border hover:ring-accent'
                }`}
              >
                {i < count && <Check size={18} />}
              </button>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-1.5" aria-hidden>
            {SENSES.map((s, i) => (
              <span key={s.key} className={`h-1.5 rounded-full transition-all ${i === sense ? 'w-5 bg-accent' : i < sense ? 'w-1.5 bg-accent/60' : 'w-1.5 bg-surface-2'}`} />
            ))}
          </div>
        </>
      ) : (
        <p className="mt-10 font-serif text-2xl text-accent">{t('sos.groundingDone')}</p>
      )}
    </div>
  )
}
