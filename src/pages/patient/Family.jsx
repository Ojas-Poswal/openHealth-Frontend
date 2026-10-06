import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Check,
  Inbox,
  Plus,
  RotateCw,
  Users,
  X,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import Card, { CardHeader } from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Alert from '../../components/ui/Alert.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import { SkeletonCards } from '../../components/ui/Skeleton.jsx'
import FamilyGroupCard from '../../components/family/FamilyGroupCard.jsx'
import CreateGroupModal from '../../components/family/CreateGroupModal.jsx'
import InviteMemberModal from '../../components/family/InviteMemberModal.jsx'
import DeathCertificateModal from '../../components/family/DeathCertificateModal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useMutation } from '../../hooks/useMutation.js'
import { familyApi } from '../../api/family.api.js'
import { deathCertificatesApi } from '../../api/deathCertificates.api.js'
import { formatDateTime } from '../../utils/format.js'

/**
 * Family groups.
 *
 * A group is created by one patient and joined by others through an OHID
 * invite. Membership is what grants access to the shared timeline — and
 * never to a digital will, which stays locked until a death certificate is
 * approved.
 */
export default function Family() {
  const { patientId } = useAuth()
  const toast = useToast()

  const groups = useAsync(() => familyApi.listMyGroups(), [], { emptyOn: [404] })
  const invites = useAsync(() => familyApi.listMyInvites(), [], { emptyOn: [404] })

  const [creating, setCreating] = useState(false)
  const [invitingTo, setInvitingTo] = useState(null)
  const [certificateFor, setCertificateFor] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [busy, setBusy] = useState(false)

  const [createError, setCreateError] = useState(null)
  const [inviteError, setInviteError] = useState(null)
  const [certificateError, setCertificateError] = useState(null)

  const createGroup = useMutation((payload) => familyApi.createGroup(payload.groupName))
  const inviteMember = useMutation((payload) => familyApi.inviteMember(payload))
  const uploadCertificate = useMutation((payload) => deathCertificatesApi.upload(payload))
  const rejectInvite = useMutation((inviteId) => familyApi.rejectInvite(inviteId))
  const groupList = groups.data ?? []
  const inviteList = invites.data ?? []

  /** Runs a group action, reports the result, and reloads the list. */
  const runGroupAction = async (action, successMessage, reload = true) => {
    setBusy(true)
    try {
      await action()
      toast.success(successMessage)
      if (reload) groups.refresh()
      return true
    } catch (error) {
      toast.error(error.message)
      return false
    } finally {
      setBusy(false)
      setConfirm(null)
    }
  }

  const handleCreate = async (payload) => {
    setCreateError(null)
    const result = await createGroup.run(payload)
    if (!result) {
      setCreateError(createGroup.error)
      return false
    }
    toast.success(`“${result.groupName}” created.`)
    groups.refresh()
    return true
  }

  const handleInvite = async (payload) => {
    setInviteError(null)
    const result = await inviteMember.run(payload)
    if (!result) {
      setInviteError(inviteMember.error)
      return false
    }
    toast.success('Invite sent.')
    return true
  }

  const handleCertificate = async (payload) => {
    setCertificateError(null)
    const result = await uploadCertificate.run(payload)
    if (!result) {
      setCertificateError(uploadCertificate.error)
      return false
    }
    toast.success('Death certificate uploaded. A family admin must approve it.')
    return true
  }

  const handleAccept = async (invite) => {
    // Called directly rather than through `useMutation` — `run` resolves to
    // null on failure instead of throwing, which would report a false success.
    setBusy(true)
    try {
      await familyApi.acceptInvite(invite._id)
      toast.success(`You joined “${invite.groupId?.groupName ?? 'the group'}”.`)
      groups.refresh()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
      invites.refresh()
    }
  }

  const handleReject = async (invite) => {
    setBusy(true)
    try {
      await rejectInvite.run(invite._id)
      toast.success('Invite declined.')
      invites.refresh()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleConfirm = () => {
    if (!confirm) return
    const { kind, group, member } = confirm
    const memberId = idOf(member)

    if (kind === 'leave') {
      const others = (group.members ?? []).length > 1
      return runGroupAction(
        () => familyApi.leaveGroup(group._id),
        others ? `You left “${group.groupName}”.` : `You left, so “${group.groupName}” was deleted.`,
      )
    }
    if (kind === 'delete') {
      return runGroupAction(() => familyApi.deleteGroup(group._id), `“${group.groupName}” deleted.`)
    }
    if (kind === 'promote') {
      return runGroupAction(() => familyApi.promoteToAdmin(group._id, memberId), 'Member promoted to admin.')
    }
    if (kind === 'demote') {
      return runGroupAction(() => familyApi.demoteAdmin(group._id, memberId), 'Admin rights removed.')
    }
    if (kind === 'remove') {
      return runGroupAction(() => familyApi.removeMember(group._id, memberId), 'Member removed from the group.')
    }
  }

  const confirmCopy = {
    leave: {
      title: 'Leave this group?',
      confirmLabel: 'Leave group',
      message: (current) =>
        (current?.group?.members ?? []).length > 1
          ? 'You will lose access to the shared timelines and summaries in this group. You can only rejoin if someone invites you again.'
          : 'You are the only member, so leaving deletes the group along with any pending invites. This cannot be undone.',
    },
    delete: {
      title: 'Delete this group?',
      confirmLabel: 'Delete group',
      message:
        'The group and every pending invite in it are permanently removed. Members lose access to each other immediately.',
    },
    promote: {
      title: 'Make this member an admin?',
      confirmLabel: 'Make admin',
      message: 'Admins can invite, promote, demote and remove members, and approve death certificates.',
    },
    demote: {
      title: 'Remove admin rights?',
      confirmLabel: 'Remove admin',
      message: 'They stay in the group as a regular member and keep access to shared timelines.',
    },
    remove: {
      title: 'Remove this member?',
      confirmLabel: 'Remove member',
      message: 'They lose access to this group’s timelines and summaries straight away.',
    },
  }

  const activeConfirm = confirm ? confirmCopy[confirm.kind] : null
  const confirmMessage =
    typeof activeConfirm?.message === 'function' ? activeConfirm.message(confirm) : activeConfirm?.message

  return (
    <>
      <PageHeader
        title="Family"
        description="Groups you share your health record with. Everyone sees each other's timeline and summary — nobody sees a digital will."
        actions={
          <>
            <Button
              variant="ghost"
              icon={RotateCw}
              onClick={() => {
                groups.refetch()
                invites.refetch()
              }}
              loading={groups.refreshing || invites.refreshing}
            >
              Refresh
            </Button>
            <Button icon={Plus} onClick={() => setCreating(true)}>
              Create group
            </Button>
          </>
        }
      />

      {/* --- Pending invites ------------------------------------------- */}
      {inviteList.length > 0 && (
        <Card className="mb-6">
          <CardHeader
            title="Invitations waiting for you"
            subtitle="Accepting adds you to the group and shares your timeline with its members."
            icon={Inbox}
            actions={<Badge tone="amber">{inviteList.length} pending</Badge>}
          />
          <ul className="mt-4 space-y-3">
            {inviteList.map((invite) => (
              <li
                key={invite._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-600/70 bg-ink-900/40 p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {invite.groupId?.groupName ?? 'A family group'}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Invited by {invite.invitedBy?.fullName ?? 'a member'} ·{' '}
                    {formatDateTime(invite.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={X}
                    onClick={() => handleReject(invite)}
                    disabled={busy}
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    icon={Check}
                    onClick={() => handleAccept(invite)}
                    disabled={busy}
                  >
                    Accept
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* --- Groups ----------------------------------------------------- */}
      {groups.loading ? (
        <SkeletonCards count={2} />
      ) : groups.error ? (
        <ErrorState error={groups.error} onRetry={groups.refetch} />
      ) : groupList.length === 0 ? (
        <EmptyState
          icon={Users}
          title="You are not in a family group yet"
          message="Create a group and invite your family by their openHealth ID. Once they accept, your timelines and summaries are shared — your digital will stays private."
          action={
            <Button icon={Plus} onClick={() => setCreating(true)}>
              Create a group
            </Button>
          }
          secondaryAction={
            <Link to="/app/profile">
              <Button variant="secondary">Find my OHID</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-5">
          {groupList.map((group) => (
            <FamilyGroupCard
              key={group._id}
              group={group}
              currentPatientId={patientId}
              busy={busy}
              onInvite={setInvitingTo}
              onUploadCertificate={setCertificateFor}
              onPromote={(target, patientIdToPromote) =>
                setConfirm({
                  kind: 'promote',
                  group: target,
                  member: (target.members ?? []).find(
                    (item) => idOf(item) === String(patientIdToPromote),
                  ) ?? { patientId: patientIdToPromote },
                })
              }
              onDemote={(target, patientIdToDemote) =>
                setConfirm({
                  kind: 'demote',
                  group: target,
                  member: (target.members ?? []).find(
                    (item) => idOf(item) === String(patientIdToDemote),
                  ) ?? { patientId: patientIdToDemote },
                })
              }
              onRemove={(target, member) => setConfirm({ kind: 'remove', group: target, member })}
              onLeave={(target) => setConfirm({ kind: 'leave', group: target })}
              onDelete={(target) => setConfirm({ kind: 'delete', group: target })}
            />
          ))}
        </div>
      )}

      <Alert tone="info" className="mt-6">
        Family members see each other's timeline and AI summaries. They never see a digital will, and
        cannot add, edit or delete anything on your record.
      </Alert>

      <CreateGroupModal
        open={creating}
        onClose={() => {
          setCreating(false)
          setCreateError(null)
        }}
        onSubmit={handleCreate}
        loading={createGroup.loading}
        error={createError}
      />

      <InviteMemberModal
        open={Boolean(invitingTo)}
        group={invitingTo}
        onClose={() => {
          setInvitingTo(null)
          setInviteError(null)
        }}
        onSubmit={handleInvite}
        loading={inviteMember.loading}
        error={inviteError}
      />

      <DeathCertificateModal
        open={Boolean(certificateFor)}
        member={certificateFor ?? {}}
        onClose={() => {
          setCertificateFor(null)
          setCertificateError(null)
        }}
        onSubmit={handleCertificate}
        loading={uploadCertificate.loading}
        error={certificateError}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
        loading={busy}
        title={activeConfirm?.title}
        confirmLabel={activeConfirm?.confirmLabel}
        message={confirmMessage}
        tone={confirm?.kind === 'delete' || confirm?.kind === 'remove' ? 'danger' : 'secondary'}
      />
    </>
  )
}

/** `members[].patientId` is populated, so the id sits one level down. */
function idOf(member) {
  return String(member?.patientId?._id ?? member?.patientId ?? '')
}
