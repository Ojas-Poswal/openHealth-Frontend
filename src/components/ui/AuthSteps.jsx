/**
 * The numbered progress list shared by the multi-step auth screens
 * (registration and password recovery), so both tell the same story.
 */
export default function AuthSteps({ steps, current }) {
  return (
    <ol className="mb-6 space-y-2">
      {steps.map((label, index) => (
        <li key={label} className="flex items-center gap-3">
          <span
            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
              index < current
                ? 'bg-mint-400/15 text-mint-300'
                : index === current
                  ? 'bg-brand-gradient text-ink-950'
                  : 'bg-white/6 text-slate-500'
            }`}
          >
            {index < current ? '✓' : index + 1}
          </span>
          <span className={`text-sm ${index === current ? 'font-semibold text-white' : 'text-slate-500'}`}>
            {label}
          </span>
        </li>
      ))}
    </ol>
  )
}
