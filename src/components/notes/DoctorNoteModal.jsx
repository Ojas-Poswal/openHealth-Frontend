import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Field from '../ui/Field.jsx'
import Textarea from '../ui/Textarea.jsx'
import Alert from '../ui/Alert.jsx'
import { reportIcon } from '../reports/reportIcon.js'

/**
 * Adds a doctor's note to a report.
 * POST /doctor-notes/create takes { reportId, note } — the author comes from
 * the bearer token, never from the client.
 */
export default function DoctorNoteModal({ open, onClose, onSubmit, report, loading = false, error = null }) {
  const [note, setNote] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (open) {
      setNote('')
      setTouched(false)
    }
  }, [open, report])

  if (!report) return null

  const Icon = reportIcon(report.reportType)
  const valid = note.trim().length > 0

  const handleSubmit = async (event) => {
    event.preventDefault()
    setTouched(true)
    if (!valid) return
    if (await onSubmit(report._id, note.trim())) onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a doctor's note"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="note-form" loading={loading} disabled={!valid && touched}>
            Save note
          </Button>
        </>
      }
    >
      <form id="note-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error.message ?? String(error)}</Alert>}

        <div className="flex items-center gap-3 rounded-xl border border-ink-600/60 bg-ink-900/50 p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-400/12 text-brand-200 ring-1 ring-inset ring-brand-400/25">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{report.reportName}</p>
            <p className="text-xs text-slate-500">{report.reportType}</p>
          </div>
        </div>

        <Field
          label="Note"
          htmlFor="note"
          required
          error={touched && !valid ? 'Write something before saving.' : null}
          hint="This is attached to the report above and is visible to the patient."
        >
          <Textarea
            id="note"
            rows={5}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g. Haemoglobin is at the lower end of normal — recheck in 4 weeks."
            error={touched && !valid}
            autoFocus
          />
        </Field>
      </form>
    </Modal>
  )
}
