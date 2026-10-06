import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  LogOut,
  Pill,
  RotateCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import { SkeletonCards } from '../../components/ui/Skeleton.jsx'
import TimelineList from '../../components/timeline/TimelineList.jsx'
import CaseDetailView from '../../components/timeline/CaseDetailView.jsx'
import MedicalCaseCard from '../../components/patient/MedicalCaseCard.jsx'
import PrescriptionFormModal from '../../components/prescriptions/PrescriptionFormModal.jsx'
import DoctorNoteModal from '../../components/notes/DoctorNoteModal.jsx'
import ConsentGate from '../../components/doctor/ConsentGate.jsx'
import { useDoctorAuth } from '../../context/DoctorAuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { doctorsApi } from '../../api/doctors.api.js'
import { prescriptionsApi } from '../../api/prescriptions.api.js'
import { doctorNotesApi } from '../../api/doctorNotes.api.js'
import { countStats, sortByRecency } from '../../utils/timeline.js'
import { formatDateTime } from '../../utils/format.js'

/**
 * A patient's record, opened under consent.
 *
 * Read-only except for the two things a doctor is allowed to add: a
 * prescription into a case, and a note against a report. Every fetch of the
 * timeline writes a TIMELINE_VIEWED entry into the patient's audit log, so
 * this page deliberately does not poll.
 */
