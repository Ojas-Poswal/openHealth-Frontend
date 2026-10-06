import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, FolderHeart, Plus, RotateCw, Search } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Badge from '../../components/ui/Badge.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import { SkeletonCards } from '../../components/ui/Skeleton.jsx'
import ReportCard from '../../components/reports/ReportCard.jsx'
import ReportUploadModal from '../../components/reports/ReportUploadModal.jsx'
import ReportEditModal from '../../components/reports/ReportEditModal.jsx'
import { useTimeline } from '../../hooks/useTimeline.js'
import { useToast } from '../../context/ToastContext.jsx'
import { reportsApi } from '../../api/reports.api.js'
import { flattenReports } from '../../utils/timeline.js'
import { REPORT_TYPE_OPTIONS } from '../../utils/constants.js'

/**
 * Every report on the record, in one place.
 *
 * There is no "all reports" endpoint — reports are fetched per case — so this
 * screen derives the list from the timeline payload, which already contains
 * every report with the case it belongs to.
 */
export default function ReportsPage() {
  const timeline = useTimeline()
  const toast = useToast()

  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deletingBusy, setDeletingBusy] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [editError, setEditError] = useState(null)

  const rows = useMemo(() => flattenReports(timeline.data ?? []), [timeline.data])
  const cases = useMemo(
    () => (timeline.data ?? []).map((entry) => entry.medicalCase).filter(Boolean),
    [timeline.data],
  )
  const caseById = useMemo(
    () => new Map(cases.map((medicalCase) => [medicalCase._id, medicalCase])),
    [cases],
  )

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return rows.filter(({ report }) => {
      if (typeFilter && report.reportType !== typeFilter) return false
      if (!needle) return true
      return [report.reportName, report.reportType, report.fileType]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    })
  }, [rows, query, typeFilter])

  const handleUpload = async (payload) => {
    setUploadError(null)
    try {
      await reportsApi.create(payload)
      toast.success('Report uploaded.')
      timeline.refresh()
      return true
    } catch (error) {
      setUploadError(error)
      return false
    }
  }

  const handleEdit = async (reportId, values) => {
    setEditError(null)
    try {
      await reportsApi.update(reportId, values)
      toast.success('Report updated.')
      timeline.refresh()
      return true
    } catch (error) {
      setEditError(error)
      return false
    }
  }

  const handleDelete = async () => {
    setDeletingBusy(true)
    try {
      await reportsApi.remove(deleting.report._id)
      toast.success('Report deleted.')
      setDeleting(null)
      timeline.refresh()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setDeletingBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Reports"
        description="Every file on your record, newest first — each one still attached to the case it belongs to."
        actions={
          <>
            <Button
              variant="ghost"
              icon={RotateCw}
              onClick={timeline.refresh}
              loading={timeline.refreshing}
            >
              Refresh
            </Button>
            <Button
              icon={Plus}
              onClick={() => setUploading(true)}
              disabled={cases.length === 0}
              title={cases.length === 0 ? 'Add a medical case first' : undefined}
            >
              Upload report
            </Button>
          </>
        }
      />

      {rows.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search reports…"
              className="pl-10"
              aria-label="Search reports"
            />
          </div>

          <div className="w-full sm:w-52">
            <Select
              options={REPORT_TYPE_OPTIONS}
              placeholder="All report types"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              aria-label="Filter by report type"
            />
          </div>

          <span className="text-sm text-slate-500">
            {visible.length} of {rows.length} report{rows.length === 1 ? '' : 's'}
          </span>
        </div>
      )}

      {timeline.loading ? (
        <SkeletonCards count={3} />
      ) : timeline.error ? (
        <ErrorState error={timeline.error} onRetry={timeline.refetch} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No reports yet"
          message={
            cases.length === 0
              ? 'Reports are stored inside medical cases, so add a case first and then upload its files.'
              : 'Upload a blood test, scan or prescription and it will be kept with its case forever.'
          }
          action={
            cases.length === 0 ? (
              <Link to="/app/timeline">
                <Button icon={FolderHeart}>Go to my timeline</Button>
              </Link>
            ) : (
              <Button icon={Plus} onClick={() => setUploading(true)}>
                Upload your first report
              </Button>
            )
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nothing matches"
          message="No reports match the current search or type filter."
          compact
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery('')
                setTypeFilter('')
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {visible.map(({ report, medicalCase, doctorNotes }) => (
            <div key={report._id}>
              <Link
                to={`/app/cases/${medicalCase?._id}`}
                className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-slate-400 transition hover:text-brand-300"
              >
                <FolderHeart className="h-3.5 w-3.5" />
                {medicalCase?.diagnosis ?? 'Unlinked case'}
                <Badge tone="neutral" size="sm">
                  {doctorNotes.length} note{doctorNotes.length === 1 ? '' : 's'}
                </Badge>
              </Link>
              <ReportCard
                report={report}
                notes={doctorNotes}
                canManage
                onEdit={setEditing}
                onDelete={(target) => setDeleting({ report: target, medicalCase })}
              />
            </div>
          ))}
        </div>
      )}

      <ReportUploadModal
        open={uploading}
        cases={cases}
        onClose={() => {
          setUploading(false)
          setUploadError(null)
        }}
        onSubmit={handleUpload}
        error={uploadError}
      />

      <ReportEditModal
        open={Boolean(editing)}
        report={editing}
        onClose={() => {
          setEditing(null)
          setEditError(null)
        }}
        onSubmit={handleEdit}
        error={editError}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingBusy}
        title="Delete this report?"
        confirmLabel="Delete report"
        message={`“${deleting?.report?.reportName ?? ''}” will be removed from “${
          caseById.get(deleting?.report?.medicalCaseId)?.diagnosis ?? deleting?.medicalCase?.diagnosis ?? 'its case'
        }”. This cannot be undone.`}
      />
    </>
  )
}
