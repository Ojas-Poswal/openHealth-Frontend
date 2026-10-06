import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Alert from '../ui/Alert.jsx'
import FileDropzone from '../ui/FileDropzone.jsx'

/**
 * Uploads a death certificate for a family member.
 *
 * POST /death-certificate/upload takes `patientId` plus the `file` part and
 * allows exactly one certificate per patient. Uploading does not unlock
 * anything on its own — a family admin has to approve it afterwards.
 */
export default function DeathCertificateModal({ open, onClose, onSubmit, member, loading = false, error = null }) {
  const [file, setFile] = useState(null)
  const [touched, setTouched] = useState(false)
  const [progress, setProgress] = useState(0)

  const close = () => {
    if (loading) return
    setFile(null)
    setTouched(false)
    setProgress(0)
    onClose()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setTouched(true)
    if (!file) return
    const uploaded = await onSubmit({
      patientId: member.patientId?._id ?? member.patientId,
      file,
      onUploadProgress: setProgress,
    })
    if (uploaded) {
      setFile(null)
      setTouched(false)
      setProgress(0)
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      size="sm"
      title="Upload a death certificate"
      description={
        member
          ? `Filed against ${member.patientId?.fullName ?? 'this member'}${
              member.patientId?.ohid ? ` · ${member.patientId.ohid}` : ''
            }.`
          : undefined
      }
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="death-certificate-form"
            variant="danger"
            loading={loading}
            disabled={!file}
          >
            {loading ? `Uploading ${progress}%` : 'Upload certificate'}
          </Button>
        </>
      }
    >
      <form id="death-certificate-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error.message ?? String(error)}</Alert>}

        <FileDropzone value={file} onChange={setFile} progress={progress} disabled={loading} />

        {touched && !file && <p className="text-xs text-rose-300">Attach the certificate to continue.</p>}

        <Alert tone="warning" title="This unlocks their digital will">
          Once a family admin approves this certificate, the will is unlocked for everyone in the
          group. Only upload it after a death has actually been registered — the action is not
          reversible from the app.
        </Alert>
      </form>
    </Modal>
  )
}
