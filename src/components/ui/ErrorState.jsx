import { RotateCw, ServerCrash, ShieldAlert, WifiOff } from 'lucide-react'
import Button from './Button.jsx'

/**
 * Error state — shown when a request failed. Distinguishes the three cases a
 * user can actually act on: no connection, no permission, everything else.
 */
export default function ErrorState({ error, onRetry, title, className = '', compact = false }) {
  const status = error?.status

  let Icon = ServerCrash
  let heading = title || 'Something went wrong'
  let message = error?.message || 'The request could not be completed.'

  if (status === null || status === undefined) {
    Icon = WifiOff
    heading = title || 'Cannot reach openHealth'
  } else if (status === 403) {
    Icon = ShieldAlert
    heading = title || 'Access denied'
  } else if (status === 404) {
    Icon = ServerCrash
    heading = title || 'Not found'
  }

  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center rounded-2xl border border-rose-500/25 bg-rose-500/[0.06] text-center ${
        compact ? 'px-6 py-10' : 'px-6 py-16'
      } ${className}`}
    >
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/12 ring-1 ring-inset ring-rose-500/25">
        <Icon className="h-6 w-6 text-rose-300" aria-hidden="true" />
      </span>
      <h3 className="font-display text-base font-bold text-white">{heading}</h3>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-rose-100/70">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RotateCw} className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
