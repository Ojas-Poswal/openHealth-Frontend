import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(null)

let nextId = 0

const TONES = {
  success: {
    ring: 'ring-mint-400/30',
    icon: '✓',
    iconClass: 'bg-mint-400/15 text-mint-300',
  },
  error: {
    ring: 'ring-rose-500/30',
    icon: '!',
    iconClass: 'bg-rose-500/15 text-rose-300',
  },
  info: {
    ring: 'ring-brand-400/30',
    icon: 'i',
    iconClass: 'bg-brand-400/15 text-brand-200',
  },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (tone, message, options = {}) => {
      if (!message) return null
      const id = ++nextId
      const duration = options.duration ?? (tone === 'error' ? 6500 : 4000)
      setToasts((current) => [...current.slice(-3), { id, tone, message, title: options.title }])
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        )
      }
      return id
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({
      toasts,
      dismiss,
      success: (message, options) => push('success', message, options),
      error: (message, options) => push('error', message, options),
      info: (message, options) => push('info', message, options),
    }),
    [toasts, dismiss, push],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function Toaster({ toasts, onDismiss }) {
  if (!toasts.length) return null

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(24rem,calc(100vw-2.5rem))] flex-col gap-2.5"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const tone = TONES[toast.tone] ?? TONES.info
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex animate-fade-in items-start gap-3 rounded-xl border border-ink-600/70 bg-ink-800/95 p-3.5 shadow-card ring-1 backdrop-blur-xl ${tone.ring}`}
          >
            <span
              className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${tone.iconClass}`}
            >
              {tone.icon}
            </span>
            <div className="min-w-0 flex-1">
              {toast.title && <p className="text-sm font-semibold text-white">{toast.title}</p>}
              <p className="text-sm leading-snug text-slate-300">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 rounded-md p-1 text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
              aria-label="Dismiss notification"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l8 8M14 6l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}
