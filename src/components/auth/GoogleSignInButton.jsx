import { useEffect, useRef, useState } from 'react'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

// The button is rendered inside Google's own iframe, which accepts a width
// between roughly 200 and 400 px and cannot be styled from the outside. The
// sign-in column is wider than that on a desktop, so the button is centred at
// its maximum rather than stretched.
const MAX_WIDTH = 400
const MIN_WIDTH = 200

let scriptPromise = null

function loadGisScript() {
  if (window.google?.accounts?.id) return Promise.resolve()

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      // An ad-blocker or a corporate proxy can refuse this outright. There is
      // nothing to show in that case — the email form still works.
      script.onerror = () => reject(new Error('Google sign-in could not load'))
      document.head.appendChild(script)
    })
  }

  return scriptPromise
}

/**
 * "Continue with Google", rendered by Google Identity Services.
 *
 * The browser gets a signed credential from Google and hands it straight to the
 * backend, which is the only party that can verify it. Nothing here trusts the
 * credential — it is passed along untouched.
 *
 * Renders nothing at all — divider included — when Google is unavailable or
 * unconfigured, so the screen never shows a control that cannot work.
 */
export default function GoogleSignInButton({ onCredential, onError, disabled = false }) {
  const holder = useRef(null)
  const [failed, setFailed] = useState(false)

  // Held in refs so the setup effect can run exactly once. The sign-in pages
  // pass inline callbacks, whose identity changes on every render, and
  // re-initialising the button that often would tear it down mid-click.
  const credentialRef = useRef(onCredential)
  const errorRef = useRef(onError)

  useEffect(() => {
    credentialRef.current = onCredential
    errorRef.current = onError
  })

  useEffect(() => {
    if (!CLIENT_ID) return undefined

    const element = holder.current
    if (!element) return undefined

    let cancelled = false
    let observer = null
    let lastWidth = 0

    const render = () => {
      const api = window.google?.accounts?.id

      if (!api) {
        setFailed(true)
        return
      }

      const width = Math.min(MAX_WIDTH, Math.floor(element.clientWidth))

      // Too narrow to render without overflowing the column. The guard on
      // `lastWidth` also stops the observer below from looping: adding the
      // iframe resizes the element it was just measured from.
      if (width < MIN_WIDTH || width === lastWidth) return

      lastWidth = width

      // `renderButton` appends rather than replaces, so without this a
      // StrictMode remount leaves two buttons stacked on each other.
      element.replaceChildren()

      api.renderButton(element, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        shape: 'rectangular',
        text: 'continue_with',
        logo_alignment: 'center',
        width,
      })
    }

    loadGisScript()
      .then(() => {
        if (cancelled) return

        const api = window.google?.accounts?.id

        // A proxy that answers with its own page still fires `onload`, so a
        // resolved script is not proof that Google is there.
        if (!api) {
          setFailed(true)
          return
        }

        api.initialize({
          client_id: CLIENT_ID,
          callback: ({ credential }) => {
            if (!credential) {
              errorRef.current?.(new Error('Google did not return a sign-in token. Please try again.'))
              return
            }
            credentialRef.current?.(credential)
          },
        })

        render()

        observer = new ResizeObserver(render)
        observer.observe(element)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      observer?.disconnect()
      window.google?.accounts?.id?.cancel()
      element.replaceChildren()
    }
  }, [])

  if (!CLIENT_ID || failed) return null

  return (
    <div className="space-y-4">
      {/* Fixed row height: Google's iframe is ~40px while `Button size="lg"`
          is 48px, so without this the form jumps when the script lands. The
          holder spans the column (that is the width measured above) and
          centres the narrower iframe inside itself. */}
      <div
        className={`flex h-12 items-center justify-center ${
          disabled ? 'pointer-events-none opacity-60' : ''
        }`}
      >
        <div ref={holder} className="flex w-full justify-center" />
      </div>

      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-ink-600/70" />
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">or</span>
        <span className="h-px flex-1 bg-ink-600/70" />
      </div>
    </div>
  )
}
