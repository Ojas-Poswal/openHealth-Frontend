import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  RotateCw,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import Card, { CardHeader } from '../../components/ui/Card.jsx'
import Alert from '../../components/ui/Alert.jsx'
import Badge from '../../components/ui/Badge.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { SkeletonCards, SkeletonText } from '../../components/ui/Skeleton.jsx'
import TimelineList from '../../components/timeline/TimelineList.jsx'
import CaseDetailView from '../../components/timeline/CaseDetailView.jsx'
import MedicalCaseCard from '../../components/patient/MedicalCaseCard.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { familyApi } from '../../api/family.api.js'
import { aiSummaryApi } from '../../api/aiSummary.api.js'
import { countStats, sortByRecency } from '../../utils/timeline.js'
import { formatDateTime } from '../../utils/format.js'

/**
 * A family member's timeline — read-only.
 *
 * Access is granted by the backend only when the signed-in patient shares a
 * group with them; otherwise GET /family/timeline/:patientId answers 403.
 * Nothing here writes: a family member can read a timeline, never change it.
 */
export default function FamilyMemberTimeline() {
  const { patientId } = useParams()

  const timeline = useAsync(() => familyApi.getMemberTimeline(patientId), [patientId])

  // The member's own name and their relationship to *this* viewer come from
  // the group list, which is the only place the backend words them for us.
  const groups = useAsync(() => familyApi.listMyGroups(), [], { emptyOn: [404] })
  const member = useMemo(() => {
    for (const group of groups.data ?? []) {
      const found = (group.members ?? []).find(
        (item) => String(item.patientId?._id ?? item.patientId) === String(patientId),
      )
      if (found) return found
    }
    return null
  }, [groups.data, patientId])

  const memberName = member?.patientId?.fullName
  const memberRelationship = member?.relationshipToMe ?? member?.relationship

  const [revealedSummary, setRevealedSummary] = useState(false)
  const summary = useAsync(() => aiSummaryApi.get(patientId), [patientId], {
    immediate: false,
    emptyOn: [404],
  })

  const entries = useMemo(() => sortByRecency(timeline.data ?? []), [timeline.data])
  const stats = countStats(entries)

  const handleRevealSummary = () => {
    setRevealedSummary(true)
    if (!summary.data) summary.refetch()
  }

  // 403 means the backend refused — normally a group the two no longer share.
  if (timeline.error?.status === 403) {
    return (
      <>
        <PageHeader title="Family member" />
        <EmptyState
          icon={ShieldAlert}
          title="You cannot view this timeline"
          message="openHealth shares a timeline only with patients who are in the same family group as you. Either you have left the group, or they have."
          action={
            <Link to="/app/family">
              <Button icon={Users}>Back to my family</Button>
            </Link>
          }
        />
      </>
    )
  }

  if (timeline.error) {
    return (
      <>
        <PageHeader title="Family member" />
        <ErrorState error={timeline.error} onRetry={timeline.refetch} />
      </>
    )
  }

  return (
    <>
      <Link
        to="/app/family"
        className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-brand-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to family
      </Link>

      <PageHeader
        title={memberName ? `${memberName}'s timeline` : "Family member's timeline"}
        description="Shared with you through your family group. Everything here is read-only."
        actions={
          <Button
            variant="ghost"
            icon={RotateCw}
            onClick={() => {
              timeline.refetch()
              if (revealedSummary) summary.refetch()
            }}
            loading={timeline.refreshing}
          >
            Refresh
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        {memberRelationship && <Badge tone="brand" size="sm">{memberRelationship}</Badge>}
        {member?.patientId?.ohid ? (
          <Badge tone="neutral" size="sm" className="font-mono">
            {member.patientId.ohid}
          </Badge>
        ) : (
          !memberName && (
            <Badge tone="neutral" size="sm" className="font-mono">
              Patient {String(patientId).length > 12 ? `…${String(patientId).slice(-8)}` : patientId}
            </Badge>
          )
        )}
        <Badge tone="neutral" size="sm">
          {stats.cases} case{stats.cases === 1 ? '' : 's'}
        </Badge>
        <Badge tone="neutral" size="sm">
          {stats.reports} report{stats.reports === 1 ? '' : 's'}
        </Badge>
        <Badge tone="neutral" size="sm">
          {stats.medicines} medicine{stats.medicines === 1 ? '' : 's'}
        </Badge>
      </div>

      <Alert tone="info" className="mb-6" title="Read-only view">
        You can read this timeline because you share a family group. You cannot add, edit or delete
        anything on it — and the digital will is never part of this view.
      </Alert>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          {timeline.loading ? (
            <SkeletonCards count={2} />
          ) : entries.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Nothing on this timeline yet"
              message="They have not added a medical case yet, so there is nothing to share."
            />
          ) : (
            <TimelineList
              timeline={entries}
              emptyTitle="Nothing on this timeline yet"
              renderCard={(entry) => <MemberCaseEntry key={entry.medicalCase?._id} entry={entry} />}
            />
          )}
        </div>

        <aside className="space-y-5">
          <Card>
            <CardHeader
              title="Their AI summary"
              subtitle="A short version of the whole timeline."
              icon={Sparkles}
              actions={
                <>
                  {revealedSummary && summary.data && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={EyeOff}
                      onClick={() => setRevealedSummary(false)}
                    >
                      Hide
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Eye}
                    onClick={handleRevealSummary}
                    loading={summary.loading}
                  >
                    {revealedSummary ? 'Reload' : 'Show summary'}
                  </Button>
                </>
              }
            />

            <div className="mt-4">
              {!revealedSummary ? (
                <div className="rounded-xl border border-dashed border-ink-600/80 bg-ink-900/40 px-5 py-8 text-center">
                  <p className="text-sm leading-relaxed text-slate-400">
                    A summary is only shown when you ask for it.
                  </p>
                </div>
              ) : summary.loading ? (
                <SkeletonText lines={4} />
              ) : summary.error ? (
                <ErrorState error={summary.error} onRetry={summary.refetch} compact />
              ) : summary.data ? (
                <div className="animate-fade-in">
                  <div className="whitespace-pre-wrap rounded-xl border border-brand-400/20 bg-brand-soft p-4 text-sm leading-relaxed text-slate-100">
                    {summary.data.summary}
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Generated {formatDateTime(summary.data.generatedAt)}
                  </p>
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-ink-600/80 bg-ink-900/40 px-5 py-8 text-center text-sm text-slate-400">
                  No summary has been generated for them yet.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Not visible to you" icon={ShieldAlert} />
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Their digital will — insurance, bank details, passwords and final wishes — stays locked.
              It only opens to the family after a death certificate has been uploaded and approved by
              a group admin.
            </p>
          </Card>
        </aside>
      </div>
    </>
  )
}

/**
 * A case on a shared timeline. The card stays scannable; the full contents
 * expand underneath on demand, read-only.
 */
function MemberCaseEntry({ entry }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <MedicalCaseCard entry={entry} />

      <div className="mt-2 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          icon={open ? ChevronUp : ChevronDown}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          {open ? 'Hide details' : 'View reports & prescriptions'}
        </Button>
      </div>

      {open && (
        <div className="surface mt-2 animate-fade-in p-5">
          <CaseDetailView entry={entry} />
        </div>
      )}
    </div>
  )
}
