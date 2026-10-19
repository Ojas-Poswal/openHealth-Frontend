import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Stethoscope } from 'lucide-react'
import AuthLayout from '../../components/layout/AuthLayout.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import Input from '../../components/ui/Input.jsx'
import Alert from '../../components/ui/Alert.jsx'
import { useDoctorAuth } from '../../context/DoctorAuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function DoctorLogin() {
  const { login } = useDoctorAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [values, setValues] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ email: values.email.trim(), password: values.password })
      toast.success('Signed in.')
      navigate(location.state?.from ?? '/doctor/dashboard', { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Doctor sign in"
      subtitle="Search for a patient by OHID, then open their timeline with their one-time consent."
      footer={
        <>
          Not registered yet?{' '}
          <Link to="/doctor/register" className="font-semibold text-brand-300 hover:text-brand-200">
            Register as a doctor
          </Link>
          <span className="mx-2 text-slate-600">·</span>
          <Link to="/login" className="font-semibold text-brand-300 hover:text-brand-200">
            Patient sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <Alert tone="error">{error.message}</Alert>}

        <Field label="Email address" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={set('email')}
            placeholder="doctor@hospital.org"
            autoComplete="email"
            required
            autoFocus
          />
        </Field>

        <Field label="Password" htmlFor="password" required>
          <Input
            id="password"
            type="password"
            value={values.password}
            onChange={set('password')}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </Field>

        <div className="flex items-center justify-between">
          <Link
            to="/doctor/forgot-password"
            className="text-sm font-medium text-brand-300 hover:text-brand-200"
          >
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" icon={Stethoscope} loading={loading} fullWidth size="lg">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}
