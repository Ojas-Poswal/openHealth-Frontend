import { Navigate, useLocation } from 'react-router-dom'
import { useDoctorAuth } from '../../context/DoctorAuthContext.jsx'
import { PageSpinner } from '../ui/Spinner.jsx'

/** Gate for every /doctor route (excluding the sign-in screens). */
export default function DoctorProtectedRoute({ children, allowIncomplete = false }) {
  const { isAuthenticated, booting, doctor } = useDoctorAuth()
  const location = useLocation()

  if (booting) return <PageSpinner label="Restoring your session…" />

  if (!isAuthenticated) {
    return <Navigate to="/doctor/login" replace state={{ from: location.pathname }} />
  }

  // A doctor created through Google has no registration number yet, so every
  // clinical screen would refuse them. Send them to finish the account first.
  // That page renders outside this shell and passes `allowIncomplete`, which is
  // what stops this from redirecting to itself.
  if (!allowIncomplete && !doctor?.registrationNumber) {
    return <Navigate to="/doctor/complete-profile" replace />
  }

  return children
}
