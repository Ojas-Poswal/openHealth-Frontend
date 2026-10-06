import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  KeyRound,
  RotateCw,
  ShieldCheck,
  ShieldOff,
  Stethoscope,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import ConsentRequests from '../../components/patient/ConsentRequests.jsx'
import Button from '../../components/ui/Button.jsx'
import Card, { CardHeader } from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Alert from '../../components/ui/Alert.jsx'
import Tabs from '../../components/ui/Tabs.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import { SkeletonCards } from '../../components/ui/Skeleton.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { patientsApi } from '../../api/patients.api.js'
import { formatDateTime } from '../../utils/format.js'

/**
 * Consents a doctor holds on this record.
 *
 * A doctor's access needs both `isUsed` (the patient read out the OTP and the
 * doctor verified it) and `accessGranted` (nobody has revoked it since).
 * `expiresAt` is stored but never enforced by the backend, so it is shown as
 * information rather than used to decide whether access is live.
 */
export default function Consents() {
  const toast = useToast()

  const consents = useAsync(() => patientsApi.getMyConsents(), [], { emptyOn: [404] })

  const [tab, setTab] = useState('active')
  const [revoking, setRevoking] = useState(null)
  const [busy, setBusy] = useState(false)

  const list = consents.data ?? []

  const buckets = useMemo(() => {
    const active = []
    const pending = []
    const past = []

    list.forEach((consent) => {
      const isLive = consent.isUsed && consent.accessGranted
      const isPending = !consent.isUsed
      if (isLive) active.push(consent)
      else if (isPending) pending.push(consent)
      else past.push(consent)
    })

    return { active, pending, past }
  }, [list])

  const visible = buckets[tab] ?? []

  const handleRevoke = async () => {
    setBusy(true)
    try {
      await patientsApi.revokeConsent(revoking.doctorId?._id ?? revoking.doctorId)
      toast.success('Access revoked. The doctor can no longer open your timeline.')
      setRevoking(null)
      consents.refresh()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Doctor access"
        description="Who has been given access to your record, and who has lost it. Every view is logged."
        actions={
          <Button
            variant="ghost"
            icon={RotateCw}
            onClick={consents.refresh}
            loading={consents.refreshing}
          >
            Refresh
          </Button>
        }
      />

      <ConsentRequests />

      {!consents.loading && !consents.error && list.length > 0 && (
        <div className="mb-6">
          <Tabs
            tabs={[
              { value: 'active', label: 'Active', count: buckets.active.length },
              { value: 'pending', label: 'Awaiting code', count: buckets.pending.length },
              { value: 'past', label: 'Ended', count: buckets.past.length },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>
      )}

      {consents.loading ? (
        <SkeletonCards count={2} />
      ) : consents.error ? (
        <ErrorState error={consents.error} onRetry={consents.refetch} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No doctor has asked for access"
          message="When a doctor requests access, you get a code to read out. Nothing is shared until you do."
          action={
            <Link to="/app/audit-logs">
              <Button variant="secondary" icon={Clock}>
                See my audit log
              </Button>
            </Link>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Nothing here"
          message={
            tab === 'active'
              ? 'No doctor currently holds live access to your record.'
              : tab === 'pending'
                ? 'No consent request is waiting for its one-time code.'
                : 'No access has been revoked or ended yet.'
          }
          compact
        />
      ) : (
        <div className="space-y-4">
          {visible.map((consent) => {
            const isLive = consent.isUsed && consent.accessGranted
            const isPending = !consent.isUsed

            return (
              <Card key={consent._id}>
                <CardHeader
                  title={consent.doctorId?.fullName ?? 'A doctor'}
                  subtitle={
                    consent.doctorId?.dhid
                      ? `${consent.doctorId.dhid}${
                          consent.doctorId.specialization ? ` · ${consent.doctorId.specialization}` : ''
                        }`
                      : undefined
                  }
                  icon={Stethoscope}
                  actions={
                    isLive ? (
                      <Button
                        variant="danger"
                        size="sm"
                        icon={ShieldOff}
                        onClick={() => setRevoking(consent)}
                      >
                        Revoke access
                      </Button>
                    ) : isPending ? (
                      <Badge tone="amber" icon={KeyRound}>
                        Waiting for code
                      </Badge>
                    ) : (
                      <Badge tone="neutral">Ended</Badge>
                    )
                  }
                />

                <dl className="mt-4 grid gap-x-6 gap-y-4 rounded-2xl border border-ink-600/60 bg-ink-800/40 p-5 sm:grid-cols-2 lg:grid-cols-4">
                  <Meta label="Requested" value={formatDateTime(consent.createdAt)} />
                  <Meta
                    label="Code verified"
                    value={consent.isUsed ? 'Yes' : 'Not yet'}
                  />
                  <Meta
                    label="Access"
                    value={consent.accessGranted ? 'Granted' : 'Not granted'}
                  />
                  <Meta label="Code expires" value={formatDateTime(consent.expiresAt)} />
                </dl>

                {isLive && (
                  <Alert tone="success" className="mt-4">
                    This doctor can open your timeline right now. Revoking takes effect immediately.
                  </Alert>
                )}

                {isPending && (
                  <Alert tone="info" className="mt-4">
                    The code above is still waiting to be read out. Nothing is shared until they type it
                    back. If you did not expect this request, just ignore it.
                  </Alert>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Alert tone="info" className="mt-6">
        A doctor with access can never read your digital will, and cannot edit or delete anything you
        recorded.
      </Alert>

      <ConfirmDialog
        open={Boolean(revoking)}
        onClose={() => setRevoking(null)}
        onConfirm={handleRevoke}
        loading={busy}
        title="Revoke this doctor's access?"
        confirmLabel="Revoke access"
        message={`${
          revoking?.doctorId?.fullName ?? 'This doctor'
        } will immediately lose access to your timeline and summaries. They would have to request consent again from scratch.`}
      />
    </>
  )
}

function Meta({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-200">{value || '—'}</dd>
    </div>
  )
}
