import { patientClient } from './client.js'

/**
 * /api/v1/death-certificate  (multipart/form-data)
 *
 * A family member uploads the certificate for someone in their group; a
 * family admin then approves it, which unlocks that person's digital will.
 */
export const deathCertificatesApi = {
  /** @param {{ patientId: string, file: File, onUploadProgress?: (percent: number) => void }} input */
  upload: ({ patientId, file, onUploadProgress }) => {
    const form = new FormData()
    form.append('patientId', patientId)
    form.append('file', file)
    return patientClient
      .post('/death-certificate/upload', form, {
        onUploadProgress: (event) => {
          if (!onUploadProgress || !event.total) return
          onUploadProgress(Math.round((event.loaded * 100) / event.total))
        },
      })
      .then((r) => r.data.deathCertificate)
  },

  /** 404 when no certificate has been uploaded for that patient. */
  get: (patientId) =>
    patientClient.get(`/death-certificate/${patientId}`).then((r) => r.data.deathCertificate),
}
