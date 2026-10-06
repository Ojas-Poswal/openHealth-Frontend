import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Field from '../ui/Field.jsx'
import Input from '../ui/Input.jsx'
import Select from '../ui/Select.jsx'
import Alert from '../ui/Alert.jsx'
import FileDropzone from '../ui/FileDropzone.jsx'
import { REPORT_TYPE_OPTIONS } from '../../utils/constants.js'

/**
 * Edits a report — its labels and, optionally, the file itself.
 * PATCH /reports/:id accepts multipart, so picking a file replaces the stored
 * one; leaving it empty keeps what is already there.
 */
export default function ReportEditModal({ open, onClose, report, onSubmit, loading = false, error = null }) {
  const [reportName, setReportName] = useState('')
  const [reportType, setReportType] = useState('')
  const [file, setFile] = useState(null)

  useEffect(() => {
    if (open && report) {
      setReportName(report.reportName ?? '')
      setReportType(report.reportType ?? '')
      setFile(null)
    }
  }, [open, report])

  if (!report) return null

  const renamed = reportName.trim() !== report.reportName
  const retyped = reportType !== report.reportType
  const dirty = renamed || retyped || Boolean(file)
  const valid = reportName.trim() && reportType

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!valid || !dirty) return

    const payload = {}
    if (renamed) payload.reportName = reportName.trim()
    if (retyped) payload.reportType = reportType
    if (file) payload.file = file

    if (await onSubmit(report._id, payload)) onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit report"
      description="Change how this report is labelled, or swap the file for a clearer one."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="report-edit-form" loading={loading} disabled={!dirty || !valid}>
            Save changes
          </Button>
        </>
      }
    >
      <form id="report-edit-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error.message ?? String(error)}</Alert>}

        <Field label="Report name" htmlFor="edit-reportName" required>
          <Input
            id="edit-reportName"
            value={reportName}
            onChange={(event) => setReportName(event.target.value)}
            autoFocus
          />
        </Field>

        <Field label="Report type" htmlFor="edit-reportType" required>
          <Select
            id="edit-reportType"
            options={REPORT_TYPE_OPTIONS}
            value={reportType}
            onChange={(event) => setReportType(event.target.value)}
          />
        </Field>

        <FileDropzone
          id="edit-report-file"
          label="Replace the file"
          hint="Leave this empty to keep the current file."
          value={file}
          onChange={setFile}
          disabled={loading}
        />
      </form>
    </Modal>
  )
}
