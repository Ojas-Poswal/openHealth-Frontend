import { Loader2 } from 'lucide-react'

const SIZES = {
  xs: 'h-4 w-4',
  sm: 'h-5 w-5',
  md: 'h-7 w-7',
  lg: 'h-10 w-10',
  xl: 'h-14 w-14',
}

/** Gradient-ringed spinner used for both inline and full-page loading. */
export default function Spinner({ size = 'md', className = '', label }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-slate-400 ${className}`} role="status">
      <Loader2 className={`animate-spin text-brand-300 ${SIZES[size]}`} aria-hidden="true" />
      {label && <span className="text-sm">{label}</span>}
      <span className="sr-only">Loading</span>
    </span>
  )
}

/** Centres a spinner inside a sized block — used while a page's first fetch runs. */
export function PageSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <span className="relative grid h-14 w-14 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand-400/15" />
        <Loader2 className="h-8 w-8 animate-spin text-brand-300" />
      </span>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  )
}
