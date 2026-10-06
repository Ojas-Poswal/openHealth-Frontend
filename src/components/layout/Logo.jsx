/**
 * Brand lockup.
 *
 * The supplied artwork is a single 2:1 image containing the emblem *and* the
 * wordmark. For chrome (sidebar/topbar) we crop to the emblem with a CSS
 * background so it stays square at any size, and set the wordmark as live
 * text — that keeps it crisp and gives us the gradient on "Health".
 */

const MARK_SIZES = {
  sm: 'h-8 w-8 rounded-lg',
  md: 'h-10 w-10 rounded-xl',
  lg: 'h-14 w-14 rounded-2xl',
  xl: 'h-20 w-20 rounded-3xl',
}

const WORD_SIZES = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-4xl',
}

export function LogoMark({ size = 'md', className = '' }) {
  return (
    <span
      role="img"
      aria-label="openHealth"
      className={`block shrink-0 bg-ink-950 bg-[url('/logo.png')] bg-no-repeat ring-1 ring-inset ring-white/10 ${
        MARK_SIZES[size]
      } ${className}`}
      style={{ backgroundSize: '307% auto', backgroundPosition: '52% 7%' }}
    />
  )
}

export function Wordmark({ size = 'md', className = '' }) {
  return (
    <span className={`font-display font-extrabold tracking-tight ${WORD_SIZES[size]} ${className}`}>
      <span className="text-white">open</span>
      <span className="text-gradient">Health</span>
    </span>
  )
}

export default function Logo({ variant = 'mark', size = 'md', className = '' }) {
  if (variant === 'full') {
    return (
      <img
        src="/logo.png"
        alt="openHealth"
        className={`rounded-2xl ${className}`}
        draggable="false"
      />
    )
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <Wordmark size={size} />
    </span>
  )
}
