import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  FileText,
  Pill,
  Stethoscope,
  PenLine,
} from 'lucide-react'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import CaseStatusBadge from './CaseStatusBadge.jsx'
import { formatDate, truncate } from '../../utils/format.js'

/**
 * One medical case as it appears on the timeline: the diagnosis is the
 * headline, everything recorded under that case is summarised as counts so
 * the card stays scannable and the detail page carries the contents.
 */
export default function MedicalCaseCard({ entry, to, onChangeStatus, canManage = false }) {
  const { medicalCase, reports = [], doctorNotes = [], prescriptions = [] } = entry ?? {}
  if (!medicalCase) return null

  const medicineCount = prescriptions.reduce(
    (total, prescription) => total + (prescription.medicines?.length ?? 0),
    0,
  )

  const stats = [
    { icon: FileText, label: `${reports.length} report${reports.length === 1 ? '' : 's'}`, show: reports.length > 0 },
    {
      icon: Pill,
      label: `${medicineCount} medicine${medicineCount === 1 ? '' : 's'}`,
      show: medicineCount > 0,
    },
    {
      icon: PenLine,
      label: `${doctorNotes.length} note${doctorNotes.length === 1 ? '' : 's'}`,
      show: doctorNotes.length > 0,
    },
  ].filter((stat) => stat.show)

  return (
    <article className="surface group relative overflow-hidden p-5 transition-all duration-200 hover:border-brand-400/40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-brand-400/50 via-royal-500/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <CaseStatusBadge status={medicalCase.status} size="sm" />
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(medicalCase.diagnosedAt || medicalCase.createdAt)}
            </span>
            {medicalCase.status === 'resolved' && medicalCase.resolvedAt && (
              <span className="text-xs text-slate-500">
                · resolved {formatDate(medicalCase.resolvedAt)}
              </span>
            )}
          </div>

          <h3 className="mt-2.5 font-display text-lg font-bold leading-snug text-white">
            {medicalCase.diagnosis}
          </h3>

          {medicalCase.verdict && (
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
              {truncate(medicalCase.verdict, 180)}
            </p>
          )}
        </div>
      </div>

      {medicalCase.tags?.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {medicalCase.tags.map((tag) => (
            <Badge key={tag} tone="neutral" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-600/50 pt-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {stats.length > 0 ? (
            stats.map((stat) => (
              <span key={stat.label} className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <stat.icon className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                {stat.label}
              </span>
            ))
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
              No records attached yet
            </span>
          )}
          {medicalCase.doctors?.length > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Stethoscope className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              {medicalCase.doctors.length} doctor{medicalCase.doctors.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canManage && onChangeStatus && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChangeStatus(medicalCase)}
              title="Change case status"
            >
              Update status
            </Button>
          )}
          {to && (
            <Link to={to}>
              <Button variant="secondary" size="sm" iconRight={ArrowUpRight}>
                Open case
              </Button>
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
