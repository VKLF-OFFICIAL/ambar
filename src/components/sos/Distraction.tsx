import { useEffect, useState } from 'react'
import { useT } from '../../hooks/useT'
import { CATEGORY_KEYS, DISTRACTIONS } from '../../data/distractions'
import { Button } from '../ui/Button'

function Countdown() {
  const { t } = useT()
  const [n, setN] = useState(100)
  return (
    <div className="mt-6 text-center">
      <div className="text-sm text-subtle">{t('sos.countdownNow')}</div>
      <button
        type="button"
        onClick={() => setN((v) => (v - 7 < 0 ? 100 : v - 7))}
        className="tabular mt-2 font-serif text-6xl text-accent"
        aria-label={`${n} → ${n - 7 < 0 ? 100 : n - 7}`}
      >
        {n}
      </button>
      <div className="mt-2 text-xs text-subtle">−7</div>
    </div>
  )
}

function Category() {
  const { t } = useT()
  const [i] = useState(() => Math.floor(Math.random() * CATEGORY_KEYS.length))
  const key = CATEGORY_KEYS[i] ?? CATEGORY_KEYS[0]
  return <div className="mt-6 text-center font-serif text-4xl text-accent">{key ? t(key) : ''}</div>
}

const PADS = 4

function Memory() {
  const { t } = useT()
  const [seq, setSeq] = useState<number[]>(() => [Math.floor(Math.random() * PADS), Math.floor(Math.random() * PADS)])
  const [showing, setShowing] = useState(true)
  const [lit, setLit] = useState<number | null>(null)
  const [input, setInput] = useState<number[]>([])
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!showing) return
    let i = 0
    const id = setInterval(() => {
      if (i >= seq.length * 2) {
        clearInterval(id)
        setLit(null)
        setShowing(false)
        return
      }
      setLit(i % 2 === 0 ? (seq[i / 2] ?? null) : null)
      i++
    }, 450)
    return () => clearInterval(id)
  }, [showing, seq])

  const press = (p: number) => {
    if (showing) return
    const next = [...input, p]
    if (seq[next.length - 1] !== p) {
      setMsg(t('sos.memoryRetry'))
      setInput([])
      setShowing(true)
      return
    }
    if (next.length === seq.length) {
      setMsg(t('sos.memoryWin'))
      setInput([])
      setSeq((s) => [...s, Math.floor(Math.random() * PADS)])
      setShowing(true)
    } else {
      setInput(next)
    }
  }

  return (
    <div className="mt-6 text-center">
      <div className="text-sm text-subtle" aria-live="polite">{showing ? t('sos.memoryShow') : msg || t('sos.memoryYourTurn')}</div>
      <div className="mx-auto mt-4 grid w-48 grid-cols-2 gap-3">
        {Array.from({ length: PADS }, (_, p) => (
          <button
            key={p}
            type="button"
            aria-label={`${p + 1}`}
            onClick={() => press(p)}
            className={`h-20 rounded-full transition ${lit === p ? 'bg-accent shadow-[0_0_30px_var(--accent)]' : 'bg-surface-2 hover:ring-1 hover:ring-accent'}`}
          />
        ))}
      </div>
    </div>
  )
}

export function Distraction() {
  const { t } = useT()
  const [i, setI] = useState(() => Math.floor(Math.random() * DISTRACTIONS.length))
  const d = DISTRACTIONS[i % DISTRACTIONS.length] ?? DISTRACTIONS[0]
  if (!d) return null

  return (
    <div className="text-center">
      <h2 className="font-serif text-2xl">{t('sos.distractionTitle')}</h2>
      <div className="mt-8 rounded-[22px] bg-surface p-5">
        <div className="text-lg font-medium">{t(d.titleKey)}</div>
        <p className="mt-2 text-[15px] text-muted">{t(d.bodyKey)}</p>
        {d.id === 'countdown7' && <Countdown />}
        {d.id === 'category5' && <Category />}
        {d.id === 'memory' && <Memory />}
      </div>
      <Button variant="ghost" className="mt-4" onClick={() => setI((v) => v + 1)}>
        {t('sos.anotherDistraction')}
      </Button>
    </div>
  )
}
