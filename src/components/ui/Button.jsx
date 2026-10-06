import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:
    'bg-brand-gradient text-ink-950 font-semibold shadow-glow hover:brightness-110 active:brightness-95 disabled:shadow-none',
  secondary:
    'bg-ink-700/70 text-slate-100 ring-1 ring-inset ring-ink-600 hover:bg-ink-600/80 hover:ring-brand-400/40',
  outline:
    'bg-transparent text-slate-200 ring-1 ring-inset ring-ink-600 hover:bg-white/5 hover:ring-brand-400/50',
  ghost: 'bg-transparent text-slate-300 hover:bg-white/6 hover:text-white',
  danger:
    'bg-rose-500/15 text-rose-200 ring-1 ring-inset ring-rose-500/40 hover:bg-rose-500/25 hover:text-white',
  success:
    'bg-mint-400/15 text-mint-200 ring-1 ring-inset ring-mint-400/40 hover:bg-mint-400/25 hover:text-white',
  link: 'bg-transparent text-brand-300 underline-offset-4 hover:text-brand-200 hover:underline p-0',
}

const SIZES = {
  xs: 'h-7 gap-1.5 px-2.5 text-xs rounded-lg',
  sm: 'h-9 gap-2 px-3.5 text-sm rounded-xl',
  md: 'h-11 gap-2 px-5 text-sm rounded-xl',
  lg: 'h-12 gap-2.5 px-6 text-base rounded-xl',
}

const ICON_SIZES = { xs: 'h-3.5 w-3.5', sm: 'h-4 w-4', md: 'h-4 w-4', lg: 'h-5 w-5' }

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconRight: IconRight = null,
  fullWidth = false,
  className = '',
  ...rest
}) {
  const isLink = variant === 'link'
  const classes = [
    'inline-flex select-none items-center justify-center whitespace-nowrap font-medium',
    'transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50',
    'disabled:cursor-not-allowed disabled:opacity-50',
    isLink ? '' : SIZES[size],
    VARIANTS[variant],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {loading ? (
        <Loader2 className={`animate-spin ${ICON_SIZES[size]}`} aria-hidden="true" />
      ) : (
        Icon && <Icon className={ICON_SIZES[size]} aria-hidden="true" />
      )}
      {children}
      {!loading && IconRight && <IconRight className={ICON_SIZES[size]} aria-hidden="true" />}
    </button>
  )
}
