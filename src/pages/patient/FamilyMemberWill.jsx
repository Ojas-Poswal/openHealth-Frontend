import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  FileHeart,
  FileText,
  Heart,
  KeyRound,
  Link2,
  Lock,
  MessageSquare,
  Phone,
  RotateCw,
  ScrollText,
  ShieldCheck,
  ShieldAlert,
  StickyNote,
  Upload,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import Card, { CardHeader } from '../../components/ui/Card.jsx'
import Alert from '../../components/ui/Alert.jsx'
import Badge from '../../components/ui/Badge.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import { PageSpinner } from '../../components/ui/Spinner.jsx'
import DeathCertificateModal from '../../components/family/DeathCertificateModal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useMutation } from '../../hooks/useMutation.js'
import { digitalWillApi } from '../../api/digitalWill.api.js'
import { deathCertificatesApi } from '../../api/deathCertificates.api.js'
import { familyApi } from '../../api/family.api.js'
import { CERTIFICATE_STATUS, WILL_SECTION_META } from '../../utils/constants.js'
import { formatDateTime, isPhoneNumber, linkHref, linkLabel } from '../../utils/format.js'

const SECTION_ICONS = {
  message: MessageSquare,
  document: FileText,
  shield: ShieldCheck,
  phone: Phone,
  bank: Banknote,
  key: KeyRound,
  heart: Heart,
  note: StickyNote,
}

/**
 * A family member's digital will.
 *
 * Locked by default: GET /digital-will/family/:patientId answers 403 until a
 * family admin has approved that person's death certificate, which is what
 * flips `isUnlocked`. Because the certificate is the gate, this page also
 * surfaces the certificate's status and lets an admin upload or approve one.
 */
