import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, KeyRound, MailCheck, ShieldCheck } from 'lucide-react'
import AuthLayout from '../../components/layout/AuthLayout.jsx'
import { AuthSteps, Button, Field, Input, Alert } from '../../components/ui/index.js'
import { patientsApi } from '../../api/patients.api.js'
import { doctorsApi } from '../../api/doctors.api.js'
import { useToast } from '../../context/ToastContext.jsx'

const STEPS = ['Your email', 'Verify the code', 'New password']

/**
 * Three-step recovery: request OTP → verify OTP → set a new password.
 *
 * Shared by both roles — pass `role="doctor"` to swap the API and the sign-in
 * page it returns to. The code is emailed; it never appears on this screen.
 */
export default function ForgotPassword({ role = 'patient' }) {
  const navigate = useNavigate()
  const toast = useToast()

  const api = useMemo(() => (role === 'doctor' ? doctorsApi : patientsApi), [role])
  const signInPath = role === 'doctor' ? '/doctor/login' : '/login'

  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const requestOtp = async (event) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.forgotPassword(email.trim())
      setStep(1)
      toast.success('Code sent — check your inbox.')
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (event) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.verifyOtp({ email: email.trim(), otp: otp.trim() })
      setStep(2)
      toast.success('Code verified.')
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (event) => {
    event.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError(new Error('Use at least 8 characters for your new password.'))
      return
    }
    if (password !== confirm) {
      setError(new Error('Passwords do not match.'))
      return
    }
    setLoading(true)
    try {
      await api.resetPassword({ email: email.trim(), otp: otp.trim(), newPassword: password })
      toast.success('Password reset. You can sign in now.')
      navigate(signInPath, { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We will email you a one-time code to confirm it is you before you set a new password."
      footer={
        <Link to={signInPath} className="inline-flex items-center gap-1.5 font-semibold text-brand-300 hover:text-brand-200">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      }
    >
      <AuthSteps steps={STEPS} current={step} />

      {error && (
        <Alert tone="error" className="mb-4">
          {error.message}
        </Alert>
      )}

      {step === 0 && (
        <form onSubmit={requestOtp} className="space-y-4">
          <Field label="Email address" htmlFor="email" required hint="The address on your openHealth account.">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </Field>
          <Button type="submit" icon={MailCheck} loading={loading} fullWidth size="lg">
            Send verification code
          </Button>
        </form>
      )}

      {step === 1 && (
        <form onSubmit={verifyOtp} className="space-y-4">
          <Alert tone="info">
            If <span className="font-semibold">{email.trim()}</span> is registered, a six-digit code is
            on its way. It expires in 10 minutes.
          </Alert>

          <Field label="Six-digit code" htmlFor="otp" required hint="Check your inbox — and your spam folder.">
            <Input
              id="otp"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              className="text-center font-mono text-lg tracking-[0.4em]"
              autoFocus
              maxLength={6}
            />
          </Field>

          <div className="flex gap-2.5">
            <Button variant="ghost" onClick={() => setStep(0)} disabled={loading}>
              Change email
            </Button>
            <Button type="submit" icon={ShieldCheck} loading={loading} fullWidth>
              Verify code
            </Button>
          </div>

          <button
            type="button"
            onClick={requestOtp}
            disabled={loading}
            className="w-full text-center text-sm text-slate-400 hover:text-brand-300 disabled:opacity-50"
          >
            Send me a new code
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={resetPassword} className="space-y-4">
          <Field label="New password" htmlFor="new-password" required hint="At least 8 characters.">
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              autoFocus
            />
          </Field>

          <Field label="Confirm new password" htmlFor="confirm-password" required>
            <Input
              id="confirm-password"
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </Field>

          <Button type="submit" icon={KeyRound} loading={loading} fullWidth size="lg">
            Set new password
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
