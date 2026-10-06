import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Field from '../ui/Field.jsx'
import Input from '../ui/Input.jsx'
import Textarea from '../ui/Textarea.jsx'
import Alert from '../ui/Alert.jsx'

/**
 * Creates a medical case — the first step of any new entry on the timeline.
 * The backend accepts exactly { diagnosis, verdict, finalAdvice }.
 */
export default function CaseFormModal({ open, onClose, onSubmit, loading = false, error = null }) {
  const [values, setValues] = useState({ diagnosis: '', verdict: '', finalAdvice: '' })
  const [touched, setTouched] = useState(false)

  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }))

  const reset = () => {
    setValues({ diagnosis: '', verdict: '', finalAdvice: '' })
    setTouched(false)
  }

  const close = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setTouched(true)
    if (!values.diagnosis.trim()) return
    if (await onSubmit({ diagnosis: values.diagnosis.trim(), verdict: values.verdict.trim(), finalAdvice: values.finalAdvice.trim() })) {
      reset()
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add a case to your timeline"
      description="Only the diagnosis is required — you can fill in the rest as you learn more."
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="case-form" loading={loading}>
            Create case
          </Button>
        </>
      }
    >
      <form id="case-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error.message ?? String(error)}</Alert>}

        <Field
          label="Diagnosis"
          htmlFor="diagnosis"
          required
          error={touched && !values.diagnosis.trim() ? 'A diagnosis is required.' : null}
          hint="What the condition was called, e.g. “Peptic ulcer”."
        >
          <Input
            id="diagnosis"
            value={values.diagnosis}
            onChange={set('diagnosis')}
            placeholder="e.g. Peptic ulcer"
            autoFocus
            error={touched && !values.diagnosis.trim()}
          />
        </Field>

        <Field
          label="Verdict"
          htmlFor="verdict"
          hint="What the doctor concluded — findings, test results, severity."
        >
          <Textarea
            id="verdict"
            rows={3}
            value={values.verdict}
            onChange={set('verdict')}
            placeholder="e.g. H. pylori positive, 8mm duodenal ulcer on endoscopy."
          />
        </Field>

        <Field label="Final advice" htmlFor="finalAdvice" hint="Diet, rest, follow-ups, warning signs to watch for.">
          <Textarea
            id="finalAdvice"
            rows={3}
            value={values.finalAdvice}
            onChange={set('finalAdvice')}
            placeholder="e.g. Complete the 14-day course, avoid NSAIDs, review in 6 weeks."
          />
        </Field>
      </form>
    </Modal>
  )
}