export default function FamilyMemberWill() {
  const { patientId } = useParams()
  const { patientId: myPatientId } = useAuth()
  const toast = useToast()

  const will = useAsync(() => digitalWillApi.getFamilyMemberWill(patientId), [patientId], {
    emptyOn: [404],
  })
  const certificate = useAsync(() => deathCertificatesApi.get(patientId), [patientId], {
    emptyOn: [404],
  })
  const groups = useAsync(() => familyApi.listMyGroups(), [], { emptyOn: [404] })

  const [uploadOpen, setUploadOpen] = useState(false)
  const [confirmApprove, setConfirmApprove] = useState(false)
  const [actionError, setActionError] = useState(null)

  const uploadCertificate = useMutation((payload) => deathCertificatesApi.upload(payload))
  const approve = useMutation(() => digitalWillApi.approveDeathCertificate(patientId))

  /** Am I an admin of a group this member belongs to? Mirrors the backend check. */
  const isAdmin = useMemo(() => {
    return (groups.data ?? []).some((group) => {
      const amAdmin = (group.admins ?? []).some((id) => String(id) === String(myPatientId))
      const sharesGroup = (group.members ?? []).some(
        (member) =>
          String(member.patientId?._id ?? member.patientId) === String(patientId),
      )
      return amAdmin && sharesGroup
    })
  }, [groups.data, myPatientId, patientId])

  /** This member's own row in the group, which carries their name. */
  const memberRow = useMemo(() => {
    for (const group of groups.data ?? []) {
      const found = (group.members ?? []).find(
        (member) => String(member.patientId?._id ?? member.patientId) === String(patientId),
      )
      if (found) return found
    }
    return null
  }, [groups.data, patientId])

  const reloadAll = () => {
    will.refetch()
    certificate.refetch()
  }

  const handleUpload = async (payload) => {
    setActionError(null)
    const result = await uploadCertificate.run(payload)
    if (!result) {
      setActionError(uploadCertificate.error)
      return false
    }
    toast.success('Certificate uploaded. A family admin still has to approve it.')
    certificate.refetch()
    return true
  }

  const handleApprove = async () => {
    setActionError(null)
    const result = await approve.run()
    if (!result) {
      setActionError(approve.error)
      setConfirmApprove(false)
      return
    }
    toast.success('Certificate approved — the will is now unlocked for the family.')
    setConfirmApprove(false)
    reloadAll()
  }

  const status = certificate.data?.status
  const statusMeta = status ? CERTIFICATE_STATUS[status] : null

  // --- Not permitted -------------------------------------------------------
  if (will.error?.status === 403) {
    const locked = will.error.message?.toLowerCase().includes('locked')
    const noCertificate = !certificate.data && !certificate.loading

    return (
      <>
        <Link
          to="/app/family"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-brand-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to family
        </Link>

        <PageHeader title="Digital will" />

        {actionError && (
          <Alert tone="error" className="mb-6" title="That did not work">
            {actionError.message}
          </Alert>
        )}

        <EmptyState
          icon={locked ? Lock : ShieldAlert}
          title={locked ? 'This will is locked' : 'You cannot view this will'}
          message={
            locked
              ? 'A digital will opens to the family only after a death certificate for its owner has been uploaded and approved by a group admin. Until then, nobody but the owner can read it.'
              : 'Only members of a shared family group can request this will, and only a group admin can approve the certificate that unlocks it.'
          }
          action={
            locked && isAdmin && certificate.data?.status === 'PENDING' ? (
              <Button icon={CheckCircle2} onClick={() => setConfirmApprove(true)} loading={approve.loading}>
                Approve the death certificate
              </Button>
            ) : null
          }
          secondaryAction={
            locked && noCertificate ? (
              <Button variant="secondary" icon={Upload} onClick={() => setUploadOpen(true)}>
                Upload a death certificate
              </Button>
            ) : (
              <Button variant="secondary" icon={FileHeart} onClick={reloadAll} loading={will.loading}>
                Check again
              </Button>
            )
          }
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader title="Death certificate" icon={ScrollText} />
            <div className="mt-4">
              {certificate.loading ? (
                <p className="text-sm text-slate-400">Checking…</p>
              ) : certificate.data ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={status === 'APPROVED' ? 'mint' : status === 'REJECTED' ? 'rose' : 'amber'}>
                      {statusMeta?.label ?? status}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      Uploaded {formatDateTime(certificate.data.createdAt ?? certificate.data.uploadedAt)}
                    </span>
                  </div>
                  {certificate.data.fileUrl && (
                    <a
                      href={certificate.data.fileUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 text-sm text-brand-300 hover:text-brand-200"
                    >
                      <Link2 className="h-4 w-4" />
                      Open the uploaded file
                    </a>
                  )}
                  {status === 'PENDING' && (
                    <p className="text-xs leading-relaxed text-slate-500">
                      A family admin must approve it before the will unlocks.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-slate-400">
                    No certificate has been uploaded for this member.
                  </p>
                  <Button variant="secondary" size="sm" icon={Upload} onClick={() => setUploadOpen(true)}>
                    Upload a certificate
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="What happens next" icon={CheckCircle2} />
            <ol className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-400">
              <li>1. Any member of the group uploads the death certificate.</li>
              <li>2. A group admin reviews and approves it.</li>
              <li>3. Approval unlocks the digital will for the whole group.</li>
            </ol>
            {!isAdmin && (
              <Alert tone="info" className="mt-4">
                You are not an admin of a group this member belongs to, so you cannot approve the
                certificate yourself.
              </Alert>
            )}
          </Card>
        </div>

        <DeathCertificateModal
          open={uploadOpen}
          member={memberRow ?? { patientId }}
          onClose={() => {
            setUploadOpen(false)
            setActionError(null)
          }}
          onSubmit={handleUpload}
          loading={uploadCertificate.loading}
          error={actionError}
        />

        <ConfirmDialog
          open={confirmApprove}
          onClose={() => setConfirmApprove(false)}
          onConfirm={handleApprove}
          loading={approve.loading}
          title="Approve this death certificate?"
          confirmLabel="Approve and unlock"
          message="Approving unlocks this member's digital will for everyone in the group. Only do this once the death has genuinely been registered — the app cannot undo it."
        />
      </>
    )
  }

  if (will.error) {
    return (
      <>
        <PageHeader title="Digital will" />
        <ErrorState error={will.error} onRetry={will.refetch} />
      </>
    )
  }

  if (will.loading) return <PageSpinner label="Opening the will…" />

  // --- No will on file -----------------------------------------------------
  if (!will.data) {
    return (
      <>
        <Link
          to="/app/family"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-brand-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to family
        </Link>

        <PageHeader title="Digital will" />

        <EmptyState
          icon={ScrollText}
          title="This member has no digital will"
          message="They have not created one, so there is nothing for the family to read — even if a death certificate is approved."
          action={
            <Button variant="secondary" icon={FileHeart} onClick={reloadAll} loading={will.loading}>
              Check again
            </Button>
          }
        />
      </>
    )
  }

  // --- Unlocked ------------------------------------------------------------
  const { sections = [], updatedAt } = will.data ?? {}

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
        title={memberRow?.patientId?.fullName ? `${memberRow.patientId.fullName}'s will` : 'Digital will'}
        description="Shared with your family group after a death certificate was approved."
        actions={
          <Button variant="ghost" icon={RotateCw} onClick={reloadAll} loading={will.refreshing}>
            Refresh
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        {memberRow?.relationshipToMe && (
          <Badge tone="brand" size="sm">
            {memberRow.relationshipToMe}
          </Badge>
        )}
        <Badge tone="amber" icon={Lock}>
          Unlocked by certificate approval
        </Badge>
        {statusMeta && <Badge tone="neutral">Certificate: {statusMeta.label}</Badge>}
        <span className="text-xs text-slate-500">Last updated {formatDateTime(updatedAt)}</span>
      </div>

      <Alert tone="warning" className="mb-6" title="Read-only">
        You can read these sections because the certificate was approved. Nothing here can be edited
        from a family account.
      </Alert>

      <div className="space-y-4">
        {sections.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No sections found"
            message="This will exists but has no sections recorded."
            compact
          />
        ) : (
          sections.map((section) => {
            const meta = WILL_SECTION_META[section.title] ?? {}
            const Icon = SECTION_ICONS[meta.icon] ?? FileText

            return (
              <Card key={section.title}>
                <CardHeader title={section.title} icon={Icon} />
                <div className="mt-4 space-y-3">
                  {section.content?.trim() ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                      {section.content}
                    </p>
                  ) : (
                    <p className="text-sm italic text-slate-500">Nothing was written here.</p>
                  )}

                  {section.links?.length > 0 && (
                    <ul className="space-y-1.5 border-t border-ink-600/50 pt-3">
                      {section.links.map((link, index) => (
                        <li key={index}>
                          <a
                            href={linkHref(link)}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-2 break-all text-sm text-brand-300 hover:text-brand-200"
                          >
                            {isPhoneNumber(link) ? (
                              <Phone className="h-4 w-4 shrink-0" />
                            ) : (
                              <Link2 className="h-4 w-4 shrink-0" />
                            )}
                            {linkLabel(link)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>
            )
          })
        )}
      </div>
    </>
  )
}
