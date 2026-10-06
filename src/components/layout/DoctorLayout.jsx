import { Activity, History, LayoutDashboard, Search, UserCog, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppShell from './AppShell.jsx'
import { useDoctorAuth } from '../../context/DoctorAuthContext.jsx'

/** Chrome for the doctor area. */
export default function DoctorLayout() {
  const { doctor, logout } = useDoctorAuth()
  const navigate = useNavigate()

  const sections = [
    {
      label: 'Practice',
      items: [
        { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/doctor/search', label: 'Find a patient', icon: Search },
        { to: '/doctor/accessed-patients', label: "Patients I've accessed", icon: History },
        { to: '/doctor/sessions', label: 'Active sessions', icon: Activity },
      ],
    },
    {
      label: 'Account',
      items: [{ to: '/doctor/profile', label: 'Profile', icon: UserCog }],
    },
  ]

  const identity = {
    name: doctor?.fullName ?? 'Doctor',
    subtitle: doctor?.dhid ?? 'openHealth doctor',
    context: doctor?.specialization
      ? `${doctor.specialization}${doctor.workplace ? ` · ${doctor.workplace}` : ''}`
      : 'Consented access only.',
  }

  const handleSignOut = () => {
    logout()
    navigate('/doctor/login', { replace: true })
  }

  return (
    <AppShell
      sections={sections}
      identity={identity}
      onSignOut={handleSignOut}
      accountLinks={[
        { to: '/doctor/profile', label: 'Profile', icon: UserCog },
        { to: '/doctor/sessions', label: 'Active sessions', icon: Users },
      ]}
    />
  )
}
