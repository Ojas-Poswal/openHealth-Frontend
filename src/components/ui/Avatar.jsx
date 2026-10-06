import { initials } from '../../utils/format.js'

const SIZES = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
}

/** Gradient monogram — the app never assumes a profile photo exists. */
export default function Avatar({ name, size = 'md', className = '', ring = false }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-brand-gradient font-display font-bold text-ink-950 ${
        SIZES[size]
      } ${ring ? 'ring-2 ring-ink-800' : ''} ${className}`}
      aria-hidden="true"
      title={name || undefined}
    >
      {initials(name)}
    </span>
  )
}
