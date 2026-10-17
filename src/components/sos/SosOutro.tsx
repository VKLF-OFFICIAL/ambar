import { useState } from 'react'
import { useT } from '../../hooks/useT'
import { Slider } from '../ui/Slider'
import { Button } from '../ui/Button'

interface Props {
  elapsedSec: number
  locked: boolean
  onSave: (intensity: number) => void
  onFinish: () => void
  onRelapse: () => void
}

export function SosOutro({ elapsedSec, locked, onSave, onFinish, onRelapse }: Props) {
  const { t } = useT()
  const [value, setValue] = useState(5)
  const [saved, setSaved] = useState(false)
  const minutes = Math.round(elapsedSec / 60)

  if (saved) {
    return (
      <div className="pt-6 text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-accent/20 ring-1 ring-accent/50" />
        <p className="font-serif text-2xl leading-snug">{minutes >= 1 ? t('sos.surfed', { n: minutes }) : t('sos.surfedShort')}</p>
        {minutes >= 1 && <p className="mt-3 text-muted">{t('sos.surfedShort')}</p>}
        <Button size="lg" className="mt-10 w-full" onClick={onFinish}>
          {t('sos.finish')}
        </Button>
      </div>
    )
  }

  return (
    <div className="pt-4">
      <h2 className="text-center font-serif text-2xl">{t('sos.outroTitle')}</h2>
      <div className="tabular mt-8 text-center font-serif text-6xl text-accent">{value}</div>
      <div className="mt-6">
        <Slider value={value} min={1} max={10} onChange={setValue} label={t('sos.intensityLabel')} valueText={`${value} / 10`} />
        <div className="mt-2 flex justify-between text-xs text-subtle">
          <span>1</span>
          <span>10</span>
        </div>
      </div>
      <Button
        size="lg"
        className="mt-10 w-full"
        onClick={() => {
          onSave(value)
          setSaved(true)
        }}
      >
        {t('ui.save')}
      </Button>
      {!locked && (
        <Button variant="quiet" className="mt-2 w-full" onClick={onRelapse}>
          {t('sos.relapsed')}
        </Button>
      )}
    </div>
  )
}
