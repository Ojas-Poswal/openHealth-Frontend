import { Navigate, useLocation } from 'react-router-dom'
import { useDoctorAuth } from '../../context/DoctorAuthContext.jsx'
import { PageSpinner } from '../ui/Spinner.jsx'

/** Gate for every /doctor route (excluding the sign-in screens). */
export default function DoctorProtectedRoute({ children }) {
  const { isAuthenticated, booting } = useDoctorAuth()
  const location = useLocation()

  if (booting) return <PageSpinner label="Restoring your session…" />

  if (!isAuthenticated) {
    return <Navigate to="/doctor/login" replace state={{ from: location.pathname }} />
  }

  return children
}
