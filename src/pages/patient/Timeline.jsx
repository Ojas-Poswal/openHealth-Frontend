import { useMemo, useState } from 'react'
import { Activity, Plus, RotateCw, Search } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Tabs from '../../components/ui/Tabs.jsx'
import Badge from '../../components/ui/Badge.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { SkeletonCards } from '../../components/ui/Skeleton.jsx'
import TimelineList from '../../components/timeline/TimelineList.jsx'
import MedicalCaseCard from '../../components/patient/MedicalCaseCard.jsx'
import CaseFormModal from '../../components/patient/CaseFormModal.jsx'
import CaseStatusModal from '../../components/patient/CaseStatusModal.jsx'
import { useTimeline } from '../../hooks/useTimeline.js'
import { useToast } from '../../context/ToastContext.jsx'
import { medicalCasesApi } from '../../api/medicalCases.api.js'
import { countStats, collectTags, sortByRecency } from '../../utils/timeline.js'

const FILTERS = [
  { value: 'all', label: 'Everything' },
  { value: 'active', label: 'Active' },
  { value: 'resolved', label: 'Resolved' },
]

/**
 * The openHealth timeline.
 *
 * Fetches the full timeline payload once (cases with their reports,
 * prescriptions and notes) and filters in memory — that keeps the counts on
 * each card accurate, which the leaner /active-cases and /resolved-cases
 * endpoints cannot provide.
 */
export default function Timeline() {
  const timeline = useTimeline()
  const toast = useToast()

  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState(null)
  const [creating, setCreating] = useState(false)
  const [statusTarget, setStatusTarget] = useState(null)
  const [formError, setFormError] = useState(null)

  const entries = useMemo(() => sortByRecency(timeline.data ?? []), [timeline.data])
  const stats = countStats(entries)
  const tags = useMemo(() => collectTags(entries).slice(0, 8), [entries])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return entries.filter((entry) => {
      const medicalCase = entry.medicalCase ?? {}
      if (filter !== 'all' && medicalCase.status !== filter) return false
      if (activeTag && !(medicalCase.tags ?? []).includes(activeTag)) return false
      if (!needle) return true
      return [medicalCase.diagnosis, medicalCase.verdict, medicalCase.finalAdvice, ...(medicalCase.tags ?? [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    })
  }, [entries, filter, activeTag, query])

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
        title="My timeline"
        description="Every illness, newest first — with its diagnosis, verdict, advice, reports and prescriptions held together."
        actions={
          <>
            <Button
              variant="ghost"
              icon={RotateCw}
              onClick={timeline.refresh}
              loading={timeline.refreshing}
              title="Refresh"
            >
              Refresh
            </Button>
            <Button icon={Plus} onClick={() => setCreating(true)}>
              Add a case
            </Button>
          </>
        }
      />

      {!timeline.loading && !timeline.error && entries.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Tabs
            tabs={FILTERS.map((item) => ({
              ...item,
              count:
                item.value === 'all'
                  ? stats.cases
                  : item.value === 'active'
                    ? stats.active
                    : stats.resolved,
            }))}
            value={filter}
            onChange={setFilter}
          />

          <div className="relative ml-auto w-full sm:w-72">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search diagnoses, advice, tags…"
              className="pl-10"
              aria-label="Search your timeline"
            />
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tags</span>
          {tags.map(({ tag, count }) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`transition ${activeTag === tag ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
            >
              <Badge tone={activeTag === tag ? 'brand' : 'neutral'} size="sm">
                {tag} · {count}
              </Badge>
            </button>
          ))}
          {activeTag && (
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className="text-xs font-medium text-brand-300 hover:text-brand-200"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {timeline.loading ? (
        <SkeletonCards count={3} />
      ) : timeline.error ? (
        <ErrorState error={timeline.error} onRetry={timeline.refetch} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Your timeline starts here"
          message="Add your first diagnosis. From then on, every report, prescription and piece of advice hangs off its own card — so you never have to reconstruct the story again."
          action={
            <Button icon={Plus} onClick={() => setCreating(true)}>
              Add your first case
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nothing matches"
          message="No cases match the current filter. Try a different status, tag or search term."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setFilter('all')
                setQuery('')
                setActiveTag(null)
              }}
            >
              Clear filters
            </Button>
          }
          compact
        />
      ) : (
        <TimelineList
          timeline={visible}
          renderCard={(entry) => (
            <MedicalCaseCard
              entry={entry}
              to={`/app/cases/${entry.medicalCase._id}`}
              canManage
              onChangeStatus={setStatusTarget}
            />
          )}
        />
      )}

      <CaseFormModal
        open={creating}
        onClose={() => {
          setCreating(false)
          setFormError(null)
        }}
        onSubmit={handleCreate}
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
