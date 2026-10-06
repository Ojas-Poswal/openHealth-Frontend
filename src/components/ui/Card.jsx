export default function Card({
  as: Tag = 'div',
  className = '',
  hoverable = false,
  padded = true,
  children,
  ...rest
}) {
  return (
    <Tag
      className={`surface ${padded ? 'p-5' : ''} ${
        hoverable
          ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400/40 hover:shadow-glow'
          : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export function CardHeader({ title, subtitle, icon: Icon, actions, className = '', children }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 ${className}`}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft ring-1 ring-inset ring-brand-400/20">
            <Icon className="h-5 w-5 text-brand-300" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          {title && <h3 className="font-display text-base font-bold text-white">{title}</h3>}
          {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
          {children}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function CardBody({ className = '', children }) {
  return <div className={`mt-4 ${className}`}>{children}</div>
}

export function CardFooter({ className = '', children }) {
  return (
    <div className={`mt-4 flex flex-wrap items-center gap-2 border-t border-ink-600/60 pt-4 ${className}`}>
      {children}
    </div>
  )
}
