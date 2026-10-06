import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Field from '../ui/Field.jsx'
import Select from '../ui/Select.jsx'
import Alert from '../ui/Alert.jsx'
import { CASE_STATUS_OPTIONS } from '../../utils/constants.js'

/** Moves a case between `active` and `resolved`. */
export default function CaseStatusModal({ open, onClose, medicalCase, onSubmit, loading = false, error = null }) {
  const [status, setStatus] = useState('active')

  useEffect(() => {
    if (open && medicalCase) setStatus(medicalCase.status ?? 'active')
  }, [open, medicalCase])

  if (!medicalCase) return null

  const changed = status !== medicalCase.status

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!changed) return
    if (await onSubmit(medicalCase._id, status)) onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Update case status"
      description={medicalCase.diagnosis}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="status-form" loading={loading} disabled={!changed}>
            Save status
          </Button>
        </>
      }
    >
      <form id="status-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error.message ?? String(error)}</Alert>}

        <Field
          label="Status"
          htmlFor="status"
          hint="Resolved cases stay on your timeline and keep all their records."
        >
          <Select id="status" options={CASE_STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
        </Field>

        {!changed && (
          <Alert tone="info">This case is already marked as {medicalCase.status}.</Alert>
        )}
      </form>
    </Modal>
  )
}