export default function DoctorPatientTimeline() {
  const { patientId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { doctor } = useDoctorAuth()
  const toast = useToast()

  const [passedPatient] = useState(() => location.state?.patient ?? null)
  const [endingSession, setEndingSession] = useState(false)
  const [ending, setEnding] = useState(false)

  const sessions = useAsync(() => doctorsApi.getActiveSessions(), [], { emptyOn: [404] })
  const timeline = useAsync(() => doctorsApi.getPatientTimeline(patientId), [patientId])

  const session = useMemo(
    () =>
      (sessions.data ?? []).find((item) => String(item.patientId?._id) === String(patientId)) ?? null,
    [sessions.data, patientId],
  )

  const patient = session?.patientId ?? passedPatient
  const entries = useMemo(() => sortByRecency(timeline.data ?? []), [timeline.data])
  const stats = countStats(entries)

  const noConsent = timeline.error?.status === 403

  const handleGranted = () => {
    timeline.refetch()
    sessions.refetch()
  }

  const handleEndSession = async () => {
    setEnding(true)
    try {
      await doctorsApi.endSession(patientId)
      toast.success('Session ended. Access to this record is closed.')
      setEndingSession(false)
      sessions.refetch()
      timeline.refetch()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setEnding(false)
    }
  }

  const reload = () => {
    timeline.refetch()
    sessions.refetch()
  }

  const backLink = (
    <Link
      to="/doctor/sessions"
      className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-brand-300"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to my sessions
    </Link>
  )

  return (
    <>
      {backLink}

      <PageHeader
        breadcrumb={
          <div className="flex flex-wrap items-center gap-2">
            {patient?.ohid && (
              <Badge tone="neutral" size="sm" className="font-mono">
                {patient.ohid}
              </Badge>
            )}
            {session ? (
              <Badge tone="mint" size="sm" icon={ShieldCheck}>
                Consent active
              </Badge>
            ) : (
              <Badge tone="amber" size="sm" icon={AlertTriangle}>
                No consent
              </Badge>
            )}
          </div>
        }
        title={patient?.fullName ?? "Patient's record"}
        description={
          session
            ? `Session opened ${formatDateTime(session.createdAt)}. Every view is written to their audit log.`
            : 'Access to this record has not been granted.'
        }
        actions={
          <>
            <Button variant="ghost" icon={RotateCw} onClick={reload} loading={timeline.refreshing}>
              Refresh
            </Button>
            {session && (
              <Button variant="danger" icon={LogOut} onClick={() => setEndingSession(true)}>
                End session
              </Button>
            )}
          </>
        }
      />

      {/* --- Consent gate -------------------------------------------------- */}
      {noConsent ? (
        <ConsentGate
          patientId={patientId}
          patientName={patient?.fullName}
          onGranted={handleGranted}
        />
      ) : timeline.error ? (
        <ErrorState error={timeline.error} onRetry={timeline.refetch} />
      ) : timeline.loading ? (
        <SkeletonCards count={2} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="This patient has no records yet"
          message="They have not added a medical case, so there is nothing on their timeline. You can still write a prescription once a case exists."
        />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Badge tone="brand" size="sm">
              {stats.cases} case{stats.cases === 1 ? '' : 's'}
            </Badge>
            <Badge tone="neutral" size="sm">
              {stats.active} active
            </Badge>
            <Badge tone="neutral" size="sm">
              {stats.resolved} resolved
            </Badge>
            <Badge tone="neutral" size="sm">
              {stats.reports} report{stats.reports === 1 ? '' : 's'}
            </Badge>
            <Badge tone="neutral" size="sm">
              {stats.medicines} medicine{stats.medicines === 1 ? '' : 's'}
            </Badge>
          </div>

          <TimelineList
            timeline={entries}
            emptyTitle="No records"
            renderCard={(entry) => (
              <DoctorCaseEntry
                key={entry.medicalCase?._id}
                entry={entry}
                doctorName={doctor?.fullName}
                onChanged={timeline.refresh}
              />
            )}
          />
        </>
      )}

      <ConfirmDialog
        open={endingSession}
        onClose={() => setEndingSession(false)}
        onConfirm={handleEndSession}
        loading={ending}
        title="End this session?"
        confirmLabel="End session"
        message="Access to this record closes immediately and the patient's audit log records that the session ended. Opening it again needs a fresh consent code."
      />
    </>
  )
}

/**
 * One case on a consented timeline: read-only, with the two write actions a
 * doctor is allowed — a prescription into the case, and a note on a report.
 */
function DoctorCaseEntry({ entry, doctorName, onChanged }) {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [prescribing, setPrescribing] = useState(false)
  const [noteTarget, setNoteTarget] = useState(null)
  const [prescriptionError, setPrescriptionError] = useState(null)
  const [noteError, setNoteError] = useState(null)

  const medicalCase = entry.medicalCase

  const handlePrescription = async (medicalCaseId, medicines) => {
    setPrescriptionError(null)
    try {
      await prescriptionsApi.create(medicalCaseId, medicines)
      toast.success('Prescription added to the timeline.')
      onChanged()
      return true
    } catch (error) {
      setPrescriptionError(error)
      return false
    }
  }

  const handleNote = async (reportId, note) => {
    setNoteError(null)
    try {
      await doctorNotesApi.create(reportId, note)
      toast.success('Note added.')
      onChanged()
      return true
    } catch (error) {
      setNoteError(error)
      return false
    }
  }

  return (
    <div>
      <MedicalCaseCard entry={entry} />

      <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
        <Button variant="ghost" size="sm" icon={Pill} onClick={() => setPrescribing(true)}>
          Write prescription
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={open ? ChevronUp : ChevronDown}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          {open ? 'Hide records' : 'View reports & history'}
        </Button>
      </div>

      {open && (
        <div className="surface mt-2 animate-fade-in p-5">
          <CaseDetailView
            entry={entry}
            canWritePrescription
            canWriteNote
            onAddPrescription={() => setPrescribing(true)}
            onAddNote={setNoteTarget}
          />
        </div>
      )}

      <PrescriptionFormModal
        open={prescribing}
        medicalCase={medicalCase}
        doctorName={doctorName}
        onClose={() => {
          setPrescribing(false)
          setPrescriptionError(null)
        }}
        onSubmit={handlePrescription}
        error={prescriptionError}
      />

      <DoctorNoteModal
        open={Boolean(noteTarget)}
        report={noteTarget}
        onClose={() => {
          setNoteTarget(null)
          setNoteError(null)
        }}
        onSubmit={handleNote}
        error={noteError}
      />
    </div>
  )
}
