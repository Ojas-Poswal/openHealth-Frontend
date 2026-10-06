import { useEffect, useState } from 'react'
import { Clock, Stethoscope } from 'lucide-react'
import Card, { CardHeader } from '../ui/Card.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { patientsApi } from '../../api/patients.api.js'

/**
 * The codes waiting to be read out.
 *
 * When a doctor asks for access, the code lands here — on the patient's own
 * screen — and only the patient can pass it on. Nothing is shared until the
 * doctor types it back, so this card is the patient's half of the handshake.
 */
export default function ConsentRequests() {
  const requests = useAsync(() => patientsApi.getConsentRequests(), [], { emptyOn: [404] })
  const list = requests.data ?? []

  if (requests.loading || list.length === 0) return null

  return (
    <div className="mb-6 space-y-4">
      {list.map((request) => (
        <RequestCard key={request._id} request={request} />
      ))}
    </div>
  )
}

function RequestCard({ request }) {
  const doctor = request.doctorId ?? {}

  return (
    <Card className="border-brand-400/40 bg-brand-soft/40">
      <CardHeader
        title={`${doctor.fullName ?? 'A doctor'} wants to see your record`}
        subtitle={
          doctor.dhid
            ? `${doctor.dhid}${doctor.specialization ? ` · ${doctor.specialization}` : ''}`
            : undefined
        }
        icon={Stethoscope}
        actions={<Expiry expiresAt={request.expiresAt} />}
      />

      <div className="mt-4 rounded-2xl border border-brand-400/30 bg-ink-900/40 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-200">
          Read this code out — only if you agree
        </p>
        <p className="mt-3 font-mono text-4xl font-bold tracking-[0.3em] text-white">{request.otp}</p>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          Nobody can open your timeline until they type it back. Ignore this and access is never
          granted.
        </p>
      </div>
    </Card>
  )
}

function Expiry({ expiresAt }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(expiresAt).getTime() - Date.now()))

  useEffect(() => {
    const deadline = new Date(expiresAt).getTime()
    const tick = () => setRemaining(Math.max(0, deadline - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  const expired = remaining <= 0

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        expired ? 'bg-rose-500/12 text-rose-300 ring-rose-500/30' : 'bg-ink-900/60 text-slate-300 ring-ink-600'
      }`}
    >
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      {expired ? 'Expired' : `Expires in ${minutes}:${String(seconds).padStart(2, '0')}`}
    </span>
  )
}
