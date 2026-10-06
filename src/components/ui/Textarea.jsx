import { forwardRef } from 'react'

const Textarea = forwardRef(function Textarea(
  { rows = 4, className = '', error = false, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`input-base resize-y leading-relaxed ${
        error ? 'border-rose-500/60 focus:border-rose-400 focus:ring-rose-400/25' : ''
      } ${className}`}
      aria-invalid={error || undefined}
      {...rest}
    />
  )
})

export default Textarea
