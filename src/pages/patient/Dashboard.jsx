import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  FileText,
  FolderHeart,
  Lock,
  Plus,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import Card, { CardHeader } from '../../components/ui/Card.jsx'
import StatTile from '../../components/ui/StatTile.jsx'
import Meter from '../../components/ui/Meter.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import Alert from '../../components/ui/Alert.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { SkeletonStats, SkeletonCards } from '../../components/ui/Skeleton.jsx'
import MedicalCaseCard from '../../components/patient/MedicalCaseCard.jsx'
import CaseFormModal from '../../components/patient/CaseFormModal.jsx'
import CaseStatusModal from '../../components/patient/CaseStatusModal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useTimeline } from '../../hooks/useTimeline.js'
import { useAsync } from '../../hooks/useAsync.js'
import { medicalCasesApi } from '../../api/medicalCases.api.js'
import { patientsApi } from '../../api/patients.api.js'
import { familyApi } from '../../api/family.api.js'
import { digitalWillApi } from '../../api/digitalWill.api.js'
import { aiSummaryApi } from '../../api/aiSummary.api.js'
import { countStats, sortByRecency } from '../../utils/timeline.js'
import { ageFrom, completion, formatDateTime } from '../../utils/format.js'

export default function Dashboard() {
  const { patient, patientId } = useAuth()
  const toast = useToast()

  const timeline = useTimeline()
  const consents = useAsync(() => patientsApi.getMyConsents(), [])
  const groups = useAsync(() => familyApi.listMyGroups(), [], { emptyOn: [404] })
  const will = useAsync(() => digitalWillApi.getMine(), [], { emptyOn: [404] })
  const summary = useAsync(() => aiSummaryApi.get(patientId), [patientId], {
    immediate: Boolean(patientId),
    emptyOn: [404],
  })

  const [creating, setCreating] = useState(false)
  const [statusTarget, setStatusTarget] = useState(null)
  const [formError, setFormError] = useState(null)

  const stats = countStats(timeline.data ?? [])
  const recent = sortByRecency(timeline.data ?? []).slice(0, 3)
  const activeConsents = (consents.data ?? []).filter((consent) => consent.accessGranted)

  const profileCompletion = completion([
    patient?.fullName,
    patient?.email,
    patient?.phone,
    patient?.dateOfBirth,
    patient?.gender,
    patient?.bloodGroup,
    patient?.allergies,
  ])

  const firstName = patient?.fullName?.split(' ')[0] ?? 'there'

  const handleCreate = async (payload) => {
    setFormError(null)
    try {
      await medicalCasesApi.create(payload)
      toast.success('Case added to your timeline.')
      setCreating(false)
      timeline.refresh()
      return true
    } catch (error) {
      setFormError(error)
      return false
    }
  }

  const handleStatus = async (caseId, status) => {
    try {
      await medicalCasesApi.updateCaseStatus(caseId, status)
      toast.success(`Case marked as ${status}.`)
      timeline.refresh()
      return true
    } catch (error) {
      toast.error(error.message)
      return false
    }
  }

  return (
    <>
      <PageHeader
        title={`Hello, ${firstName}`}
        description="Everything openHealth is holding for you, and what changed recently."
        actions={
          <>
            <Link to="/app/timeline">
              <Button variant="secondary" icon={Activity}>
                View timeline
              </Button>
            </Link>
            <Button icon={Plus} onClick={() => setCreating(true)}>
              Add a case
            </Button>
          </>
        }
      />

      {/* KPI row */}
      {timeline.loading ? (
        <SkeletonStats />
      ) : timeline.error ? (
        <ErrorState error={timeline.error} onRetry={timeline.refetch} compact />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Cases on record"
            value={stats.cases}
            icon={FolderHeart}
            tone="brand"
            hint={stats.cases ? `${stats.resolved} resolved · ${stats.active} active` : 'Add your first case to begin'}
            to="/app/cases"
          />
          <StatTile
            label="Reports stored"
            value={stats.reports}
            icon={FileText}
            tone="royal"
            hint="Blood tests, scans and prescriptions"
            to="/app/reports"
          />
          <StatTile
            label="Medicines prescribed"
            value={stats.medicines}
            icon={Sparkles}
            tone="mint"
            hint={`Across ${stats.prescriptions} prescription${stats.prescriptions === 1 ? '' : 's'}`}
            to="/app/timeline"
          />
          <StatTile
            label="Doctors with access"
            value={activeConsents.length}
            icon={ShieldCheck}
            tone={activeConsents.length ? 'amber' : 'slate'}
            hint={activeConsents.length ? 'Revoke anytime from Consents' : 'No active consent sessions'}
            to="/app/consents"
          />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Recent cases */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-white">Recent cases</h2>
            {stats.cases > 3 && (
              <Link to="/app/timeline" className="inline-flex items-center gap-1 text-sm font-medium text-brand-300 hover:text-brand-200">
                All {stats.cases} cases
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {timeline.loading ? (
            <SkeletonCards count={2} />
          ) : timeline.error ? (
            <ErrorState error={timeline.error} onRetry={timeline.refetch} />
          ) : recent.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="Your timeline is empty"
              message="Add the first diagnosis and openHealth will keep its reports, prescriptions and advice together from here on."
              action={
                <Button icon={Plus} onClick={() => setCreating(true)}>
                  Add your first case
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {recent.map((entry) => (
                <MedicalCaseCard
                  key={entry.medicalCase._id}
                  entry={entry}
                  to={`/app/cases/${entry.medicalCase._id}`}
                  canManage
                  onChangeStatus={setStatusTarget}
                />
              ))}
            </div>
          )}
        </section>

        {/* Side column */}
        <aside className="space-y-5">
          <Card>
            <CardHeader
              title="Profile completeness"
              subtitle="Doctors read this before your appointment."
              icon={UserCog}
              actions={
                <Link to="/app/profile">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
              }
            />
            <div className="mt-4">
              <Meter
                value={profileCompletion.completed}
                max={profileCompletion.total}
                label={`${profileCompletion.completed} of ${profileCompletion.total} details`}
                hint={
                  profileCompletion.percent === 100
                    ? 'Your profile is complete.'
                  : 'Add the missing details so a new doctor has the full picture.'
                }
              />
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-ink-600/60 pt-4 text-sm">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">OpenHealth ID</dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-300">{patient?.ohid ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Age</dt>
                <dd className="mt-1 text-slate-300">{ageFrom(patient?.dateOfBirth) ?? '—'}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader
              title="AI summary"
              subtitle="A few lines a doctor can read in seconds."
              icon={Sparkles}
            />
            <div className="mt-4">
              {summary.loading ? (
                <p className="text-sm text-slate-500">Checking for a saved summary…</p>
              ) : summary.data ? (
                <>
                  <p className="line-clamp-4 text-sm leading-relaxed text-slate-300">
                    {summary.data.summary}
                  </p>
                  <p className="mt-3 text-xs text-slate-500">
                    Generated {formatDateTime(summary.data.generatedAt)}
                  </p>
                </>
              ) : (
                <p className="text-sm leading-relaxed text-slate-400">
                  No summary yet. Generate one once your timeline has a case or two — it pulls only
                  what is already on your timeline.
                </p>
              )}
            </div>
            <div className="mt-4">
              <Link to="/app/ai-summary">
                <Button variant="secondary" size="sm" fullWidth>
                  {summary.data ? 'Open summary' : 'Generate a summary'}
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader title="Family" subtitle="Who can see your timeline." icon={Users} />
            <div className="mt-4 space-y-2.5">
              {groups.loading ? (
                <p className="text-sm text-slate-500">Loading groups…</p>
              ) : groups.data?.length ? (
                groups.data.slice(0, 3).map((group) => (
                  <div key={group._id} className="flex items-center justify-between gap-3 rounded-xl bg-ink-900/50 px-3.5 py-2.5">
                    <span className="truncate text-sm text-slate-200">{group.groupName}</span>
                    <Badge tone="brand" size="sm">
                      {group.members?.length ?? 0}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-relaxed text-slate-400">
                  You are not in a family group yet. Group members can view each other&rsquo;s timelines.
                </p>
              )}
            </div>
            <div className="mt-4">
              <Link to="/app/family">
                <Button variant="secondary" size="sm" fullWidth icon={Users}>
                  Manage family
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader title="Digital will" subtitle="Locked to you alone." icon={Lock} />
            <div className="mt-4">
              {will.loading ? (
                <p className="text-sm text-slate-500">Checking…</p>
              ) : will.data ? (
                <Alert tone={will.data.isUnlocked ? 'warning' : 'success'}>
                  {will.data.isUnlocked
                    ? 'Your will has been unlocked by a family admin after a death certificate was approved.'
                    : `Your will is created with ${will.data.sections?.length ?? 0} sections. Only you can read it.`}
                </Alert>
              ) : (
                <p className="text-sm leading-relaxed text-slate-400">
                  Store insurance, property and account details so your family can find them when it
                  matters — without seeing them before then.
                </p>
              )}
            </div>
            <div className="mt-4">
              <Link to="/app/digital-will">
                <Button variant="secondary" size="sm" fullWidth icon={ScrollText}>
                  {will.data ? 'Open digital will' : 'Create my digital will'}
                </Button>
              </Link>
            </div>
          </Card>
        </aside>
      </div>

      <CaseFormModal
        open={creating}
        onClose={() => {
          setCreating(false)
          setFormError(null)
        }}
        onSubmit={handleCreate}
        loading={false}
        error={formError}
      />

      <CaseStatusModal
        open={Boolean(statusTarget)}
        medicalCase={statusTarget}
        onClose={() => setStatusTarget(null)}
        onSubmit={handleStatus}
      />
    </>
  )
}
