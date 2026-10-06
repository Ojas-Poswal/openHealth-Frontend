import { Link } from 'react-router-dom'
import { compactNumber } from '../../utils/format.js'

/**
 * Stat tile — label, value, optional context line.
 *
 * Follows the figure contract: the value is set in the UI sans at semibold
 * with proportional figures (never tabular, which looks loose at display
 * sizes), and colour lives only on the icon chip. The label and value wear
 * text tokens so a light hue never has to carry meaning as text.
 */

const TONES = {
  brand: 'bg-brand-400/12 text-brand-200 ring-1 ring-inset ring-brand-400/25',
  mint: 'bg-mint-400/12 text-mint-300 ring-1 ring-inset ring-mint-400/25',
  royal: 'bg-royal-500/12 text-royal-400 ring-1 ring-inset ring-royal-500/25',
  amber: 'bg-amber-400/12 text-amber-300 ring-1 ring-inset ring-amber-400/25',
  slate: 'bg-white/6 text-slate-300 ring-1 ring-inset ring-white/10',
}

export default function StatTile({
  label,
  value,
  icon: Icon,
  tone = 'brand',
  hint,
  to,
  raw = false,
  className = '',
}) {
  const display = raw ? (value ?? '—') : compactNumber(value ?? 0)

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        {Icon && (
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${TONES[tone] ?? TONES.brand}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-2.5 font-sans text-3xl font-semibold leading-none text-white">{display}</p>
      {hint && <p className="mt-2 text-xs leading-relaxed text-slate-500">{hint}</p>}
    </>
  )

  const classes = `surface block p-5 ${to ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400/40' : ''} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes}>
        {inner}
      </Link>
    )
  }

  return <div className={classes}>{inner}</div>
}
