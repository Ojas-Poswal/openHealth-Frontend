import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import AuthLayout from '../../components/layout/AuthLayout.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import Input from '../../components/ui/Input.jsx'
import Alert from '../../components/ui/Alert.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function PatientLogin() {
  const { login } = useAuth()
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
      toast.success('Welcome back.')
      navigate(location.state?.from ?? '/app/dashboard', { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in to openHealth"
      subtitle="Your timeline, reports and summaries — exactly where you left them."
      footer={
        <>
          New to openHealth?{' '}
          <Link to="/register" className="font-semibold text-brand-300 hover:text-brand-200">
            Create a patient account
          </Link>
          <span className="mx-2 text-slate-600">·</span>
          Are you a doctor?{' '}
          <Link to="/doctor/login" className="font-semibold text-brand-300 hover:text-brand-200">
            Doctor sign in
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
            autoComplete="email"
            value={values.email}
            onChange={set('email')}
            placeholder="you@example.com"
            required
            autoFocus
          />
        </Field>

        <Field label="Password" htmlFor="password" required>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={set('password')}
            placeholder="••••••••"
            required
          />
        </Field>

        <div className="flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-brand-300 hover:text-brand-200"
          >
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" icon={LogIn} loading={loading} fullWidth size="lg">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}
