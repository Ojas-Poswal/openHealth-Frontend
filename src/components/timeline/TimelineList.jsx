import { CalendarRange } from 'lucide-react'
import EmptyState from '../ui/EmptyState.jsx'
import { formatMonthYear } from '../../utils/format.js'

/**
 * The openHealth timeline: medical cases newest-first, grouped under the
 * month they were diagnosed in, hung off a single vertical rail so the
 * patient's history reads as one continuous story.
 *
 * @param {{ medicalCase: object }[]} timeline
 * @param {(entry: object, index: number) => JSX.Element} [renderCard]
 */
export default function TimelineList({ timeline = [], renderCard, emptyTitle, emptyMessage, emptyAction }) {
  if (!timeline.length) {
    return (
      <EmptyState
        icon={CalendarRange}
        title={emptyTitle ?? 'Your timeline starts here'}
        message={
          emptyMessage ??
          'Every diagnosis becomes a card on this timeline, holding its reports, prescriptions and doctor notes together.'
        }
        action={emptyAction}
      />
    )
  }

  const groups = groupByMonth(timeline)

  return (
    <div className="relative">
      {groups.map((group, groupIndex) => (
        <section key={group.key} className={groupIndex > 0 ? 'mt-10' : ''}>
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-600/70 bg-ink-800/70 px-3 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur">
              {group.label}
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-ink-600/80 to-transparent" />
            <span className="text-xs text-slate-500">
              {group.entries.length} case{group.entries.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="relative space-y-5 border-l border-ink-600/60 pl-5 sm:pl-7">
            {group.entries.map((entry, index) => (
              <div key={entry.medicalCase?._id ?? index} className="relative animate-fade-in">
                <span
                  className={`absolute -left-[1.6rem] top-7 h-3 w-3 rounded-full ring-4 ring-ink-950 sm:-left-[2.1rem] ${
                    entry.medicalCase?.status === 'resolved'
                      ? 'bg-mint-400'
                      : 'bg-brand-gradient shadow-[0_0_12px_rgba(34,198,238,0.6)]'
                  }`}
                  aria-hidden="true"
                />
                {renderCard ? renderCard(entry, index) : null}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function groupByMonth(timeline) {
  const groups = []
  const index = new Map()

  timeline.forEach((entry) => {
    const date = new Date(entry.medicalCase?.diagnosedAt || entry.medicalCase?.createdAt || 0)
    const key = Number.isNaN(date.getTime())
      ? 'undated'
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!index.has(key)) {
      const group = { key, label: formatMonthYear(date), entries: [] }
      index.set(key, group)
      groups.push(group)
    }
    index.get(key).entries.push(entry)
  })

  return groups
}
