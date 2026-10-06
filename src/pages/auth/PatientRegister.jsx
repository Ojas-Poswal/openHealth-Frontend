import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import RegistrationFlow from '../../components/auth/RegistrationFlow.jsx'
import { Alert, Button, Field, Input } from '../../components/ui/index.js'
import { patientsApi } from '../../api/patients.api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const EMPTY = { fullName: '', phone: '', password: '', confirm: '' }

export default function PatientRegister() {
  const { register } = useAuth()
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
      })
      toast.success('Account created. Sign in to continue.')
      navigate('/login', { replace: true, state: { email } })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <RegistrationFlow
      title="Create your patient account"
      subtitle="You will get an openHealth ID (OHID) that doctors and family use to find you."
      emailHint="We will send a code here to check it works."
      sendOtp={patientsApi.sendRegistrationOtp}
      verifyOtp={patientsApi.verifyRegistrationOtp}
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand-300 hover:text-brand-200">
            Sign in
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

          <Field label="Full name" htmlFor="fullName" required error={touched ? errors.fullName : null}>
            <Input
              id="fullName"
              value={values.fullName}
              onChange={set('fullName')}
              placeholder="e.g. Ojas Poswal"
              autoComplete="name"
              error={touched && errors.fullName}
              autoFocus
            />
          </Field>

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
            Create account
          </Button>
        </form>
      )}
    </RegistrationFlow>
  )
}
