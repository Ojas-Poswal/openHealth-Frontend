import { publicClient, doctorClient } from './client.js'

/**
 * /api/v1/doctors
 * Tokens issued here carry { doctorId, dhid }.
 */
export const doctorsApi = {
  /**
   * Registration happens in three steps so the email is proven to work before
   * an account exists: sendRegistrationOtp -> verifyRegistrationOtp -> register.
   */
  sendRegistrationOtp: (email) =>
    publicClient.post('/doctors/register/send-otp', { email }).then((r) => r.data),

  verifyRegistrationOtp: (email, otp) =>
    publicClient.post('/doctors/register/verify-otp', { email, otp }).then((r) => r.data),

  register: (payload) => publicClient.post('/doctors/register', payload).then((r) => r.data),

  login: (payload) => publicClient.post('/doctors/login', payload).then((r) => r.data),

  getProfile: () => doctorClient.get('/doctors/profile').then((r) => r.data.doctor),

  updateProfile: (payload) =>
    doctorClient.patch('/doctors/profile', payload).then((r) => r.data.doctor),

  changePassword: (payload) =>
    doctorClient.patch('/doctors/change-password', payload).then((r) => r.data),

  forgotPassword: (email) => publicClient.post('/doctors/forgot-password', { email }).then((r) => r.data),

  verifyOtp: (payload) => publicClient.post('/doctors/verify-otp', payload).then((r) => r.data),

  resetPassword: (payload) => publicClient.post('/doctors/reset-password', payload).then((r) => r.data),

  /** Exact-match lookup on the patient's OHID (e.g. OH-3f2a…). */
  searchPatientByOhid: (ohid) =>
    doctorClient.get(`/doctors/search/${encodeURIComponent(ohid.trim())}`).then((r) => r.data.patient),

  /**
   * Full timeline for a patient. Requires an active, verified consent —
   * otherwise the backend answers 403. Viewing it writes a TIMELINE_VIEWED
   * entry into the patient's audit log.
   */
  getPatientTimeline: (patientId) =>
    doctorClient.get(`/doctors/patient/${patientId}/timeline`).then((r) => r.data.timeline),

  /**
   * Generates a consent OTP and puts it in the patient's portal. The code is
   * deliberately not returned here — it belongs to the patient, who reads it
   * out to the doctor.
   */
  requestConsent: (patientId) =>
    doctorClient.post('/doctors/request-consent', { patientId }).then((r) => r.data),

  /** Confirms the OTP the patient read out, opening the session. */
  verifyConsent: (payload) => doctorClient.post('/doctors/verify-consent', payload).then((r) => r.data),

  endSession: (patientId) =>
    doctorClient.post('/doctors/end-session', { patientId }).then((r) => r.data),

  getActiveSessions: () => doctorClient.get('/doctors/active-sessions').then((r) => r.data.sessions),

  /** Patients whose records this doctor has opened, newest activity first. */
  getAccessedPatients: () =>
    doctorClient.get('/doctors/accessed-patients').then((r) => r.data.patients),

  /** Chronological audit entries for one patient. */
  getAuditLogs: (patientId) =>
    doctorClient.get('/doctors/audit-logs', { params: { patientId } }).then((r) => r.data.logs),
}
