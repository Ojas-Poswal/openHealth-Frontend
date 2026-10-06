import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Field from '../ui/Field.jsx'
import Input from '../ui/Input.jsx'
import Alert from '../ui/Alert.jsx'

const emptyMedicine = () => ({
  key: Math.random().toString(36).slice(2),
  medicine: '',
  dosage: '',
  frequency: '',
  duration: '',
  notes: '',
})

/**
 * Writes a prescription into a medical case.
 *
 * POST /prescriptions/create expects
 * `{ medicalCaseId, medicines: [{ medicine, dosage, frequency, duration, notes }] }`
 * where the first four fields are required on every medicine — so the form
 * validates each row rather than trusting that a partly-filled row is fine.
 */
export default function PrescriptionFormModal({
  open,
  onClose,
  onSubmit,
  medicalCase,
  doctorName,
  loading = false,
  error = null,
}) {
  const [medicines, setMedicines] = useState([emptyMedicine()])
  const [touched, setTouched] = useState(false)

  const reset = () => {
    setMedicines([emptyMedicine()])
    setTouched(false)
  }

  const close = () => {
    if (loading) return
    reset()
    onClose()
  }

  const update = (key, field) => (event) =>
    setMedicines((current) =>
      current.map((item) => (item.key === key ? { ...item, [field]: event.target.value } : item)),
    )

  const addRow = () => setMedicines((current) => [...current, emptyMedicine()])

  const removeRow = (key) =>
    setMedicines((current) => (current.length === 1 ? current : current.filter((item) => item.key !== key)))

  const rowError = (item) =>
    !item.medicine.trim() || !item.dosage.trim() || !item.frequency.trim() || !item.duration.trim()

  const valid = medicines.every((item) => !rowError(item))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setTouched(true)
    if (!valid) return

    const payload = medicines.map(({ medicine, dosage, frequency, duration, notes }) => ({
      medicine: medicine.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      duration: duration.trim(),
      notes: notes.trim(),
    }))

    if (await onSubmit(medicalCase._id, payload)) {
      reset()
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title="Write a prescription"
      description={
        medicalCase
          ? `${medicalCase.diagnosis}${doctorName ? ` · prescribed by ${doctorName}` : ''}`
          : undefined
      }
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="prescription-form" loading={loading} disabled={!valid && touched}>
            Save prescription
          </Button>
        </>
      }
    >
      <form id="prescription-form" onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert tone="error">{error.message ?? String(error)}</Alert>}

        {medicines.map((item, index) => (
          <div key={item.key} className="rounded-2xl border border-ink-600/60 bg-ink-900/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Medicine {index + 1}</p>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => removeRow(item.key)}
                disabled={medicines.length === 1}
                className="text-slate-400 hover:text-rose-300"
                title={medicines.length === 1 ? 'At least one medicine is required' : 'Remove this medicine'}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Medicine"
                htmlFor={`medicine-${item.key}`}
                required
                error={touched && !item.medicine.trim() ? 'Required' : null}
                className="sm:col-span-2"
              >
                <Input
                  id={`medicine-${item.key}`}
                  value={item.medicine}
                  onChange={update(item.key, 'medicine')}
                  placeholder="e.g. Amoxicillin 500mg"
                  error={touched && !item.medicine.trim()}
                />
              </Field>

              <Field
                label="Dosage"
                htmlFor={`dosage-${item.key}`}
                required
                error={touched && !item.dosage.trim() ? 'Required' : null}
              >
                <Input
                  id={`dosage-${item.key}`}
                  value={item.dosage}
                  onChange={update(item.key, 'dosage')}
                  placeholder="e.g. 1 tablet"
                  error={touched && !item.dosage.trim()}
                />
              </Field>

              <Field
                label="Frequency"
                htmlFor={`frequency-${item.key}`}
                required
                error={touched && !item.frequency.trim() ? 'Required' : null}
              >
                <Input
                  id={`frequency-${item.key}`}
                  value={item.frequency}
                  onChange={update(item.key, 'frequency')}
                  placeholder="e.g. Twice daily after meals"
                  error={touched && !item.frequency.trim()}
                />
              </Field>

              <Field
                label="Duration"
                htmlFor={`duration-${item.key}`}
                required
                error={touched && !item.duration.trim() ? 'Required' : null}
              >
                <Input
                  id={`duration-${item.key}`}
                  value={item.duration}
                  onChange={update(item.key, 'duration')}
                  placeholder="e.g. 7 days"
                  error={touched && !item.duration.trim()}
                />
              </Field>

              <Field label="Notes" htmlFor={`notes-${item.key}`} hint="Optional — warnings, interactions, advice.">
                <Input
                  id={`notes-${item.key}`}
                  value={item.notes}
                  onChange={update(item.key, 'notes')}
                  placeholder="e.g. Take with plenty of water"
                />
              </Field>
            </div>
          </div>
        ))}

        <Button variant="secondary" size="sm" icon={Plus} onClick={addRow} fullWidth>
          Add another medicine
        </Button>
      </form>
    </Modal>
  )
}
