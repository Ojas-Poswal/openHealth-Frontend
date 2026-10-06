import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarClock,
  LogOut,
  RotateCw,
  ShieldCheck,
  ShieldX,
  UserCheck,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import { SkeletonCards } from '../../components/ui/Skeleton.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { doctorsApi } from '../../api/doctors.api.js'
import { formatDateTime } from '../../utils/format.js'

/**
 * Sessions this doctor currently holds.
 *
 * GET /doctors/active-sessions returns only consents with `accessGranted`,
 * so anything the patient has revoked has already disappeared from this
 * list — the numbers here are what is genuinely open right now.
 */
export default function ActiveSessions() {
  const toast = useToast()

  const sessions = useAsync(() => doctorsApi.getActiveSessions(), [], { emptyOn: [404] })

  const [ending, setEnding] = useState(null)
  const [busy, setBusy] = useState(false)

  const list = sessions.data ?? []

  const handleEnd = async () => {
    setBusy(true)
    try {
      await doctorsApi.endSession(ending.patientId?._id ?? ending.patientId)
      toast.success(`Session with ${ending.patientId?.fullName ?? 'the patient'} ended.`)
      setEnding(null)
      sessions.refresh()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Active sessions"
        description="Patients who have approved your access. You can close any of these, and they can revoke any of them."
        actions={
          <>
            <Button
              variant="ghost"
              icon={RotateCw}
              onClick={sessions.refresh}
              loading={sessions.refreshing}
            >
              Refresh
            </Button>
            <Link to="/doctor/search">
              <Button icon={UserCheck}>Find a patient</Button>
            </Link>
          </>
        }
      />

      {!sessions.loading && !sessions.error && list.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Badge tone="mint" icon={ShieldCheck}>
            {list.length} open session{list.length === 1 ? '' : 's'}
          </Badge>
        </div>
      )}

      {sessions.loading ? (
        <SkeletonCards count={2} />
      ) : sessions.error ? (
        <ErrorState error={sessions.error} onRetry={sessions.refetch} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={ShieldX}
          title="No open sessions"
          message="You do not currently have access to anyone's record. Find a patient by their OHID and request consent — the session appears here once they approve the code."
          action={
            <Link to="/doctor/search">
              <Button icon={UserCheck}>Find a patient</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {list.map((session) => (
            <Card key={session._id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <Avatar name={session.patientId?.fullName} size="lg" ring />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold text-white">
                        {session.patientId?.fullName ?? 'Patient'}
                      </h3>
                      <Badge tone="mint" size="sm" icon={ShieldCheck}>
                        Consent active
                      </Badge>
                    </div>
                    <p className="mt-1 font-mono text-xs text-slate-500">
                      {session.patientId?.ohid ?? '—'}
                    </p>
                    <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                      Opened {formatDateTime(session.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    icon={LogOut}
                    onClick={() => setEnding(session)}
                  >
                    End session
                  </Button>
                  <Link to={`/doctor/patient/${session.patientId?._id}`}>
                    <Button size="sm" iconRight={ArrowRight}>
                      Open record
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(ending)}
        onClose={() => setEnding(null)}
        onConfirm={handleEnd}
        loading={busy}
        title="End this session?"
        confirmLabel="End session"
        message={`Your access to ${
          ending?.patientId?.fullName ?? 'this patient'
        } will close immediately. You will need a new consent code to open their record again.`}
      />
    </>
  )
}
