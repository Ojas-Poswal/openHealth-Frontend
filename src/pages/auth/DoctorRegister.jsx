import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import RegistrationFlow from '../../components/auth/RegistrationFlow.jsx'
import { Alert, Button, Field, Input } from '../../components/ui/index.js'
import { doctorsApi } from '../../api/doctors.api.js'
import { useDoctorAuth } from '../../context/DoctorAuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const EMPTY = {
  fullName: '',
  phone: '',
  password: '',
  confirm: '',
  registrationNumber: '',
  qualification: '',
  specialization: '',
  workplace: '',
}

export default function DoctorRegister() {
  const { register } = useDoctorAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [values, setValues] = useState(EMPTY)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState(false)

  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }))

  const errors = {
    fullName: values.fullName.trim() ? null : 'Enter your full name.',
    phone: values.phone.trim().length >= 7 ? null : 'Enter a reachable phone number.',
    password: values.password.length >= 8 ? null : 'Use at least 8 characters.',
    confirm: values.confirm === values.password ? null : 'Passwords do not match.',
    registrationNumber: values.registrationNumber.trim() ? null : 'Your registration number is required.',
  }
  const valid = Object.values(errors).every((value) => value === null)

  const handleSubmit = async (event, { email, otp }) => {
    event.preventDefault()
    setTouched(true)
    setError(null)
    if (!valid) return

    setLoading(true)
    try {
      await register({
        fullName: values.fullName.trim(),
        email,
        otp,
        phone: values.phone.trim(),
        password: values.password,
        registrationNumber: values.registrationNumber.trim(),
        qualification: values.qualification.trim(),
        specialization: values.specialization.trim(),
        workplace: values.workplace.trim(),
      })
      toast.success('Doctor account created. Sign in to continue.')
      navigate('/doctor/login', { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <RegistrationFlow
      wide
      title="Register as a doctor"
      subtitle="You will receive a doctor ID (DHID) that patients can verify when granting consent."
      emailHint="Use the address your patients and hospital know you by."
      sendOtp={doctorsApi.sendRegistrationOtp}
      verifyOtp={doctorsApi.verifyRegistrationOtp}
      footer={
        <>
          Already registered?{' '}
          <Link to="/doctor/login" className="font-semibold text-brand-300 hover:text-brand-200">
            Doctor sign in
          </Link>
        </>
      }
    >
      {({ email, otp }) => (
        <form onSubmit={(event) => handleSubmit(event, { email, otp })} className="space-y-4" noValidate>
          {error && <Alert tone="error">{error.message}</Alert>}

          <Alert tone="success">
            Email verified — <span className="font-semibold">{email}</span> is confirmed.
          </Alert>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="fullName" required error={touched ? errors.fullName : null}>
              <Input
                id="fullName"
                value={values.fullName}
                onChange={set('fullName')}
                placeholder="Dr. Asha Verma"
                autoComplete="name"
                error={touched && errors.fullName}
                autoFocus
              />
            </Field>

            <Field
              label="Medical registration number"
              htmlFor="registrationNumber"
              required
              error={touched ? errors.registrationNumber : null}
              hint="As issued by your medical council."
            >
              <Input
                id="registrationNumber"
                value={values.registrationNumber}
                onChange={set('registrationNumber')}
                placeholder="e.g. MCI-123456"
                error={touched && errors.registrationNumber}
              />
            </Field>
          </div>

          <Field label="Phone number" htmlFor="phone" required error={touched ? errors.phone : null}>
            <Input
              id="phone"
              type="tel"
              value={values.phone}
              onChange={set('phone')}
              placeholder="+91 98765 43210"
              autoComplete="tel"
              error={touched && errors.phone}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Qualification" htmlFor="qualification" hint="Optional">
              <Input
                id="qualification"
                value={values.qualification}
                onChange={set('qualification')}
                placeholder="MBBS, MD"
              />
            </Field>

            <Field label="Specialisation" htmlFor="specialization" hint="Optional">
              <Input
                id="specialization"
                value={values.specialization}
                onChange={set('specialization')}
                placeholder="Gastroenterology"
              />
            </Field>

            <Field label="Workplace" htmlFor="workplace" hint="Optional">
              <Input
                id="workplace"
                value={values.workplace}
                onChange={set('workplace')}
                placeholder="City Hospital"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Password"
              htmlFor="password"
              required
              error={touched ? errors.password : null}
              hint="At least 8 characters."
            >
              <Input
                id="password"
                type="password"
                value={values.password}
                onChange={set('password')}
                placeholder="••••••••"
                autoComplete="new-password"
                error={touched && errors.password}
              />
            </Field>

            <Field label="Confirm password" htmlFor="confirm" required error={touched ? errors.confirm : null}>
              <Input
                id="confirm"
                type="password"
                value={values.confirm}
                onChange={set('confirm')}
                placeholder="••••••••"
                autoComplete="new-password"
                error={touched && errors.confirm}
              />
            </Field>
          </div>

          <Button type="submit" icon={UserPlus} loading={loading} fullWidth size="lg">
            Create doctor account
          </Button>
        </form>
      )}
    </RegistrationFlow>
  )
}
