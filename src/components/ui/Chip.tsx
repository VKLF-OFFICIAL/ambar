import type { ButtonHTMLAttributes } from 'react'

export function Chip({
  selected = false,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`rounded-full px-3.5 py-2 text-[13px] transition ${
        selected ? 'bg-accent text-on-accent' : 'bg-surface-2 text-muted hover:text-text'
      } ${className}`}
      {...props}
    />
  )
}
