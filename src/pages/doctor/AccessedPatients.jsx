import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, Clock, Eye, KeyRound, LogOut, RotateCw, ShieldCheck, Users } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import Card, { CardHeader } from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import { SkeletonCards } from '../../components/ui/Skeleton.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { doctorsApi } from '../../api/doctors.api.js'
import { AUDIT_ACTIONS } from '../../utils/constants.js'
import { formatDateTime, timeAgo } from '../../utils/format.js'

const ACTION_ICONS = {
  CONSENT_REQUESTED: KeyRound,
  CONSENT_GRANTED: ShieldCheck,
  TIMELINE_VIEWED: Eye,
  SESSION_ENDED: LogOut,
}

/**
 * Every patient this doctor has touched, kept in one place.
 *
 * The audit log already exists — this is it read from the doctor's side, so
 * they can pick a record back up without asking the patient for their OHID
 * again. Selecting a patient expands their history in order.
 */
export default function AccessedPatients() {
  const navigate = useNavigate()
  const patients = useAsync(() => doctorsApi.getAccessedPatients(), [], { emptyOn: [404] })

  const [openId, setOpenId] = useState(null)

  const rows = patients.data ?? []

  return (
    <>
      <PageHeader
        title="Patients I've accessed"
        description="Records you have opened before, and everything you did while they were open."
        actions={
          <Button
            variant="ghost"
            icon={RotateCw}
            onClick={patients.refresh}
            loading={patients.refreshing}
          >
            Refresh
          </Button>
        }
      />

      {patients.loading ? (
        <SkeletonCards count={2} />
      ) : patients.error ? (
        <ErrorState error={patients.error} onRetry={patients.refetch} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="You have not opened any records yet"
          message="Search for a patient by their OHID and request consent — the record then stays listed here."
          action={
            <Link to="/doctor/search">
              <Button icon={Users}>Find a patient</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <PatientRow
              key={row.patient._id}
              row={row}
              open={openId === row.patient._id}
              onToggle={() => setOpenId((current) => (current === row.patient._id ? null : row.patient._id))}
              onOpenRecord={() => navigate(`/doctor/patient/${row.patient._id}`)}
            />
          ))}
        </div>
      )}
    </>
  )
}

function PatientRow({ row, open, onToggle, onOpenRecord }) {
  const { patient } = row

  const totals = useMemo(
    () =>
      Object.entries(row.actions ?? {})
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count),
    [row.actions],
  )

  return (
    <Card padded={false}>
      <div className="flex flex-wrap items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-white">{patient.fullName}</p>
            {patient.ohid && (
              <Badge tone="brand" size="sm">
                {patient.ohid}
              </Badge>
            )}
            {row.hasActiveSession ? (
              <Badge tone="mint" size="sm" icon={ShieldCheck}>
                Access open
              </Badge>
            ) : (
              <Badge tone="neutral" size="sm">
                No access
              </Badge>
            )}
          </div>

          <p className="mt-1.5 text-sm text-slate-400">
            Last opened {timeAgo(row.lastAccessedAt)} · {row.events} entr
            {row.events === 1 ? 'y' : 'ies'}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {totals.map(({ action, count }) => {
              const meta = AUDIT_ACTIONS[action]
              const Icon = ACTION_ICONS[action] ?? Activity
              return (
                <span
                  key={action}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    meta?.tone ?? 'bg-white/6 text-slate-300 ring-1 ring-inset ring-white/10'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {meta?.label ?? action} · {count}
                </span>
              )
            })}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onToggle}>
            {open ? 'Hide history' : 'View history'}
          </Button>
          <Button size="sm" icon={Eye} onClick={onOpenRecord}>
            Open record
          </Button>
        </div>
      </div>

      {open && <History patientId={patient._id} />}
    </Card>
  )
}

function History({ patientId }) {
  const logs = useAsync(() => doctorsApi.getAuditLogs(patientId), [patientId], { emptyOn: [404] })
  const entries = logs.data ?? []

  if (logs.loading) {
    return (
      <div className="border-t border-ink-600/60 p-5">
        <SkeletonCards count={1} />
      </div>
    )
  }

  if (logs.error) {
    return (
      <div className="border-t border-ink-600/60 p-5">
        <ErrorState error={logs.error} onRetry={logs.refetch} />
      </div>
    )
  }

  return (
    <div className="border-t border-ink-600/60">
      <div className="p-5 pb-0">
        <CardHeader title="What you did" subtitle="Newest first." icon={Clock} />
      </div>

      <ol className="divide-y divide-ink-600/40">
        {entries.map((log) => {
          const meta = AUDIT_ACTIONS[log.action]
          const Icon = ACTION_ICONS[log.action] ?? Activity

          return (
            <li key={log._id} className="flex items-start gap-4 p-5">
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                  meta?.tone ?? 'bg-white/6 text-slate-300 ring-1 ring-inset ring-white/10'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{meta?.label ?? log.action}</p>
                <p className="mt-1 text-sm text-slate-400">{meta?.description ?? ''}</p>
              </div>

              <span className="shrink-0 whitespace-nowrap text-xs text-slate-500">
                {formatDateTime(log.createdAt)}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
