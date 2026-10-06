/**
 * Meter — a single ratio against a limit.
 *
 * The fill carries severity (accent → warning → danger) and the unfilled
 * track is a lighter step of the *same* ramp rather than a neutral gray, so
 * the state reads across the whole bar. The numeric value is always printed
 * beside it, so the meter is never the only channel.
 */

const RAMPS = {
  brand: { fill: 'bg-brand-gradient', track: 'bg-brand-700/35', text: 'text-brand-200' },
  mint: { fill: 'bg-mint-400', track: 'bg-mint-600/30', text: 'text-mint-300' },
  amber: { fill: 'bg-amber-400', track: 'bg-amber-500/25', text: 'text-amber-300' },
  rose: { fill: 'bg-rose-400', track: 'bg-rose-500/25', text: 'text-rose-300' },
}

export default function Meter({
  value = 0,
  max = 100,
  tone,
  label,
  hint,
  showValue = true,
  valueText,
  className = '',
}) {
  const percent = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0

  // Default to severity by completion: low reads as a warning, not just "less".
  const resolvedTone = tone ?? (percent >= 80 ? 'mint' : percent >= 40 ? 'brand' : 'amber')
  const ramp = RAMPS[resolvedTone] ?? RAMPS.brand

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          {label && <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>}
          {showValue && (
            <span className={`text-sm font-semibold ${ramp.text}`}>{valueText ?? `${percent}%`}</span>
          )}
        </div>
      )}

      <div
        className={`h-2 w-full overflow-hidden rounded-full ${ramp.track}`}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${ramp.fill}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
