import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { PageSpinner } from '../ui/Spinner.jsx'

/**
 * Gate for every /app route.
 *
 * While the stored session is being restored we render a spinner rather than
 * redirecting — otherwise a refresh would bounce the user to the sign-in
 * screen for a frame and lose their place.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, booting } = useAuth()
  const location = useLocation()

  if (booting) return <PageSpinner label="Restoring your session…" />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
