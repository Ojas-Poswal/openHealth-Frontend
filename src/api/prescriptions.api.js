import { doctorClient } from './client.js'

/**
 * /api/v1/prescriptions
 * A doctor writes a prescription straight into an existing medical case.
 *
 * @typedef {{ medicine: string, dosage: string, frequency: string,
 *             duration: string, notes?: string }} Medicine
 */
export const prescriptionsApi = {
  create: (medicalCaseId, medicines) =>
    doctorClient
      .post('/prescriptions/create', { medicalCaseId, medicines })
      .then((r) => r.data.prescription),
}
