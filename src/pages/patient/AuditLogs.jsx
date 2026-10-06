import { useMemo, useState } from 'react'
import {
  Activity,
  Clock,
  Eye,
  KeyRound,
  LogOut,
  RotateCw,
  Search,
  ShieldCheck,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import Card, { CardHeader } from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Alert from '../../components/ui/Alert.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import { SkeletonCards } from '../../components/ui/Skeleton.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { patientsApi } from '../../api/patients.api.js'
import { AUDIT_ACTIONS } from '../../utils/constants.js'
import { formatDateTime } from '../../utils/format.js'

const ACTION_ICONS = {
  CONSENT_REQUESTED: KeyRound,
  CONSENT_GRANTED: ShieldCheck,
  TIMELINE_VIEWED: Eye,
  SESSION_ENDED: LogOut,
}

/**
 * The audit log — every time a doctor touched this record.
 *
 * The backend writes one entry per consent request, consent grant, timeline
 * view and session end, and populates only the doctor's name and DHID.
 */
export default function AuditLogs() {
  const logs = useAsync(() => patientsApi.getAuditLogs(), [], { emptyOn: [404] })

  const [actionFilter, setActionFilter] = useState('')
  const [query, setQuery] = useState('')

  const rows = logs.data ?? []

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return rows.filter((log) => {
      if (actionFilter && log.action !== actionFilter) return false
      if (!needle) return true
      return [log.doctorId?.fullName, log.doctorId?.dhid, AUDIT_ACTIONS[log.action]?.label]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    })
  }, [rows, actionFilter, query])

  const counts = useMemo(() => {
    const tally = {}
    rows.forEach((log) => {
      tally[log.action] = (tally[log.action] ?? 0) + 1
    })
    return tally
  }, [rows])

  return (
    <>
      <PageHeader
        title="Audit log"
        description="Every request, view and session end on your record — written by the backend, not by this app."
        actions={
          <Button
            variant="ghost"
            icon={RotateCw}
            onClick={logs.refresh}
            loading={logs.refreshing}
          >
            Refresh
          </Button>
        }
      />

      {!logs.loading && !logs.error && rows.length > 0 && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(AUDIT_ACTIONS).map(([action, meta]) => {
              const Icon = ACTION_ICONS[action] ?? Activity
              return (
                <div key={action} className="surface p-4">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-soft ring-1 ring-inset ring-brand-400/20">
                    <Icon className="h-4 w-4 text-brand-300" aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-2xl font-semibold leading-none text-white">
                    {counts[action] ?? 0}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-400">{meta.label}</p>
                </div>
              )
            })}
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by doctor or DHID…"
                className="pl-10"
                aria-label="Search the audit log"
              />
            </div>

            <div className="w-full sm:w-56">
              <Select
                options={Object.entries(AUDIT_ACTIONS).map(([value, meta]) => ({
                  value,
                  label: meta.label,
                }))}
                placeholder="All actions"
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value)}
                aria-label="Filter by action"
              />
            </div>

            <span className="text-sm text-slate-500">
              {visible.length} of {rows.length} entr{rows.length === 1 ? 'y' : 'ies'}
            </span>
          </div>
        </>
      )}

      {logs.loading ? (
        <SkeletonCards count={2} />
      ) : logs.error ? (
        <ErrorState error={logs.error} onRetry={logs.refetch} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Nothing has happened yet"
          message="When a doctor requests consent, verifies a code or opens your timeline, the entry appears here — permanently and in order."
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nothing matches"
          message="No audit entry matches the current search or action filter."
          compact
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery('')
                setActionFilter('')
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <Card padded={false}>
          <div className="border-b border-ink-600/60 p-5">
            <CardHeader
              title="Activity"
              subtitle="Newest first."
              icon={Clock}
            />
          </div>

          <ol className="divide-y divide-ink-600/40">
            {visible.map((log) => {
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
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-white">
                        {meta?.label ?? log.action}
                      </p>
                      {log.doctorId?.dhid && (
                        <Badge tone="neutral" size="sm">
                          {log.doctorId.dhid}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      {log.doctorId?.fullName ?? 'A doctor'}
                      {meta?.description ? ` — ${meta.description}` : ''}
                    </p>
                  </div>

                  <span className="shrink-0 whitespace-nowrap text-xs text-slate-500">
                    {formatDateTime(log.createdAt)}
                  </span>
                </li>
              )
            })}
          </ol>
        </Card>
      )}

      <Alert tone="info" className="mt-6">
        To revoke a doctor's access, use the Doctor access page.
      </Alert>
    </>
  )
}
