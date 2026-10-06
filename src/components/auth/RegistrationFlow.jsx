import { useState } from 'react'
import { MailCheck, ShieldCheck } from 'lucide-react'
import AuthLayout from '../layout/AuthLayout.jsx'
import { Alert, AuthSteps, Button, Field, Input } from '../ui/index.js'

const STEPS = ['Confirm your email', 'Enter the code', 'Your details']

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * The first two steps of every sign-up, shared by patients and doctors.
 *
 * The order matters: the email is proven to work *before* any details are
 * typed, so a mistyped address is caught immediately instead of creating an
 * account nobody can recover. The code is emailed — it never appears here.
 *
 * `children` renders the final step and receives the verified `{ email, otp }`
 * so the page's own form can submit them along with the rest of the details.
 */
export default function RegistrationFlow({
  title,
  subtitle,
  footer,
  wide = false,
  emailHint,
  sendOtp,
  verifyOtp,
  children,
}) {
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const cleanEmail = email.trim()

  const handleSend = async (event) => {
    event.preventDefault()
    setError(null)

    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setError(new Error('Enter a valid email address.'))
      return
    }

    setLoading(true)
    try {
      await sendOtp(cleanEmail)
      setStep(1)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (event) => {
    event.preventDefault()
    setError(null)

    if (otp.trim().length !== 6) {
      setError(new Error('Enter the six-digit code from your email.'))
      return
    }

    setLoading(true)
    try {
      await verifyOtp(cleanEmail, otp.trim())
      setStep(2)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title={title} subtitle={subtitle} footer={footer} wide={wide}>
      <AuthSteps steps={STEPS} current={step} />

      {error && (
        <Alert tone="error" className="mb-4">
          {error.message}
        </Alert>
      )}

      {step === 0 && (
        <form onSubmit={handleSend} className="space-y-4" noValidate>
          <Field label="Email address" htmlFor="register-email" required hint={emailHint}>
            <Input
              id="register-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
          </Field>

          <Button type="submit" icon={MailCheck} loading={loading} fullWidth size="lg">
            Send verification code
          </Button>
        </form>
      )}

      {step === 1 && (
        <form onSubmit={handleVerify} className="space-y-4" noValidate>
          <Alert tone="info">
            We emailed a six-digit code to <span className="font-semibold">{cleanEmail}</span>. It
            expires in 10 minutes.
          </Alert>

          <Field
            label="Six-digit code"
            htmlFor="register-otp"
            required
            hint="Nothing in your inbox? Check the spam folder."
          >
            <Input
              id="register-otp"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
              className="text-center font-mono text-lg tracking-[0.4em]"
              autoFocus
            />
          </Field>

          <div className="flex gap-2.5">
            <Button variant="ghost" type="button" onClick={() => setStep(0)} disabled={loading}>
              Change email
            </Button>
            <Button type="submit" icon={ShieldCheck} loading={loading} fullWidth>
              Verify code
            </Button>
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={loading}
            className="w-full text-center text-sm text-slate-400 transition-colors hover:text-brand-300 disabled:opacity-50"
          >
            Send me a new code
          </button>
        </form>
      )}

      {step === 2 && children({ email: cleanEmail, otp: otp.trim() })}
    </AuthLayout>
  )
}
