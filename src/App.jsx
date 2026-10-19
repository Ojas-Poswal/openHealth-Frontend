import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext.jsx'
import { DoctorAuthProvider } from './context/DoctorAuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

import PatientLayout from './components/layout/PatientLayout.jsx'
import DoctorLayout from './components/layout/DoctorLayout.jsx'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import DoctorProtectedRoute from './components/layout/DoctorProtectedRoute.jsx'
import { PageSpinner } from './components/ui/Spinner.jsx'

// The landing page and the 404 are the two screens an unauthenticated
// visitor can hit, so they stay in the first chunk. Everything behind a
// session is split per route — a patient never downloads the doctor screens.
import Landing from './pages/Landing.jsx'
import NotFound from './pages/NotFound.jsx'

const PatientLogin = lazy(() => import('./pages/auth/PatientLogin.jsx'))
const PatientRegister = lazy(() => import('./pages/auth/PatientRegister.jsx'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword.jsx'))
const DoctorLogin = lazy(() => import('./pages/auth/DoctorLogin.jsx'))
const DoctorRegister = lazy(() => import('./pages/auth/DoctorRegister.jsx'))
const DoctorForgotPassword = lazy(() =>
  import('./pages/auth/ForgotPassword.jsx').then((module) => ({
    default: () => <module.default role="doctor" />,
  })),
)

const Dashboard = lazy(() => import('./pages/patient/Dashboard.jsx'))
const Timeline = lazy(() => import('./pages/patient/Timeline.jsx'))
const Cases = lazy(() => import('./pages/patient/Cases.jsx'))
const MedicalCaseDetailPage = lazy(() => import('./pages/patient/MedicalCaseDetailPage.jsx'))
const ReportsPage = lazy(() => import('./pages/patient/ReportsPage.jsx'))
const AISummary = lazy(() => import('./pages/patient/AISummary.jsx'))
const DigitalWill = lazy(() => import('./pages/patient/DigitalWill.jsx'))
const Family = lazy(() => import('./pages/patient/Family.jsx'))
const FamilyMemberTimeline = lazy(() => import('./pages/patient/FamilyMemberTimeline.jsx'))
const FamilyMemberWill = lazy(() => import('./pages/patient/FamilyMemberWill.jsx'))
const Consents = lazy(() => import('./pages/patient/Consents.jsx'))
const AuditLogs = lazy(() => import('./pages/patient/AuditLogs.jsx'))
const Profile = lazy(() => import('./pages/patient/Profile.jsx'))

const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard.jsx'))
const SearchPatient = lazy(() => import('./pages/doctor/SearchPatient.jsx'))
const DoctorPatientTimeline = lazy(() => import('./pages/doctor/DoctorPatientTimeline.jsx'))
const ActiveSessions = lazy(() => import('./pages/doctor/ActiveSessions.jsx'))
const AccessedPatients = lazy(() => import('./pages/doctor/AccessedPatients.jsx'))
const DoctorProfile = lazy(() => import('./pages/doctor/DoctorProfile.jsx'))

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <DoctorAuthProvider>
          <Suspense fallback={<PageSpinner label="Loading…" />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<PatientLogin />} />
              <Route path="/register" element={<PatientRegister />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/doctor/login" element={<DoctorLogin />} />
              <Route path="/doctor/register" element={<DoctorRegister />} />
              <Route path="/doctor/forgot-password" element={<DoctorForgotPassword />} />

              {/* Patient area */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <PatientLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="timeline" element={<Timeline />} />
                <Route path="cases" element={<Cases />} />
                <Route path="cases/:caseId" element={<MedicalCaseDetailPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="ai-summary" element={<AISummary />} />
                <Route path="digital-will" element={<DigitalWill />} />
                <Route path="family" element={<Family />} />
                <Route path="family/:patientId/timeline" element={<FamilyMemberTimeline />} />
                <Route path="family/:patientId/will" element={<FamilyMemberWill />} />
                <Route path="consents" element={<Consents />} />
                <Route path="audit-logs" element={<AuditLogs />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Doctor area */}
              <Route
                path="/doctor"
                element={
                  <DoctorProtectedRoute>
                    <DoctorLayout />
                  </DoctorProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/doctor/dashboard" replace />} />
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="search" element={<SearchPatient />} />
                <Route path="patient/:patientId" element={<DoctorPatientTimeline />} />
                <Route path="accessed-patients" element={<AccessedPatients />} />
                <Route path="sessions" element={<ActiveSessions />} />
                <Route path="profile" element={<DoctorProfile />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </DoctorAuthProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
