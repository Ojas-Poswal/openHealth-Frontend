import {
  Activity,
  FileText,
  FolderHeart,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppShell from './AppShell.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { familyApi } from '../../api/family.api.js'
import { patientsApi } from '../../api/patients.api.js'

/**
 * Chrome for the patient area.
 *
 * Two live counts sit in the navigation, because both are things a patient
 * would otherwise miss: family invites waiting to be accepted, and doctor
 * consent codes waiting to be read out.
 */
export default function PatientLayout() {
  const { patient, logout } = useAuth()
  const navigate = useNavigate()

  const { data: invites } = useAsync(() => familyApi.listMyInvites(), [], { emptyOn: [404] })
  const { data: consentRequests } = useAsync(() => patientsApi.getConsentRequests(), [], {
    emptyOn: [404],
  })

  const pendingInvites = invites?.length ?? 0
  const pendingConsents = consentRequests?.length ?? 0

  const sections = [
    {
      label: 'Overview',
      items: [
        { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/app/timeline', label: 'My timeline', icon: Activity },
      ],
    },
    {
      label: 'Records',
      items: [
        { to: '/app/cases', label: 'Medical cases', icon: FolderHeart },
        { to: '/app/reports', label: 'Reports', icon: FileText },
        { to: '/app/ai-summary', label: 'AI summary', icon: Sparkles },
      ],
    },
    {
      label: 'Sharing & legacy',
      items: [
        { to: '/app/family', label: 'Family groups', icon: Users, badge: pendingInvites },
        { to: '/app/digital-will', label: 'Digital will', icon: ScrollText },
        { to: '/app/consents', label: 'Consents', icon: ShieldCheck, badge: pendingConsents },
      ],
    },
    {
      label: 'Account',
      items: [
        { to: '/app/audit-logs', label: 'Audit logs', icon: ScrollText },
        { to: '/app/profile', label: 'Profile', icon: UserCog },
      ],
    },
  ]

  const identity = {
    name: patient?.fullName ?? 'Your account',
    subtitle: patient?.ohid ?? 'openHealth ID',
    context: 'Your health record, in your hands.',
  }

  const handleSignOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <AppShell
      sections={sections}
      identity={identity}
      onSignOut={handleSignOut}
      accountLinks={[{ to: '/app/profile', label: 'Profile & settings', icon: UserCog }]}
    />
  )
}
