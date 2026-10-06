import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, KeyRound, LogOut, Menu, UserCog } from 'lucide-react'
import Avatar from '../ui/Avatar.jsx'

/**
 * Sticky top bar. Holds the mobile nav trigger and the account menu; page
 * titles live in each page's own <PageHeader> so they can carry actions.
 */
export default function Topbar({ onOpenNav, identity, accountLinks = [], onSignOut }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined
    const onClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false)
    }
    const onKey = (event) => event.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-20 border-b border-ink-600/50 bg-ink-950/70 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenNav}
          className="rounded-xl p-2 text-slate-300 transition hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden text-sm text-slate-500 lg:block">
          {identity?.context ?? 'Your health, in one place.'}
        </div>

        <div className="relative ml-auto" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2.5 rounded-xl border border-ink-600/60 bg-ink-800/50 py-1.5 pl-1.5 pr-3 transition hover:border-brand-400/40 hover:bg-ink-700/50"
          >
            <Avatar name={identity?.name} size="sm" />
            <span className="hidden max-w-[10rem] truncate text-sm font-medium text-slate-200 sm:block">
              {identity?.name ?? 'Account'}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-slate-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-60 animate-scale-in overflow-hidden rounded-xl border border-ink-600/70 bg-ink-800/95 shadow-card backdrop-blur-2xl"
            >
              <div className="border-b border-ink-600/60 px-4 py-3">
                <p className="truncate text-sm font-semibold text-white">{identity?.name}</p>
                <p className="truncate text-xs text-slate-500">{identity?.subtitle}</p>
              </div>

              <div className="p-1.5">
                {accountLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    <link.icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    {link.label}
                  </Link>
                ))}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    onSignOut?.()
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export const ACCOUNT_ICONS = { UserCog, KeyRound }
