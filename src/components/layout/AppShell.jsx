import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

/**
 * Shared chrome for the patient and doctor areas: fixed sidebar (drawer on
 * small screens), sticky top bar, and a max-width content column.
 */
export default function AppShell({ sections, identity, accountLinks, onSignOut }) {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <Sidebar
        sections={sections}
        open={navOpen}
        onClose={() => setNavOpen(false)}
        identity={identity}
        onSignOut={onSignOut}
      />

      <div className="lg:pl-[17rem]">
        <Topbar
          onOpenNav={() => setNavOpen(true)}
          identity={identity}
          accountLinks={accountLinks}
          onSignOut={onSignOut}
        />
        <main className="mx-auto w-full max-w-[80rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
