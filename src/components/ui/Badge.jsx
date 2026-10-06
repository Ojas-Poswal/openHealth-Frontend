const TONES = {
  neutral: 'bg-white/6 text-slate-300 ring-1 ring-inset ring-white/10',
  brand: 'bg-brand-400/12 text-brand-200 ring-1 ring-inset ring-brand-400/30',
  mint: 'bg-mint-400/12 text-mint-300 ring-1 ring-inset ring-mint-400/30',
  amber: 'bg-amber-400/12 text-amber-300 ring-1 ring-inset ring-amber-400/30',
  rose: 'bg-rose-500/12 text-rose-300 ring-1 ring-inset ring-rose-500/30',
  royal: 'bg-royal-500/12 text-royal-400 ring-1 ring-inset ring-royal-500/30',
}

export default function Badge({
  children,
  tone = 'neutral',
  size = 'md',
  dot = false,
  dotClass,
  icon: Icon,
  className = '',
}) {
  const sizing = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizing} ${
        TONES[tone] ?? TONES.neutral
      } ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotClass ?? 'bg-current'}`} />}
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      {children}
    </span>
  )
}
