import { MessageSquarePlus, PenLine } from 'lucide-react'
import Button from '../ui/Button.jsx'
import { formatDateTime } from '../../utils/format.js'

/**
 * Doctor notes attached to a report.
 *
 * The timeline endpoints return `doctorId` as a bare ObjectId (not
 * populated), so we deliberately do not render an author name — inventing
 * one would be worse than omitting it.
 */
export default function DoctorNoteList({ notes = [], canAdd = false, onAdd }) {
  if (!notes.length && !canAdd) return null

  return (
    <div className="border-t border-ink-600/50 bg-ink-900/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
          Doctor notes{notes.length > 0 && ` (${notes.length})`}
        </p>
        {canAdd && onAdd && (
          <Button variant="ghost" size="xs" icon={MessageSquarePlus} onClick={onAdd}>
            Add note
          </Button>
        )}
      </div>

      {notes.length === 0 ? (
        <p className="text-xs text-slate-500">
          No notes on this report yet. A doctor can add one during a consented session.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {notes.map((note) => (
            <li
              key={note._id}
              className="rounded-lg border-l-2 border-brand-400/50 bg-ink-800/50 py-2.5 pl-3.5 pr-3"
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{note.note}</p>
              <p className="mt-1.5 text-[11px] text-slate-500">{formatDateTime(note.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
