import { FileText } from 'lucide-react'
import Button from '../ui/Button.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import ReportCard from './ReportCard.jsx'
import DoctorNoteList from '../notes/DoctorNoteList.jsx'

/**
 * Reports tab for a medical case. Doctor notes are nested under the report
 * they belong to, mirroring the backend's reportId → note relationship.
 */
export default function ReportList({
  reports = [],
  doctorNotes = [],
  canManage = false,
  canAddNote = false,
  onUpload,
  onEdit,
  onDelete,
  onAddNote,
}) {
  if (!reports.length) {
    return (
      <EmptyState
        icon={FileText}
        title="No reports attached"
        message={
          canManage
            ? 'Upload a blood test, scan or prescription and it will be stored against this case.'
            : 'This case has no reports attached yet.'
        }
        compact
        action={
          canManage && onUpload ? (
            <Button variant="primary" size="sm" onClick={onUpload}>
              Upload a report
            </Button>
          ) : null
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => {
        const notes = doctorNotes.filter((note) => sameId(note.reportId, report._id))
        return (
          <ReportCard
            key={report._id}
            report={report}
            notes={notes}
            canManage={canManage}
            onEdit={onEdit}
            onDelete={onDelete}
            noteSlot={
              <DoctorNoteList
                notes={notes}
                canAdd={canAddNote}
                onAdd={() => onAddNote?.(report)}
              />
            }
          />
        )
      })}
    </div>
  )
}

function sameId(a, b) {
  return String(a?._id ?? a ?? '') === String(b?._id ?? b ?? '')
}
