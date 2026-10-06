import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * @param {{ value: string, label: string }[]} options
 * @param {string} [placeholder] renders a disabled first option
 */
const Select = forwardRef(function Select(
  { options = [], placeholder, className = '', error = false, children, ...rest },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={`input-base cursor-pointer appearance-none pr-10 ${
          error ? 'border-rose-500/60 focus:border-rose-400 focus:ring-rose-400/25' : ''
        } ${className}`}
        aria-invalid={error || undefined}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-ink-800 text-slate-100">
            {option.label}
          </option>
        ))}
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        aria-hidden="true"
      />
    </div>
  )
})

export default Select
