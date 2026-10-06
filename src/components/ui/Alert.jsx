import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react'

const TONES = {
  error: {
    wrap: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
    Icon: AlertCircle,
  },
  success: {
    wrap: 'border-mint-400/30 bg-mint-400/10 text-mint-200',
    Icon: CheckCircle2,
  },
  warning: {
    wrap: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    Icon: TriangleAlert,
  },
  info: {
    wrap: 'border-brand-400/30 bg-brand-400/10 text-brand-100',
    Icon: Info,
  },
}

/** Inline banner for API errors and contextual notes. */
export default function Alert({ tone = 'info', title, children, action, className = '' }) {
  const { wrap, Icon } = TONES[tone] ?? TONES.info

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm ${wrap} ${className}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-0.5 opacity-90' : ''}>{children}</div>}
      </div>
      {action}
    </div>
  )
}
