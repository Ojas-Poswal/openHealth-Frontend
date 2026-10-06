import { TriangleAlert } from 'lucide-react'
import Modal from './Modal.jsx'
import Button from './Button.jsx'

/**
 * Destructive-action confirmation. Every delete / revoke / remove action in
 * the app routes through this so nothing irreversible fires on a single click.
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
            tone === 'danger' ? 'bg-rose-500/15 text-rose-300' : 'bg-brand-400/15 text-brand-200'
          }`}
        >
          <TriangleAlert className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-sm leading-relaxed text-slate-300">{message}</p>
      </div>
    </Modal>
  )
}
