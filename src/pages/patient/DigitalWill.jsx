import { useState } from 'react'
import {
  Banknote,
  Check,
  ChevronDown,
  FileText,
  Heart,
  KeyRound,
  Link2,
  Lock,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  RotateCw,
  Save,
  ScrollText,
  ShieldCheck,
  StickyNote,
  Trash2,
  Unlock,
  X,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import Alert from '../../components/ui/Alert.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Field from '../../components/ui/Field.jsx'
import Input from '../../components/ui/Input.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Textarea from '../../components/ui/Textarea.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import { PageSpinner } from '../../components/ui/Spinner.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useMutation } from '../../hooks/useMutation.js'
import { digitalWillApi } from '../../api/digitalWill.api.js'
import { WILL_SECTION_META } from '../../utils/constants.js'
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
 * Digital will.
 *
 * The backend seeds eight suggested sections on create and keys every update
 * on the section title, so the patient can delete the ones they do not want
 * and add their own — the will itself survives either way.
 */
export default function DigitalWill() {
  const toast = useToast()

  const will = useAsync(() => digitalWillApi.getMine(), [], { emptyOn: [404] })
  const createWill = useMutation(() => digitalWillApi.create())
  const removeWill = useMutation(() => digitalWillApi.remove())
  const addSectionMutation = useMutation((title) => digitalWillApi.addSection(title))
  const removeSection = useMutation((title) => digitalWillApi.removeSection(title))

  const [expanded, setExpanded] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState(null)
  const [addError, setAddError] = useState(null)

  if (will.loading) return <PageSpinner label="Unlocking your will…" />

  if (will.error) {
    return (
      <>
        <PageHeader title="Digital will" />
        <ErrorState error={will.error} onRetry={will.refetch} />
      </>
    )
  }

  const handleCreate = async () => {
    const result = await createWill.run()
    if (!result) {
      toast.error(createWill.error?.message ?? 'Could not create your digital will.')
      return
    }
    toast.success('Digital will created.')
    will.refetch()
  }

  const handleDelete = async () => {
    try {
      await digitalWillApi.remove()
      toast.success('Digital will deleted.')
      setDeleteOpen(false)
      will.setData(null)
      will.refetch()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleAddSection = async (title) => {
    setAddError(null)
    const result = await addSectionMutation.run(title)
    if (!result) {
      setAddError(addSectionMutation.error)
      return false
    }
    toast.success(`“${title}” added.`)
    will.setData(result)
    setExpanded(title)
    return true
  }

  const handleRemoveSection = async () => {
    if (!sectionToDelete) return
    const title = sectionToDelete
    const result = await removeSection.run(title)
    setSectionToDelete(null)
    if (!result) {
      toast.error(removeSection.error?.message ?? 'Could not remove that section.')
      return
    }
    if (expanded === title) setExpanded(null)
    toast.success(`“${title}” removed.`)
    will.setData(result)
  }

  // --- Not created yet -----------------------------------------------------
  if (!will.data) {
    return (
      <>
        <PageHeader
          title="Digital will"
          description="The things your family would otherwise have to hunt for — insurance, accounts, property and your final wishes."
          actions={
            <Button
              variant="ghost"
              icon={RotateCw}
              onClick={will.refetch}
              loading={will.loading}
            >
              Refresh
            </Button>
          }
        />

        <EmptyState
          icon={ScrollText}
          title="You have not created a digital will yet"
          message="openHealth will set up eight sections for you — personal message, documents, insurance, emergency contacts, bank details, passwords, final wishes and custom notes. Only you can read them, and they stay locked to everyone else until your family has a death certificate approved."
          action={
            <Button icon={ScrollText} onClick={handleCreate} loading={createWill.loading}>
              Create my digital will
            </Button>
          }
        />

        {createWill.error && (
          <Alert tone="error" className="mt-5">
            {createWill.error.message}
          </Alert>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(WILL_SECTION_META).map(([title, meta]) => {
            const Icon = SECTION_ICONS[meta.icon] ?? FileText
            return (
              <div key={title} className="surface-soft p-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-400/12 text-brand-200 ring-1 ring-inset ring-brand-400/25">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{meta.hint}</p>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  // --- Created -------------------------------------------------------------
  const { sections = [], isUnlocked, updatedAt } = will.data
  const filled = sections.filter((section) => section.content?.trim() || section.links?.length).length

  return (
    <>
      <PageHeader
        title="Digital will"
        description="Written here, readable only by you — or by your family once a death certificate has been approved."
        actions={
          <>
            <Button variant="ghost" icon={RotateCw} onClick={will.refresh} loading={will.refreshing}>
              Refresh
            </Button>
            <Button variant="ghost" icon={Plus} onClick={() => setAdding(true)}>
              Add section
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => setDeleteOpen(true)}
              loading={removeWill.loading}
            >
              Delete will
            </Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone={isUnlocked ? 'amber' : 'mint'} icon={isUnlocked ? Unlock : Lock}>
          {isUnlocked ? 'Unlocked for family' : 'Locked — only you can read this'}
        </Badge>
        <Badge tone="neutral">{filled} of {sections.length} sections written</Badge>
        <span className="text-xs text-slate-500">Last updated {formatDateTime(updatedAt)}</span>
      </div>

      {isUnlocked && (
        <Alert tone="warning" className="mb-6" title="This will is unlocked">
          A family admin approved a death certificate for your account, so your family can now read
          these sections. If this is wrong, contact support — this state is not reversible from the app.
        </Alert>
      )}

      {sections.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="This will has no sections"
          message="You removed every section. Add one to start writing again, or delete the will and create a fresh one."
          action={
            <Button icon={Plus} onClick={() => setAdding(true)}>
              Add a section
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {sections.map((section) => (
            <WillSection
              key={section.title}
              section={section}
              open={expanded === section.title}
              onToggle={() => setExpanded(expanded === section.title ? null : section.title)}
              onDelete={() => setSectionToDelete(section.title)}
              onSaved={() => {
                setExpanded(null)
                will.refresh()
              }}
            />
          ))}
        </div>
      )}

      <AddSectionModal
        open={adding}
        existing={sections.map((section) => section.title)}
        onClose={() => {
          setAdding(false)
          setAddError(null)
        }}
        onSubmit={handleAddSection}
        loading={addSectionMutation.loading}
        error={addError}
      />

      <ConfirmDialog
        open={Boolean(sectionToDelete)}
        onClose={() => setSectionToDelete(null)}
        onConfirm={handleRemoveSection}
        loading={removeSection.loading}
        title={`Remove “${sectionToDelete ?? ''}”?`}
        confirmLabel="Remove section"
        message="This section and everything written in it will be removed. The rest of your will stays as it is."
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={removeWill.loading}
        title="Delete your digital will?"
        confirmLabel="Delete everything"
        message="Every section and everything written in them will be permanently removed. You can create a new, empty will afterwards."
      />
    </>
  )
}

function WillSection({ section, open, onToggle, onDelete, onSaved }) {
  const toast = useToast()
  const meta = WILL_SECTION_META[section.title] ?? {}
  const Icon = SECTION_ICONS[meta.icon] ?? FileText

  const [content, setContent] = useState(section.content ?? '')
  const [links, setLinks] = useState(section.links ?? [])
  const [error, setError] = useState(null)

  const save = useMutation((payload) => digitalWillApi.updateSection(payload))

  const isFilled = Boolean(section.content?.trim()) || (section.links?.length ?? 0) > 0
  const dirty = content !== (section.content ?? '') || JSON.stringify(links) !== JSON.stringify(section.links ?? [])

  const handleCancel = () => {
    setContent(section.content ?? '')
    setLinks(section.links ?? [])
    setError(null)
    onToggle()
  }

  const handleSave = async () => {
    setError(null)
    const result = await save.run({
      title: section.title,
      content,
      links: links.map((link) => link.trim()).filter(Boolean),
    })
    if (!result) {
      setError(save.error)
      return
    }
    toast.success(`“${section.title}” saved.`)
    onSaved()
  }

  const updateLink = (index, value) =>
    setLinks((current) => current.map((link, i) => (i === index ? value : link)))

  const addLink = () => setLinks((current) => [...current, ''])

  const removeLink = (index) => setLinks((current) => current.filter((_, i) => i !== index))

  const isContacts = section.title === 'Emergency Contacts'

  return (
    <div className={`surface overflow-hidden transition-colors ${open ? 'border-brand-400/40' : ''}`}>
      <div className="flex items-center gap-4 p-5">
        <button
          type="button"
          onClick={open ? handleCancel : onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-4 text-left"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft ring-1 ring-inset ring-brand-400/20">
            <Icon className="h-5 w-5 text-brand-300" aria-hidden="true" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-display text-base font-bold text-white">{section.title}</span>
              {isFilled ? (
                <Badge tone="mint" size="sm">
                  Written
                </Badge>
              ) : (
                <Badge tone="neutral" size="sm">
                  Empty
                </Badge>
              )}
            </span>
            {!open && (
              <span className="mt-1 block truncate text-sm text-slate-400">
                {section.content?.trim() || meta.hint || 'Nothing written yet.'}
              </span>
            )}
          </span>
        </button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          aria-label={`Remove the ${section.title} section`}
          className="shrink-0 text-slate-400 hover:text-rose-300"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </div>

      {open && (
        <div className="animate-fade-in space-y-4 border-t border-ink-600/60 p-5">
          {error && <Alert tone="error">{error.message}</Alert>}

          <Field
            label="Content"
            htmlFor={`content-${section.title}`}
            hint={meta.hint}
          >
            <Textarea
              id={`content-${section.title}`}
              rows={7}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write freely — this is only ever read by you, or by your family after the will is unlocked."
              autoFocus
            />
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="label-base mb-0">Links</span>
              <Button variant="ghost" size="xs" icon={Plus} onClick={addLink}>
                Add link
              </Button>
            </div>

            {links.length === 0 ? (
              <p className="text-xs text-slate-500">
                {isContacts
                  ? 'Optional — add a phone number and it becomes tap-to-call when your family reads this.'
                  : 'Optional — point at a document, a portal or anything with a URL.'}
              </p>
            ) : (
              <>
                <ul className="space-y-2">
                  {links.map((link, index) => (
                    <LinkRow
                      // Keyed on the saved value so committing a draft remounts
                      // the row in its saved state without a sync effect.
                      key={`${index}-${link}`}
                      value={link}
                      index={index}
                      onChange={(value) => updateLink(index, value)}
                      onRemove={() => removeLink(index)}
                    />
                  ))}
                </ul>
                {isContacts && (
                  <p className="mt-2 text-xs text-slate-500">
                    Phone numbers open your phone app; anything with a URL opens in a new tab.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-ink-600/60 pt-4">
            <Button variant="ghost" onClick={handleCancel} disabled={save.loading}>
              Cancel
            </Button>
            <Button icon={Save} onClick={handleSave} loading={save.loading} disabled={!dirty}>
              Save section
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * One link, in one of two states: a saved link renders as a real anchor with
 * edit and remove controls beside it; an unsaved one is an input with a tick.
 */
function LinkRow({ value, index, onChange, onRemove }) {
  const saved = value.trim()
  const [draft, setDraft] = useState(value)
  const [editing, setEditing] = useState(false)

  const commit = () => {
    onChange(draft.trim())
    setEditing(false)
  }

  const cancel = () => {
    setDraft(value)
    setEditing(false)
  }

  if (saved && !editing) {
    return (
      <li className="flex items-center gap-2">
        <a
          href={linkHref(saved)}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex min-w-0 flex-1 items-center gap-2 truncate rounded-lg border border-ink-600/70 bg-ink-900/40 px-3 py-2 text-sm text-brand-300 transition hover:border-brand-400/40 hover:text-brand-200"
        >
          {isPhoneNumber(saved) ? (
            <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <Link2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span className="truncate">{linkLabel(saved)}</span>
        </a>

        <Button
          variant="ghost"
          size="sm"
          icon={Pencil}
          onClick={() => {
            setDraft(saved)
            setEditing(true)
          }}
          aria-label={`Edit link ${index + 1}`}
          className="shrink-0"
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          aria-label={`Remove link ${index + 1}`}
          className="shrink-0 text-slate-400 hover:text-rose-300"
        >
          <X className="h-4 w-4" />
        </Button>
      </li>
    )
  }

  return (
    <li className="flex items-center gap-2">
      {isPhoneNumber(draft) ? (
        <Phone className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
      ) : (
        <Link2 className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
      )}

      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commit()
          }
          if (event.key === 'Escape' && saved) cancel()
        }}
        placeholder="https://… or a phone number"
        aria-label={`Link ${index + 1}`}
        autoFocus
      />

      <Button
        variant="ghost"
        size="sm"
        icon={Check}
        onClick={commit}
        disabled={!draft.trim()}
        aria-label={`Save link ${index + 1}`}
        className="shrink-0"
      />

      <Button
        variant="ghost"
        size="sm"
        onClick={saved ? cancel : onRemove}
        aria-label={saved ? `Cancel editing link ${index + 1}` : `Remove link ${index + 1}`}
        className="shrink-0 text-slate-400 hover:text-rose-300"
      >
        <X className="h-4 w-4" />
      </Button>
    </li>
  )
}

/** Asks for a title for a section the patient is adding. */
function AddSectionModal({ open, onClose, onSubmit, existing = [], loading = false, error = null }) {
  const [title, setTitle] = useState('')
  const [touched, setTouched] = useState(false)

  const clean = title.trim()
  const duplicate = existing.some((value) => value.toLowerCase() === clean.toLowerCase())
  const validation = !clean
    ? 'Give the section a name.'
    : duplicate
      ? 'You already have a section with that name.'
      : null

  const reset = () => {
    setTitle('')
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
    if (validation) return
    const added = await onSubmit(clean)
    if (added) {
      reset()
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      size="sm"
      title="Add a section"
      description="Sections are what your family reads, one at a time."
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="add-section-form" icon={Plus} loading={loading}>
            Add section
          </Button>
        </>
      }
    >
      <form id="add-section-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error.message ?? String(error)}</Alert>}

        <Field
          label="Section name"
          htmlFor="section-title"
          required
          error={touched ? validation : null}
          hint="Anything that matters to you and is not already covered."
        >
          <Input
            id="section-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Property and rent"
            autoFocus
            autoComplete="off"
            error={touched && validation}
          />
        </Field>
      </form>
    </Modal>
  )
}
