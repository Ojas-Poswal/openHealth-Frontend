import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const Input = forwardRef(function Input(
  { type = 'text', className = '', error = false, ...rest },
  ref,
) {
  const [revealed, setRevealed] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword && revealed ? 'text' : type

  return (
    <div className="relative">
      <input
        ref={ref}
        type={resolvedType}
        className={`input-base ${error ? 'border-rose-500/60 focus:border-rose-400 focus:ring-rose-400/25' : ''} ${
          isPassword ? 'pr-11' : ''
        } ${className}`}
        aria-invalid={error || undefined}
        {...rest}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setRevealed((value) => !value)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
          aria-label={revealed ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
  )
})

export default Input
