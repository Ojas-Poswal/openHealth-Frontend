import { NavLink } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'
import Logo, { LogoMark } from './Logo.jsx'
import Button from '../ui/Button.jsx'

/**
 * Left navigation. On >= lg it is a fixed rail; below that it slides in as a
 * drawer driven by the `open` prop from AppShell.
 *
 * @param {{ label: string, items: { to: string, label: string, icon: any, end?: boolean, badge?: number }[] }[]} sections
 */
export default function Sidebar({ sections, open, onClose, identity, onSignOut }) {
  return (
    <>
      {/* Mobile scrim */}
      <div
        className={`fixed inset-0 z-30 bg-ink-950/70 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[17rem] flex-col border-r border-ink-600/60 bg-ink-900/85 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <NavLink to="/" onClick={onClose} className="lg:hidden">
            <Logo size="md" />
          </NavLink>
          <span className="hidden items-center gap-2.5 lg:inline-flex">
            <LogoMark size="md" />
            <span className="font-display text-lg font-extrabold tracking-tight">
              <span className="text-white">open</span>
              <span className="text-gradient">Health</span>
            </span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-3 pb-4">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-brand-soft text-white ring-1 ring-inset ring-brand-400/25'
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                              isActive ? 'text-brand-300' : 'text-slate-500 group-hover:text-slate-300'
                            }`}
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          {typeof item.badge === 'number' && item.badge > 0 && (
                            <span className="rounded-full bg-brand-400/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-100">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {identity && (
          <div className="border-t border-ink-600/60 p-3">
            <div className="flex items-center gap-3 rounded-xl bg-ink-800/60 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{identity.name}</p>
                <p className="truncate text-xs text-slate-500">{identity.subtitle}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSignOut}
                title="Sign out"
                aria-label="Sign out"
                className="shrink-0 px-2 text-slate-400 hover:text-rose-300"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
