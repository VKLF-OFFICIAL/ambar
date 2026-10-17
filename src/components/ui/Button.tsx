import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'quiet'
type Size = 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent hover:brightness-105 active:brightness-95 shadow-[0_8px_24px_-12px_var(--accent)]',
  secondary: 'bg-surface-2 text-text hover:brightness-110',
  ghost: 'bg-transparent text-text border border-border hover:bg-surface-2',
  quiet: 'bg-transparent text-muted hover:text-text underline-offset-4 hover:underline',
}

const sizes: Record<Size, string> = {
  md: 'px-4 py-3 text-[15px] rounded-2xl',
  lg: 'px-5 py-4 text-base rounded-[18px] font-semibold',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 font-medium transition disabled:opacity-40 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}
