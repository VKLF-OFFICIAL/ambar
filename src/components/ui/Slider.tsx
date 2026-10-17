interface SliderProps {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  label: string
  valueText?: string
}

export function Slider({ value, min, max, onChange, label, valueText }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={1}
      value={value}
      aria-label={label}
      aria-valuetext={valueText}
      onChange={(e) => onChange(Number(e.target.value))}
      className="ambar-slider w-full"
      style={{ background: `linear-gradient(90deg, var(--accent) ${pct}%, var(--surface-2) ${pct}%)` }}
    />
  )
}
