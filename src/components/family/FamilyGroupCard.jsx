import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Crown,
  DoorOpen,
  FileHeart,
  ScrollText,
  ShieldMinus,
  ShieldPlus,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import Alert from '../ui/Alert.jsx'

/**
 * One family group, with its members and the actions the API allows.
 *
 * `members[].patientId` arrives populated by GET /family/my-groups, and each
 * member carries `relationshipToMe` — the backend re-reads the stored label
 * from the viewer's side, so a group's creator sees "Son" where that person
 * sees "Mother". `admins` stays a list of raw ids.
 */
export default function FamilyGroupCard({
  group,
  currentPatientId,
  onInvite,
  onPromote,
  onDemote,
  onRemove,
  onLeave,
  onDelete,
  onUploadCertificate,
  busy = false,
}) {
  const [expanded, setExpanded] = useState(true)

  const adminIds = (group.admins ?? []).map(String)
  const isAdmin = adminIds.includes(String(currentPatientId))
  const members = group.members ?? []
  const others = members.filter((member) => idOf(member) !== String(currentPatientId))
  const soloMember = members.length === 1

  return (
    <div className="surface overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-600/60 p-5">
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft ring-1 ring-inset ring-brand-400/20">
            <Users className="h-5 w-5 text-brand-300" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base font-bold text-white">{group.groupName}</h3>
              {isAdmin && (
                <Badge tone="brand" size="sm" icon={Crown}>
                  Admin
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            {expanded ? 'Hide members' : 'Show members'}
          </Button>
          {isAdmin && (
            <Button size="sm" icon={UserPlus} onClick={() => onInvite(group)} disabled={busy}>
              Invite member
            </Button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="animate-fade-in">
          <ul className="divide-y divide-ink-600/40">
            {members.map((member) => {
              const memberId = idOf(member)
              const isMe = memberId === String(currentPatientId)
              const isMemberAdmin = adminIds.includes(memberId)
              const name = member.patientId?.fullName ?? 'Member'
              const relationship = member.relationshipToMe ?? member.relationship

              return (
                <li key={memberId} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">{name}</span>
                      {relationship && (
                        <Badge tone={isMe ? 'mint' : 'neutral'} size="sm">
                          {relationship}
                        </Badge>
                      )}
                      {isMemberAdmin && (
                        <Badge tone="brand" size="sm" icon={Crown}>
                          Admin
                        </Badge>
                      )}
                    </div>
                    {member.patientId?.ohid && (
                      <p className="mt-0.5 font-mono text-xs text-slate-500">{member.patientId.ohid}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {!isMe && (
                      <>
                        <Link to={`/app/family/${memberId}/timeline`}>
                          <Button variant="ghost" size="sm" icon={FileHeart}>
                            Timeline
                          </Button>
                        </Link>
                        <Link to={`/app/family/${memberId}/will`}>
                          <Button variant="ghost" size="sm" icon={ScrollText}>
                            Will
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={ScrollText}
                          onClick={() => onUploadCertificate(member)}
                          disabled={busy}
                          title="Upload their death certificate"
                        >
                          Certificate
                        </Button>
                      </>
                    )}

                    {isAdmin && !isMe && (
                      <>
                        {isMemberAdmin ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={ShieldMinus}
                            onClick={() => onDemote(group, memberId)}
                            disabled={busy || adminIds.length === 1}
                            title={
                              adminIds.length === 1
                                ? 'The last admin cannot be demoted'
                                : 'Remove admin rights'
                            }
                            aria-label={`Demote ${name}`}
                          />
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={ShieldPlus}
                            onClick={() => onPromote(group, memberId)}
                            disabled={busy}
                            title="Make admin"
                            aria-label={`Promote ${name} to admin`}
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={UserMinus}
                          onClick={() => onRemove(group, member)}
                          disabled={busy}
                          title="Remove from group"
                          aria-label={`Remove ${name} from the group`}
                          className="text-slate-400 hover:text-rose-300"
                        />
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>

          {!isAdmin && others.length > 0 && (
            <div className="px-5 pb-4">
              <Alert tone="info">Only admins can invite, promote or remove members here.</Alert>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ink-600/60 px-5 py-4">
            <Button
              variant="ghost"
              size="sm"
              icon={DoorOpen}
              onClick={() => onLeave(group)}
              disabled={busy}
            >
              {soloMember ? 'Leave and delete group' : 'Leave group'}
            </Button>
            {isAdmin && !soloMember && (
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => onDelete(group)}
                disabled={busy}
              >
                Delete group
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/** `patientId` is populated, so the id lives one level down. */
function idOf(member) {
  return String(member.patientId?._id ?? member.patientId)
}
