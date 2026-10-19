import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BadgeCheck } from 'lucide-react'
import AuthLayout from '../../components/layout/AuthLayout.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import Input from '../../components/ui/Input.jsx'
import Alert from '../../components/ui/Alert.jsx'
import { doctorsApi } from '../../api/doctors.api.js'
import { useDoctorAuth } from '../../context/DoctorAuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

/**
 * Where a doctor who signed in with Google finishes their account.
 *
 * The account exists and is signed in, but it has no registration number, so
 * the route guard keeps it out of every clinical screen until one is saved.
 * This page deliberately renders outside the doctor shell: every link in that
 * shell would be refused until this is done.
 */
export default function CompleteProfile() {
  const { doctor, updateDoctor, logout } = useDoctorAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [values, setValues] = useState({
    registrationNumber: '',
    specialization: doctor?.specialization ?? '',
    workplace: doctor?.workplace ?? '',
  })
  const [fieldError, setFieldError] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)

    // Checked here rather than by disabling the button: the backend accepts an
    // empty registration number as "no change", so without this the save would
    // report success and then bounce straight back to this same page.
    if (!values.registrationNumber.trim()) {
      setFieldError('Your registration number is required.')
      return
    }

    setFieldError(null)
    setLoading(true)

    try {
      const profile = await doctorsApi.updateProfile({
        registrationNumber: values.registrationNumber.trim(),
        specialization: values.specialization.trim(),
        workplace: values.workplace.trim(),
      })
      updateDoctor(profile)
      toast.success('Your account is complete.')
      navigate('/doctor/dashboard', { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Finish setting up"
      subtitle="A registration number is what lets you open a patient's records."
      footer={
        <button
          type="button"
          onClick={logout}
          className="font-semibold text-brand-300 hover:text-brand-200"
        >
          Sign out
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <Alert tone="error">{error.message}</Alert>}

        <p className="text-sm text-slate-400">
          Signed in as <span className="font-medium text-slate-200">{doctor?.email}</span>
        </p>

        <Field
          label="Medical registration number"
          htmlFor="registrationNumber"
          required
          error={fieldError}
          hint="As it appears on your medical council registration."
        >
          <Input
            id="registrationNumber"
            value={values.registrationNumber}
            onChange={set('registrationNumber')}
            placeholder="e.g. MCI-123456"
            autoFocus
          />
        </Field>

        <Field label="Specialization" htmlFor="specialization">
          <Input
            id="specialization"
            value={values.specialization}
            onChange={set('specialization')}
            placeholder="e.g. Cardiology"
          />
        </Field>

        <Field label="Workplace" htmlFor="workplace">
          <Input
            id="workplace"
            value={values.workplace}
            onChange={set('workplace')}
            placeholder="e.g. City Hospital"
          />
        </Field>

        <Button type="submit" icon={BadgeCheck} loading={loading} fullWidth size="lg">
          Save and continue
        </Button>
      </form>
    </AuthLayout>
  )
}
