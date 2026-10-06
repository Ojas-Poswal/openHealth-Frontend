import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Field from '../ui/Field.jsx'
import Input from '../ui/Input.jsx'
import Alert from '../ui/Alert.jsx'

/**
 * Creates a family group.
 *
 * POST /family/create reads only `groupName` — the controller destructures
 * `joinPolicy` too, but the schema has no such field, so it is silently
 * dropped. Nothing is offered here for it.
 */
export default function CreateGroupModal({ open, onClose, onSubmit, loading = false, error = null }) {
  const [groupName, setGroupName] = useState('')
  const [touched, setTouched] = useState(false)

  const trimmed = groupName.trim()
  const fieldError = !trimmed
    ? 'Give the group a name.'
    : trimmed.length < 3
      ? 'Use at least 3 characters.'
      : null

  const close = () => {
    if (loading) return
    setGroupName('')
    setTouched(false)
    onClose()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setTouched(true)
    if (fieldError) return
    const created = await onSubmit({ groupName: trimmed })
    if (created) {
      setGroupName('')
      setTouched(false)
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      size="sm"
      title="Create a family group"
      description="You become the first admin. Invite the rest of your family by their openHealth ID."
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="create-group-form" loading={loading}>
            Create group
          </Button>
        </>
      }
    >
      <form id="create-group-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error.message ?? String(error)}</Alert>}

        <Field
          label="Group name"
          htmlFor="groupName"
          required
          error={touched ? fieldError : null}
          hint="Usually a family name — “The Poswals”, “Home”."
        >
          <Input
            id="groupName"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            placeholder="e.g. The Poswals"
            autoFocus
            error={touched && fieldError}
            maxLength={80}
          />
        </Field>

        <Alert tone="info">
          Everyone in a group can read everyone else's timeline and AI summaries. Nobody in the group
          can read a digital will — that needs a death certificate first.
        </Alert>
      </form>
    </Modal>
  )
}
