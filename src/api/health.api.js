import axios from 'axios'

/**
 * The backend answers GET / with the plain-text banner "openHealth API Running",
 * which the sign-in screens show to tell the user whether the API is up.
 *
 * With no VITE_API_BASE_URL the app talks to the relative "/api/v1", so the API
 * does not share this origin — asking for "/" here would fetch the dev server's
 * own index.html and paint it as a status line. "/health" is that same backend
 * request, forwarded to the API root by the proxy in vite.config.js.
 */
export async function pingApi() {
  const base = import.meta.env.VITE_API_BASE_URL
  const url = base ? `${base.replace(/\/api\/v1\/?$/, '')}/` : '/health'

  const { data } = await axios.get(url, { timeout: 8000 })

  // Anything that is not the banner is not the API, so never put it on screen.
  if (typeof data !== 'string' || data.trim().startsWith('<')) {
    throw new Error('The API did not answer with its status banner.')
  }

  return data.trim()
}

export * from './patients.api.js'
export * from './doctors.api.js'
export * from './medicalCases.api.js'
export * from './reports.api.js'
export * from './doctorNotes.api.js'
export * from './prescriptions.api.js'
export * from './family.api.js'
export * from './digitalWill.api.js'
export * from './deathCertificates.api.js'
export * from './aiSummary.api.js'
