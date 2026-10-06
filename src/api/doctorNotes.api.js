import { doctorClient } from './client.js'

/**
 * /api/v1/doctor-notes
 * A note hangs off a specific report; the backend derives the doctor from the
 * bearer token.
 */
export const doctorNotesApi = {
  create: (reportId, note) =>
    doctorClient.post('/doctor-notes/create', { reportId, note }).then((r) => r.data.doctorNote),
}
