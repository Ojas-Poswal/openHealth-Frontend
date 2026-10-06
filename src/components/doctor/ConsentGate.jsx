import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, KeyRound, RefreshCw, ShieldCheck, Smartphone } from 'lucide-react'
import Button from '../ui/Button.jsx'
import Card, { CardHeader } from '../ui/Card.jsx'
import Alert from '../ui/Alert.jsx'
import Input from '../ui/Input.jsx'
import Field from '../ui/Field.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useMutation } from '../../hooks/useMutation.js'
import { doctorsApi } from '../../api/doctors.api.js'

/**
 * The consent gate that stands in front of every patient record.
 *
 * POST /doctors/request-consent puts a one-time code in the *patient's*
 * portal — never on this screen. The doctor asks the patient to read the code
 * out, then POST /doctors/verify-consent opens the session. All this screen
 * shows is a countdown and somewhere to type what they hear.
 */
export default function ConsentGate({ patientId, patientName, onGranted }) {
  const toast = useToast()

  const [issued, setIssued] = useState(null)
  const [code, setCode] = useState('')
  const [touched, setTouched] = useState(false)
  const [remaining, setRemaining] = useState(0)
  const [alreadyActive, setAlreadyActive] = useState(false)

  const request = useMutation(() => doctorsApi.requestConsent(patientId))
  const verify = useMutation((otp) => doctorsApi.verifyConsent({ patientId, otp }))

  const who = patientName ?? 'the patient'

  // Countdown to the expiry the server reported, so the two never disagree.
  useEffect(() => {
    if (!issued?.expiresAt) return
    const expiresAt = new Date(issued.expiresAt).getTime()

    const tick = () => setRemaining(Math.max(0, expiresAt - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [issued])

  const handleRequest = async () => {
    setTouched(false)
    setCode('')
    const result = await request.run()
    if (result) {
      setIssued(result)
      toast.success(`Code sent to ${who}'s portal. Ask them to read it out.`)
      return
    }
    // 400 means a live consent already exists for this pair.
    if (request.error?.status === 400) setAlreadyActive(true)
  }

  const handleVerify = async (event) => {
    event.preventDefault()
    setTouched(true)
    if (code.trim().length !== 6) return

    const result = await verify.run(code.trim())
    if (!result) return

    toast.success('Consent verified — the record is now open.')
    onGranted()
  }

  const expired = Boolean(issued) && remaining <= 0
  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)

  // A live consent already exists — nothing to do but reopen the record.
  if (alreadyActive) {
    return (
      <Card>
        <CardHeader
          title="You already have consent"
          subtitle="An active session exists for this patient."
          icon={CheckCircle2}
        />
        <div className="mt-4 space-y-4">
          <Alert tone="success">
            Consent for {who} is already granted and has not been revoked. Open the record directly.
          </Alert>
          <Button icon={ShieldCheck} onClick={onGranted} fullWidth>
            Open the record
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="Consent required"
        subtitle={`Ask ${who} for the code on their screen, then type it here.`}
        icon={KeyRound}
      />

      <div className="mt-5 space-y-5">
        {request.error && request.error.status !== 400 && (
          <Alert tone="error" title="Could not create a code">
            {request.error.message}
          </Alert>
        )}

        {!issued ? (
          <>
            <Alert tone="info">
              openHealth will send a one-time code to{' '}
              <span className="font-medium text-slate-100">{who}'s</span> openHealth account. Ask them
              to read it out — only continue once they say they want you to see their record.
            </Alert>

            <Button icon={KeyRound} onClick={handleRequest} loading={request.loading} fullWidth>
              Request a consent code
            </Button>
          </>
        ) : (
          <>
            <div className="rounded-2xl border border-brand-400/30 bg-brand-soft p-5 text-center">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-ink-900/60">
                <Smartphone className="h-5 w-5 text-brand-200" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-semibold text-white">
                Waiting for {who}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                The code is on their openHealth screen, under Consents.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                    expired
                      ? 'bg-rose-500/12 text-rose-300 ring-rose-500/30'
                      : 'bg-ink-900/60 text-slate-300 ring-ink-600'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {expired ? 'Expired' : `Expires in ${minutes}:${String(seconds).padStart(2, '0')}`}
                </span>
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <Field
                label="Enter the code the patient read out"
                htmlFor="otp"
                error={touched && code.trim().length !== 6 ? 'The code is six digits.' : null}
                hint="Confirm out loud that they want you to open their record before you verify."
              >
                <Input
                  id="otp"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="text-center font-mono text-lg tracking-[0.4em]"
                  error={touched && code.trim().length !== 6}
                  disabled={expired}
                  autoFocus
                />
              </Field>

              {verify.error && (
                <Alert tone="error" title="That code did not work">
                  {verify.error.status === 400
                    ? 'The code has expired. Request a new one and ask them to read it out again.'
                    : 'The code does not match the one issued for this patient. Check the digits and try again.'}
                </Alert>
              )}

              <Button
                type="submit"
                icon={ShieldCheck}
                loading={verify.loading}
                disabled={code.trim().length !== 6 || expired}
                fullWidth
              >
                Open the record
              </Button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-ink-600/60 pt-4">
              <Button
                variant="ghost"
                size="sm"
                icon={RefreshCw}
                onClick={handleRequest}
                loading={request.loading}
              >
                {expired ? 'Send a new code' : 'Resend the code'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
