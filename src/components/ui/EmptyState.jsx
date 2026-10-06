/**
 * Empty state — shown when a request succeeded but there is genuinely
 * nothing to display yet. Always offers the action that would fill it.
 */
export default function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  secondaryAction,
  className = '',
  compact = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-600/80 bg-ink-800/30 text-center ${
        compact ? 'px-6 py-10' : 'px-6 py-16'
      } ${className}`}
    >
      {Icon && (
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft ring-1 ring-inset ring-brand-400/20">
          <Icon className="h-6 w-6 text-brand-300" aria-hidden="true" />
        </span>
      )}
      <h3 className="font-display text-base font-bold text-white">{title}</h3>
      {message && <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-400">{message}</p>}
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}
