import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-[18px] bg-surface p-4 ${className}`} {...props} />
}

export function Label({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`text-[11px] font-medium uppercase tracking-[0.12em] text-subtle ${className}`} {...props} />
}
