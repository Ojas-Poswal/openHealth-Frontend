import { patientClient } from './client.js'

/**
 * /api/v1/digital-will
 *
 * A will is created with eight suggested sections, which the patient can fill
 * in, delete, or add to. Content is written section-by-section via
 * `updateSection`, keyed on the section title.
 * Family members may only read it once `isUnlocked` is true, which happens
 * after a family admin approves a death certificate.
 */
export const digitalWillApi = {
  /** Creates the will with the eight default sections. 400 if one exists. */
  create: () => patientClient.post('/digital-will/create').then((r) => r.data),

  getMine: () => patientClient.get('/digital-will/me').then((r) => r.data.digitalWill),

  /** @param {{ title: string, content?: string, links?: string[] }} payload */
  updateSection: ({ title, content, links }) =>
    patientClient.patch('/digital-will/update-section', { title, content, links }).then((r) => r.data.digitalWill),

  /** Adds a section of the patient's own choosing. 409 if the title is taken. */
  addSection: (title) =>
    patientClient.post('/digital-will/section', { title }).then((r) => r.data.digitalWill),

  /** Removes one section. The rest of the will stays untouched. */
  removeSection: (title) =>
    patientClient.delete('/digital-will/section', { data: { title } }).then((r) => r.data.digitalWill),

  remove: () => patientClient.delete('/digital-will/delete').then((r) => r.data),

  /** Read a family member's will — 403 unless it has been unlocked. */
  getFamilyMemberWill: (patientId) =>
    patientClient.get(`/digital-will/family/${patientId}`).then((r) => r.data.digitalWill),

  /** Family-admin only: approves the certificate and unlocks the will. */
  approveDeathCertificate: (patientId) =>
    patientClient.post('/digital-will/approve-death-certificate', { patientId }).then((r) => r.data),
}
