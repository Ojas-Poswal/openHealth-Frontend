/**
 * Tabs — controlled segmented control used for in-page sections and for
 * filtering lists. Rendered as a real tablist for keyboard users.
 */
export default function Tabs({ tabs, value, onChange, className = '', size = 'md', grow = false }) {
  const sizing = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'

  return (
    <div
      role="tablist"
      className={`no-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-ink-600/60 bg-ink-900/60 p-1 ${className}`}
    >
      {tabs.map((tab) => {
        const active = tab.value === value
        const Icon = tab.icon
        return (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`${grow ? 'flex-1' : ''} ${sizing} inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all ${
              active
                ? 'bg-brand-soft text-white shadow-sm ring-1 ring-inset ring-brand-400/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
            {tab.label}
            {typeof tab.count === 'number' && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  active ? 'bg-brand-400/20 text-brand-100' : 'bg-white/8 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
