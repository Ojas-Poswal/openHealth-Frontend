import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FileUp, Plus, RotateCw } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import CaseDetailView from '../../components/timeline/CaseDetailView.jsx'
import CaseStatusBadge from '../../components/patient/CaseStatusBadge.jsx'
import CaseStatusModal from '../../components/patient/CaseStatusModal.jsx'
import ReportUploadModal from '../../components/reports/ReportUploadModal.jsx'
import ReportEditModal from '../../components/reports/ReportEditModal.jsx'
import { PageSpinner } from '../../components/ui/Spinner.jsx'
import { useTimeline } from '../../hooks/useTimeline.js'
import { useToast } from '../../context/ToastContext.jsx'
import { medicalCasesApi } from '../../api/medicalCases.api.js'
import { reportsApi } from '../../api/reports.api.js'
import { findEntry } from '../../utils/timeline.js'
import { formatDate } from '../../utils/format.js'

/**
 * A single case — the detail behind one card on the timeline.
 *
 * The timeline payload already carries the case together with every report,
 * note and prescription attached to it, so this page reads from the same
 * source rather than fanning out into several requests.
 */
export default function MedicalCaseDetailPage() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const timeline = useTimeline()

  const [uploading, setUploading] = useState(false)
  const [editingReport, setEditingReport] = useState(null)
  const [deletingReport, setDeletingReport] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [editError, setEditError] = useState(null)

  const entry = useMemo(
    () => (timeline.data ? findEntry(timeline.data, caseId) : null),
    [timeline.data, caseId],
  )

  const medicalCase = entry?.medicalCase

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
    setDeleting(true)
    try {
      await reportsApi.remove(deletingReport._id)
      toast.success('Report deleted.')
      setDeletingReport(null)
      timeline.refresh()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setDeleting(false)
    }
  }

  const handleStatus = async (id, status) => {
    try {
      await medicalCasesApi.updateCaseStatus(id, status)
      toast.success(`Case marked as ${status}.`)
      timeline.refresh()
      return true
    } catch (error) {
      toast.error(error.message)
      return false
    }
  }

  if (timeline.loading) return <PageSpinner label="Opening this case…" />

  if (timeline.error) {
    return (
      <>
        <BackLink />
        <ErrorState error={timeline.error} onRetry={timeline.refetch} />
      </>
    )
  }

  if (!medicalCase) {
    return (
      <>
        <BackLink />
        <EmptyState
          icon={FileUp}
          title="Case not found"
          message="This case is not on your timeline. It may have been removed, or the link may be wrong."
          action={
            <Button onClick={() => navigate('/app/timeline')}>Back to my timeline</Button>
          }
        />
      </>
    )
  }

  return (
    <>
      <BackLink />

      <PageHeader
        breadcrumb={
          <div className="flex flex-wrap items-center gap-2">
            <CaseStatusBadge status={medicalCase.status} size="sm" />
            <span className="text-xs text-slate-500">
              Diagnosed {formatDate(medicalCase.diagnosedAt || medicalCase.createdAt)}
            </span>
          </div>
        }
        title={medicalCase.diagnosis}
        description={medicalCase.verdict ? undefined : 'No verdict recorded yet.'}
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
            <Button variant="secondary" onClick={() => setStatusOpen(true)}>
              Update status
            </Button>
            <Button icon={Plus} onClick={() => setUploading(true)}>
              Upload report
            </Button>
          </>
        }
      />

      <CaseDetailView
        entry={entry}
        canManageReports
        onUploadReport={() => setUploading(true)}
        onEditReport={setEditingReport}
        onDeleteReport={setDeletingReport}
      />

      <ReportUploadModal
        open={uploading}
        medicalCase={medicalCase}
        onClose={() => {
          setUploading(false)
          setUploadError(null)
        }}
        onSubmit={handleUpload}
        error={uploadError}
      />

      <ReportEditModal
        open={Boolean(editingReport)}
        report={editingReport}
        onClose={() => {
          setEditingReport(null)
          setEditError(null)
        }}
        onSubmit={handleEdit}
        error={editError}
      />

      <ConfirmDialog
        open={Boolean(deletingReport)}
        onClose={() => setDeletingReport(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this report?"
        confirmLabel="Delete report"
        message={`“${deletingReport?.reportName ?? ''}” and any doctor notes filed against it will be removed from this case. This cannot be undone.`}
      />

      <CaseStatusModal
        open={statusOpen}
        medicalCase={medicalCase}
        onClose={() => setStatusOpen(false)}
        onSubmit={handleStatus}
      />
    </>
  )
}

function BackLink() {
  return (
    <Link
      to="/app/timeline"
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-brand-300"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to timeline
    </Link>
  )
}
