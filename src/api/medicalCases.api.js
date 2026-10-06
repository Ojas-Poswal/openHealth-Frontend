import { patientClient } from './client.js'

/**
 * /api/v1/medical-case
 *
 * `getTimeline()` is the backbone of the product: one entry per medical case
 * carrying the case itself plus every report, doctor note and prescription
 * attached to it.
 */
export const medicalCasesApi = {
  create: (payload) => patientClient.post('/medical-case/create', payload).then((r) => r.data),

  listMine: () => patientClient.get('/medical-case/my-cases').then((r) => r.data.medicalCases),

  /** [{ medicalCase, reports[], doctorNotes[], prescriptions[] }] — newest first. */
  getTimeline: () => patientClient.get('/medical-case/timeline').then((r) => r.data.timeline),

  getActive: () => patientClient.get('/medical-case/active-cases').then((r) => r.data.activeCases),

  getResolved: () =>
    patientClient.get('/medical-case/resolved-cases').then((r) => r.data.resolvedCases),

  getById: (caseId) => patientClient.get(`/medical-case/${caseId}`).then((r) => r.data.medicalCase),

  updateCaseStatus: (caseId, status) =>
    patientClient.patch(`/medical-case/${caseId}/status`, { status }).then((r) => r.data.medicalCase),
}
