import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Field from '../ui/Field.jsx'
import Input from '../ui/Input.jsx'
import Select from '../ui/Select.jsx'
import Alert from '../ui/Alert.jsx'
import FileDropzone from '../ui/FileDropzone.jsx'
import { REPORT_TYPE_OPTIONS } from '../../utils/constants.js'

/**
 * Uploads a report into a medical case.
 *
 * Mirrors the required multipart fields of POST /reports/create exactly:
 * medicalCaseId, reportName, reportType and the `file` part.
 *
 * `medicalCase` pins the target case (used from a case page); pass `cases`
 * instead to let the patient choose one (used from the reports screen).
 */
export default function ReportUploadModal({
  open,
  onClose,
  onSubmit,
  medicalCase = null,
  cases = null,
  loading = false,
  error = null,
}) {
  const [caseId, setCaseId] = useState('')
  const [reportName, setReportName] = useState('')
  const [reportType, setReportType] = useState('')
  const [file, setFile] = useState(null)
  const [touched, setTouched] = useState(false)
  const [progress, setProgress] = useState(0)

  const needsCasePicker = !medicalCase && Array.isArray(cases)
  const targetCase = medicalCase ?? (cases ?? []).find((item) => item._id === caseId) ?? null

  const reset = () => {
    setCaseId('')
    setReportName('')
    setReportType('')
    setFile(null)
    setTouched(false)
    setProgress(0)
  }

  const close = () => {
    if (loading) return
    reset()
    onClose()
  }

  const errors = {
    caseId: needsCasePicker && !caseId ? 'Choose which case this report belongs to.' : null,
    reportName: !reportName.trim() ? 'Give this report a name.' : null,
    reportType: !reportType ? 'Choose a report type.' : null,
    file: !file ? 'Attach the file for this report.' : null,
  }
  const valid = Object.values(errors).every((value) => value === null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setTouched(true)
    if (!valid) return

    const created = await onSubmit({
      medicalCaseId: targetCase._id,
      reportName: reportName.trim(),
      reportType,
      file,
      onUploadProgress: setProgress,
    })
    if (created) {
      reset()
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Upload a report"
      description={targetCase ? `Filed under “${targetCase.diagnosis}”.` : 'Pick the case this report belongs to.'}
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="report-upload-form" loading={loading} disabled={!valid && touched}>
            {loading ? `Uploading ${progress}%` : 'Upload report'}
          </Button>
        </>
      }
    >
      <form id="report-upload-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error.message ?? String(error)}</Alert>}

        {needsCasePicker && (
          <Field
            label="Medical case"
            htmlFor="medicalCaseId"
            required
            error={touched ? errors.caseId : null}
            hint="Reports always live inside a case, so its diagnosis stays attached to the file."
          >
            <Select
              id="medicalCaseId"
              options={cases.map((item) => ({ value: item._id, label: item.diagnosis }))}
              placeholder="Select a case"
              value={caseId}
              onChange={(event) => setCaseId(event.target.value)}
              error={touched && errors.caseId}
            />
          </Field>
        )}

        <Field
          label="Report name"
          htmlFor="reportName"
          required
          error={touched ? errors.reportName : null}
        >
          <Input
            id="reportName"
            value={reportName}
            onChange={(event) => setReportName(event.target.value)}
            placeholder="e.g. Complete blood count — March 2026"
            autoFocus
            error={touched && errors.reportName}
          />
        </Field>

        <Field label="Report type" htmlFor="reportType" required error={touched ? errors.reportType : null}>
          <Select
            id="reportType"
            options={REPORT_TYPE_OPTIONS}
            placeholder="Select a type"
            value={reportType}
            onChange={(event) => setReportType(event.target.value)}
            error={touched && errors.reportType}
          />
        </Field>

        <div>
          <FileDropzone value={file} onChange={setFile} progress={progress} disabled={loading} />
          {touched && errors.file && <p className="mt-1.5 text-xs text-rose-300">{errors.file}</p>}
        </div>
      </form>
    </Modal>
  )
}
