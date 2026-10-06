import { patientClient } from './client.js'

/**
 * /api/v1/family
 *
 * Groups are formed by inviting an existing patient by their OHID. Every
 * member can read every other member's timeline; the digital will is
 * separate (see digitalWill.api.js).
 */
export const familyApi = {
  createGroup: (groupName) =>
    patientClient.post('/family/create', { groupName }).then((r) => r.data.familyGroup),

  /** Groups I belong to. The backend answers 404 when I belong to none. */
  listMyGroups: () => patientClient.get('/family/my-groups').then((r) => r.data.groups),

  /**
   * `relationship` is always written from the group creator's point of view
   * (e.g. "Son" = the creator's son), so the backend can translate it into the
   * right word for every member who looks at the group.
   */
  inviteMember: ({ groupId, ohid, relationship }) =>
    patientClient.post('/family/invite-member', { groupId, ohid, relationship }).then((r) => r.data.invite),

  listMyInvites: () => patientClient.get('/family/my-invites').then((r) => r.data.invites),

  acceptInvite: (inviteId) => patientClient.post('/family/accept-invite', { inviteId }).then((r) => r.data),

  rejectInvite: (inviteId) => patientClient.post('/family/reject-invite', { inviteId }).then((r) => r.data),

  leaveGroup: (groupId) => patientClient.post('/family/leave-group', { groupId }).then((r) => r.data),

  promoteToAdmin: (groupId, patientId) =>
    patientClient.post('/family/promote-admin', { groupId, patientId }).then((r) => r.data),

  demoteAdmin: (groupId, patientId) =>
    patientClient.post('/family/demote-admin', { groupId, patientId }).then((r) => r.data),

  removeMember: (groupId, patientId) =>
    patientClient.post('/family/remove-member', { groupId, patientId }).then((r) => r.data),

  /** DELETE with a JSON body — axios needs `data` rather than a query string. */
  deleteGroup: (groupId) =>
    patientClient.delete('/family/delete-group', { data: { groupId } }).then((r) => r.data),

  /** A family member's full timeline. Requires a shared group. */
  getMemberTimeline: (patientId) =>
    patientClient.get(`/family/timeline/${patientId}`).then((r) => r.data.timeline),
}
