import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Field from '../ui/Field.jsx'
import Input from '../ui/Input.jsx'
import Alert from '../ui/Alert.jsx'
import { RELATIONSHIP_SUGGESTIONS } from '../../utils/constants.js'

/**
 * Invites a patient into a group by their OHID.
 *
 * The backend resolves the OHID with an exact match against an existing
 * patient, so a typo surfaces as "Patient not found" — there is no lookup
 * or search to preview the person first.
 */
export default function InviteMemberModal({ open, onClose, onSubmit, group, loading = false, error = null }) {
  const [ohid, setOhid] = useState('')
  const [relationship, setRelationship] = useState('')
  const [touched, setTouched] = useState(false)

  // Every label in a group is stored from the creator's side, so it can be
  // re-worded for whichever member is looking. That makes the creator the
  // person this question is always asked about.
  const creator = (group?.members ?? []).find(
    (member) => String(member.relationship ?? '').trim().toLowerCase() === 'self',
  )
  const creatorName = creator?.patientId?.fullName

  const errors = {
    ohid: !ohid.trim()
      ? 'Enter the openHealth ID of the person you are inviting.'
      : !/^OH-/i.test(ohid.trim())
        ? 'An openHealth ID starts with “OH-”.'
        : null,
    relationship: !relationship.trim()
      ? `Say how this person is related to ${creatorName ?? 'the group creator'}.`
      : null,
  }
  const valid = Object.values(errors).every((value) => value === null)

  const reset = () => {
    setOhid('')
    setRelationship('')
    setTouched(false)
  }

  const close = () => {
    if (loading) return
    reset()
    onClose()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setTouched(true)
    if (!valid) return
    const sent = await onSubmit({
      groupId: group._id,
      ohid: ohid.trim(),
      relationship: relationship.trim(),
    })
    if (sent) {
      reset()
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      size="sm"
      title="Invite a family member"
      description={group ? `They will be asked to join “${group.groupName}”.` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="invite-member-form" loading={loading}>
            Send invite
          </Button>
        </>
      }
    >
      <form id="invite-member-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error.message ?? String(error)}</Alert>}

        <Field
          label="openHealth ID (OHID)"
          htmlFor="ohid"
          required
          error={touched ? errors.ohid : null}
          hint="They can find it on their own profile page."
        >
          <Input
            id="ohid"
            value={ohid}
            onChange={(event) => setOhid(event.target.value)}
            placeholder="OH-xxxxxxxx-xxxx-…"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            error={touched && errors.ohid}
          />
        </Field>

        <Field
          label={creatorName ? `Relationship to ${creatorName}` : 'Relationship'}
          htmlFor="relationship"
          required
          error={touched ? errors.relationship : null}
          hint="We word this from each member's own point of view."
        >
          <Input
            id="relationship"
            list="relationship-suggestions"
            value={relationship}
            onChange={(event) => setRelationship(event.target.value)}
            placeholder="e.g. Mother"
            autoComplete="off"
            error={touched && errors.relationship}
          />
          <datalist id="relationship-suggestions">
            {RELATIONSHIP_SUGGESTIONS.map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>
        </Field>
      </form>
    </Modal>
  )
}
