import { patientClient } from './client.js'

/**
 * /api/v1/reports  (multipart/form-data)
 * Only patients can create and own reports; a doctor's contribution to a
 * report is a note (see doctorNotes.api.js).
 */
export const reportsApi = {
  listByCase: (medicalCaseId) =>
    patientClient.get(`/reports/case/${medicalCaseId}`).then((r) => r.data.reports),

  getById: (reportId) => patientClient.get(`/reports/${reportId}`).then((r) => r.data.report),

  /**
   * Edits a report, and optionally swaps its file. Sent as multipart so the
   * `file` part can be included; omitting it leaves the current file alone.
   *
   * @param {{ reportName?: string, reportType?: string, file?: File|null }} payload
   */
  update: (reportId, { reportName, reportType, file } = {}) => {
    const form = new FormData()
    if (reportName !== undefined) form.append('reportName', reportName)
    if (reportType !== undefined) form.append('reportType', reportType)
    if (file) form.append('file', file)
    return patientClient.patch(`/reports/${reportId}`, form).then((r) => r.data.report)
  },

  remove: (reportId) => patientClient.delete(`/reports/${reportId}`).then((r) => r.data),

  /**
   * @param {{ medicalCaseId: string, reportName: string, reportType: string,
   *           file: File, onUploadProgress?: (percent: number) => void }} input
   */
  create: ({ medicalCaseId, reportName, reportType, file, onUploadProgress }) => {
    const form = new FormData()
    form.append('medicalCaseId', medicalCaseId)
    form.append('reportName', reportName)
    form.append('reportType', reportType)
    form.append('file', file)
    return patientClient
      .post('/reports/create', form, {
        onUploadProgress: (event) => {
          if (!onUploadProgress || !event.total) return
          onUploadProgress(Math.round((event.loaded * 100) / event.total))
        },
      })
      .then((r) => r.data.report)
  },
}
