import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

export const inputClass =
  'w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-[15px] text-text placeholder:text-subtle focus:border-accent focus:outline-none'

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-muted">{label}</span>
      {children}
      {hint && <span className="block text-xs text-subtle">{hint}</span>}
    </label>
  )
}

export function TextInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputClass} ${className}`} {...props} />
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${inputClass} appearance-none ${className}`} {...props} />
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClass} min-h-32 resize-y leading-relaxed ${className}`} {...props} />
}
