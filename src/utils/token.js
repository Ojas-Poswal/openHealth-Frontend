/**
 * JWT helpers.
 *
 * The backend issues two kinds of tokens from the same secret:
 *   - patients: payload { patientID, ohid }
 *   - doctors:  payload { doctorId, dhid }
 * Both expire after 7 days. We decode the payload locally so an expired
 * session can be detected before firing a request at a protected route.
 */

const STORAGE = {
  patientToken: 'openhealth.patient.token',
  doctorToken: 'openhealth.doctor.token',
  patientCache: 'openhealth.patient.cache',
  doctorCache: 'openhealth.doctor.cache',
}

/** Decode a JWT payload without verifying the signature. */
export function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(
      decodeURIComponent(
        json
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      ),
    )
  } catch {
    return null
  }
}

/** True when the token is missing, malformed, or past its `exp`. */
export function isTokenExpired(token) {
  const payload = decodeToken(token)
  if (!payload?.exp) return true
  return payload.exp * 1000 <= Date.now()
}

export function readToken(role) {
  const key = role === 'doctor' ? STORAGE.doctorToken : STORAGE.patientToken
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeToken(role, token) {
  const key = role === 'doctor' ? STORAGE.doctorToken : STORAGE.patientToken
  try {
    if (token) localStorage.setItem(key, token)
    else localStorage.removeItem(key)
  } catch {
    /* storage disabled — session simply won't persist */
  }
}

export function readCache(role) {
  const key = role === 'doctor' ? STORAGE.doctorCache : STORAGE.patientCache
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeCache(role, value) {
  const key = role === 'doctor' ? STORAGE.doctorCache : STORAGE.patientCache
  try {
    if (value) localStorage.setItem(key, JSON.stringify(value))
    else localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

export { STORAGE }
