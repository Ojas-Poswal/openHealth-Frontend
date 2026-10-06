import axios from 'axios'
import { readToken, writeToken, writeCache } from '../utils/token.js'
import { toApiError } from '../utils/errors.js'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

/** Fired when a session dies so the auth contexts can react in one place. */
export const SESSION_EVENT = 'openhealth:session-expired'

function createClient(role) {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: { Accept: 'application/json' },
  })

  client.interceptors.request.use((config) => {
    const token = readToken(role)
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const apiError = toApiError(error)

      if (apiError.status === 401) {
        writeToken(role, null)
        writeCache(role, null)
        window.dispatchEvent(new CustomEvent(SESSION_EVENT, { detail: { role } }))
      }

      return Promise.reject(apiError)
    },
  )

  return client
}

/** Sends `Authorization: Bearer <patient token>` and clears it on 401. */
export const patientClient = createClient('patient')

/** Sends `Authorization: Bearer <doctor token>` and clears it on 401. */
export const doctorClient = createClient('doctor')

/** Unauthenticated client for login / register / password recovery. */
export const publicClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { Accept: 'application/json' },
})

publicClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error)),
)
