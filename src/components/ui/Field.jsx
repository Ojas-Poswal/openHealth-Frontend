import { AlertCircle } from 'lucide-react'

/**
 * Label + control + hint/error wrapper. Renders the error with
 * `role="alert"` so screen readers announce validation failures.
 */
export default function Field({ label, htmlFor, hint, error, required, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label className="label-base" htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-brand-300">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-300">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{hint}</p>
      )}
    </div>
  )
}
