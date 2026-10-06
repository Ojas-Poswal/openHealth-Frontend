import { useMemo, useState } from 'react'
import { ClipboardList, FileText, Info, PenLine, Pill } from 'lucide-react'
import Badge from '../ui/Badge.jsx'
import Tabs from '../ui/Tabs.jsx'
import ReportList from '../reports/ReportList.jsx'
import PrescriptionList from '../prescriptions/PrescriptionList.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import { formatDate, formatDateTime } from '../../utils/format.js'

/**
 * Everything recorded under one medical case.
 *
 * Used by the patient's case page, the doctor's consented view and the
 * family view — the `can*` props switch the write actions on and off so the
 * same component never offers an action the backend would refuse.
 */
export default function CaseDetailView({
  entry,
  canManageReports = false,
  canWritePrescription = false,
  canWriteNote = false,
  onUploadReport,
  onEditReport,
  onDeleteReport,
  onAddPrescription,
  onAddNote,
  defaultTab = 'overview',
}) {
  const [tab, setTab] = useState(defaultTab)

  const { medicalCase, reports = [], doctorNotes = [], prescriptions = [] } = entry ?? {}

  const noteCount = useMemo(
    () => doctorNotes.length + (medicalCase?.prescriptions?.length ? 0 : 0),
    [doctorNotes, medicalCase],
  )

  if (!medicalCase) return null

  const tabs = [
    { value: 'overview', label: 'Overview', icon: Info },
    { value: 'reports', label: 'Reports', icon: FileText, count: reports.length },
    { value: 'prescriptions', label: 'Prescriptions', icon: Pill, count: prescriptions.length },
    { value: 'notes', label: 'Doctor notes', icon: PenLine, count: noteCount },
  ]

  return (
    <div>
      <Tabs tabs={tabs} value={tab} onChange={setTab} className="mb-5" />

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailBlock
              label="Verdict"
              value={medicalCase.verdict}
              placeholder="No verdict recorded for this case yet."
            />
            <DetailBlock
              label="Final advice"
              value={medicalCase.finalAdvice}
              placeholder="No final advice recorded yet."
            />
          </div>

          <dl className="grid gap-x-6 gap-y-4 rounded-2xl border border-ink-600/60 bg-ink-800/40 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <Meta label="Diagnosis" value={medicalCase.diagnosis} />
            <Meta label="Diagnosed on" value={formatDate(medicalCase.diagnosedAt)} />
            <Meta
              label="Resolved on"
              value={medicalCase.status === 'resolved' ? formatDate(medicalCase.resolvedAt) : '—'}
            />
            <Meta label="Last updated" value={formatDateTime(medicalCase.updatedAt)} />
          </dl>

          {medicalCase.tags?.length > 0 && (
            <div className="rounded-2xl border border-ink-600/60 bg-ink-800/40 p-5">
              <p className="label-base">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {medicalCase.tags.map((tag) => (
                  <Badge key={tag} tone="brand" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* The case document carries legacy embedded arrays; surface them
              only when a record actually uses them. */}
          {medicalCase.reports?.length > 0 && (
            <div className="rounded-2xl border border-ink-600/60 bg-ink-800/40 p-5">
              <p className="label-base">Reports recorded on the case</p>
              <ul className="space-y-2">
                {medicalCase.reports.map((report, index) => (
                  <li key={index} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-200">{report.reportName}</span>
                    {report.reportUrl && (
                      <a
                        href={report.reportUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-brand-300 hover:text-brand-200"
                      >
                        Open file
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {tab === 'reports' && (
        <ReportList
          reports={reports}
          doctorNotes={doctorNotes}
          canManage={canManageReports}
          canAddNote={canWriteNote}
          onUpload={onUploadReport}
          onEdit={onEditReport}
          onDelete={onDeleteReport}
          onAddNote={onAddNote}
        />
      )}

      {tab === 'prescriptions' && (
        <PrescriptionList
          prescriptions={prescriptions}
          canAdd={canWritePrescription}
          onAdd={onAddPrescription}
        />
      )}

      {tab === 'notes' && (
        <NotesTab notes={doctorNotes} reports={reports} canAdd={canWriteNote} onAdd={onAddNote} />
      )}
    </div>
  )
}

function DetailBlock({ label, value, placeholder }) {
  return (
    <div className="rounded-2xl border border-ink-600/60 bg-ink-800/40 p-5">
      <p className="label-base">{label}</p>
      {value ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{value}</p>
      ) : (
        <p className="text-sm italic text-slate-500">{placeholder}</p>
      )}
    </div>
  )
}

function Meta({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-200">{value || '—'}</dd>
    </div>
  )
}

function NotesTab({ notes, reports, canAdd, onAdd }) {
  if (!notes.length) {
    return (
      <EmptyState
        icon={PenLine}
        title="No doctor notes"
        message={
          canAdd
            ? 'Open the Reports tab and add a note to any report in this case.'
            : 'Notes a doctor writes on this case will appear here.'
        }
        compact
        action={
          canAdd && reports.length > 0 ? (
            <span className="text-xs text-slate-500">Choose a report in the Reports tab to comment on it.</span>
          ) : null
        }
      />
    )
  }

  return (
    <ul className="space-y-3">
      {notes.map((note) => {
        const report = reports.find((item) => String(item._id) === String(note.reportId))
        return (
          <li key={note._id} className="surface-soft p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <ClipboardList className="h-4 w-4 text-brand-300" aria-hidden="true" />
                {report?.reportName ?? 'Report'}
              </p>
              <span className="text-xs text-slate-500">{formatDateTime(note.createdAt)}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{note.note}</p>
            {canAdd && onAdd && report && (
              <button
                type="button"
                onClick={() => onAdd(report)}
                className="mt-3 text-xs font-medium text-brand-300 hover:text-brand-200"
              >
                Add another note to this report
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
