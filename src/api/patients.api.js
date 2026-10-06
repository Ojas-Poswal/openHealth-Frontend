import { publicClient, patientClient } from './client.js'

/**
 * /api/v1/patients
 * Tokens issued here carry { patientID, ohid }.
 */
export const patientsApi = {
  /**
   * Registration happens in three steps so the email is proven to work before
   * an account exists: sendRegistrationOtp -> verifyRegistrationOtp -> register.
   */
  sendRegistrationOtp: (email) =>
    publicClient.post('/patients/register/send-otp', { email }).then((r) => r.data),

  verifyRegistrationOtp: (email, otp) =>
    publicClient.post('/patients/register/verify-otp', { email, otp }).then((r) => r.data),

  register: (payload) =>
    publicClient.post('/patients/register', payload).then((r) => r.data),

  login: (payload) => publicClient.post('/patients/login', payload).then((r) => r.data),

  getProfile: () => patientClient.get('/patients/profile').then((r) => r.data.patient),

  updateProfile: (payload) =>
    patientClient.patch('/patients/profile', payload).then((r) => r.data.patient),

  changePassword: (payload) =>
    patientClient.patch('/patients/change-password', payload).then((r) => r.data),

  forgotPassword: (email) =>
    publicClient.post('/patients/forgot-password', { email }).then((r) => r.data),

  verifyOtp: (payload) => publicClient.post('/patients/verify-otp', payload).then((r) => r.data),

  resetPassword: (payload) =>
    publicClient.post('/patients/reset-password', payload).then((r) => r.data),

  getAuditLogs: () => patientClient.get('/patients/audit-logs').then((r) => r.data.logs),

  getMyConsents: () => patientClient.get('/patients/my-consents').then((r) => r.data.consents),

  /** Doctors waiting for this patient to read out a consent code. Includes the code. */
  getConsentRequests: () =>
    patientClient.get('/patients/consent-requests').then((r) => r.data.requests),

  revokeConsent: (doctorId) =>
    patientClient.post('/patients/revoke-consent', { doctorId }).then((r) => r.data),
}
