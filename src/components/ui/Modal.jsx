import { X } from 'lucide-react'
import { useDismissable } from '../../hooks/useDismissable.js'
import Button from './Button.jsx'

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
}

/**
 * Accessible dialog: Escape and backdrop close it, body scroll is locked
 * while it is open, and the panel is a labelled landmark for screen readers.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  footer,
  children,
  closeOnBackdrop = true,
}) {
  useDismissable(open, onClose)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6">
      <div
        className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative my-auto w-full ${SIZES[size]} animate-scale-in rounded-2xl border border-ink-600/70 bg-ink-800/95 shadow-card backdrop-blur-2xl`}
      >
        <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand-400/60 to-transparent" />

        <div className="flex items-start justify-between gap-4 border-b border-ink-600/60 p-5">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold text-white">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close dialog" className="-mr-1 -mt-1">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-5">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ink-600/60 p-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
