export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="pt-4 pb-5">
      <h1 className="font-serif text-[32px] leading-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-muted">{subtitle}</p>}
    </div>
  )
}
