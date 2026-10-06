import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderHeart, Plus, RotateCw, Search } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Tabs from '../../components/ui/Tabs.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { SkeletonCards } from '../../components/ui/Skeleton.jsx'
import MedicalCaseCard from '../../components/patient/MedicalCaseCard.jsx'
import CaseFormModal from '../../components/patient/CaseFormModal.jsx'
import CaseStatusModal from '../../components/patient/CaseStatusModal.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useToast } from '../../context/ToastContext.jsx'
import { medicalCasesApi } from '../../api/medicalCases.api.js'

/**
 * The case list.
 *
 * Unlike the timeline, this screen does not need the nested reports and
 * prescriptions — so it uses the three lean case endpoints the backend
 * exposes: /my-cases, /active-cases and /resolved-cases.
 */
const SOURCES = {
  all: { label: 'All cases', load: () => medicalCasesApi.listMine() },
  active: { label: 'Active', load: () => medicalCasesApi.getActive() },
  resolved: { label: 'Resolved', load: () => medicalCasesApi.getResolved() },
}

export default function Cases() {
  const toast = useToast()
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [statusTarget, setStatusTarget] = useState(null)
  const [formError, setFormError] = useState(null)

  const cases = useAsync(() => SOURCES[tab].load(), [tab])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const list = cases.data ?? []
    if (!needle) return list
    return list.filter((medicalCase) =>
      [medicalCase.diagnosis, medicalCase.verdict, medicalCase.finalAdvice, ...(medicalCase.tags ?? [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    )
  }, [cases.data, query])

  const handleCreate = async (payload) => {
    setFormError(null)
    try {
      await medicalCasesApi.create(payload)
      toast.success('Case added.')
      setCreating(false)
      cases.refresh()
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
      cases.refresh()
      return true
    } catch (error) {
      toast.error(error.message)
      return false
    }
  }

  return (
    <>
      <PageHeader
        title="Medical cases"
        description="Every diagnosis on your record. Filter by status, or open one to see its reports and prescriptions."
        actions={
          <>
            <Button
              variant="ghost"
              icon={RotateCw}
              onClick={cases.refresh}
              loading={cases.refreshing}
            >
              Refresh
            </Button>
            <Button icon={Plus} onClick={() => setCreating(true)}>
              Add a case
            </Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Tabs
          tabs={Object.entries(SOURCES).map(([value, source]) => ({ value, label: source.label }))}
          value={tab}
          onChange={setTab}
        />

        <div className="relative ml-auto w-full sm:w-72">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search cases…"
            className="pl-10"
            aria-label="Search cases"
          />
        </div>
      </div>

      {cases.loading ? (
        <SkeletonCards count={3} />
      ) : cases.error ? (
        <ErrorState error={cases.error} onRetry={cases.refetch} />
      ) : (cases.data ?? []).length === 0 ? (
        <EmptyState
          icon={FolderHeart}
          title={tab === 'all' ? 'No cases yet' : `No ${tab} cases`}
          message={
            tab === 'all'
              ? 'A case is one illness, from diagnosis to resolution. Add one and its reports and prescriptions will live inside it.'
              : `Nothing on your record is currently marked as ${tab}.`
          }
          action={
            tab === 'all' ? (
              <Button icon={Plus} onClick={() => setCreating(true)}>
                Add your first case
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => setTab('all')}>
                See all cases
              </Button>
            )
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nothing matches"
          message={`No ${tab === 'all' ? '' : `${tab} `}cases match “${query}”.`}
          compact
          action={
            <Button variant="secondary" onClick={() => setQuery('')}>
              Clear search
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((medicalCase) => (
            <MedicalCaseCard
              key={medicalCase._id}
              entry={{ medicalCase }}
              to={`/app/cases/${medicalCase._id}`}
              canManage
              onChangeStatus={setStatusTarget}
            />
          ))}
        </div>
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
