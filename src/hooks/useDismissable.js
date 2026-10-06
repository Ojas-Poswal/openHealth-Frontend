import { useEffect } from 'react'

/**
 * Closes a floating element (modal, drawer, dropdown) on Escape and locks
 * background scrolling while it is open.
 */
export function useDismissable(open, onClose) {
  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])
}
