import { patientClient } from './client.js'

/**
 * /api/v1/ai-summary
 *
 * One stored summary per patient. Generating a new one overwrites the
 * previous text in place (upsert), which is why the UI offers both
 * "fetch saved" and "generate new".
 */
export const aiSummaryApi = {
  /** Rebuilds the summary from the patient's medical cases. 404 if no cases. */
  generate: (patientId) =>
    patientClient.post(`/ai-summary/generate/${patientId}`).then((r) => r.data.aiSummary),

  /** 404 until a summary has been generated at least once. */
  get: (patientId) => patientClient.get(`/ai-summary/${patientId}`).then((r) => r.data.aiSummary),
}
