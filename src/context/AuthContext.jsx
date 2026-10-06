import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { patientsApi } from '../api/patients.api.js'
import { SESSION_EVENT } from '../api/client.js'
import { readToken, writeToken, readCache, writeCache, isTokenExpired } from '../utils/token.js'

const AuthContext = createContext(null)

/**
 * Patient session.
 *
 * The token is stored under its own key so a signed-in patient and a
 * signed-in doctor can coexist in the same browser without clobbering each
 * other — both token flavours are signed with the same secret but carry
 * different payloads.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = readToken('patient')
    if (stored && isTokenExpired(stored)) {
      writeToken('patient', null)
      return null
    }
    return stored
  })
  const [patient, setPatient] = useState(() => (readToken('patient') ? readCache('patient') : null))
  const [booting, setBooting] = useState(() => Boolean(readToken('patient')))

  const logout = useCallback(() => {
    writeToken('patient', null)
    writeCache('patient', null)
    setToken(null)
    setPatient(null)
  }, [])

  const loadProfile = useCallback(async () => {
    try {
      const profile = await patientsApi.getProfile()
      setPatient(profile)
      writeCache('patient', profile)
      return profile
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) logout()
      return null
    }
  }, [logout])

  // The mount effect only exists to restore a session from storage; once that
  // has run, `login` owns loading the profile itself.
  const restored = useRef(false)

  // Restore the session on first paint.
  useEffect(() => {
    if (restored.current) return
    restored.current = true

    if (!token) {
      setBooting(false)
      return
    }
    // No cancellation flag here on purpose. StrictMode mounts, unmounts and
    // remounts this effect in development, so the guard above lets the *first*
    // run be the only one — and a cleanup that cancelled it would leave
    // `booting` true forever, with the route stuck on "Restoring your session".
    ;(async () => {
      await loadProfile()
      setBooting(false)
    })()
  }, [token, loadProfile])

  // The axios interceptor clears the token on any 401; mirror that here.
  useEffect(() => {
    const onExpired = (event) => {
      if (event.detail?.role === 'patient') logout()
    }
    window.addEventListener(SESSION_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EVENT, onExpired)
  }, [logout])

  const login = useCallback(
    async (credentials) => {
      const data = await patientsApi.login(credentials)

      // Hold the protected routes until the profile is in hand, so no page
      // paints against a patient that has not loaded yet.
      setBooting(true)

      if (data.patient) {
        setPatient(data.patient)
        writeCache('patient', data.patient)
      }

      writeToken('patient', data.token)
      setToken(data.token)

      await loadProfile()
      setBooting(false)

      return data
    },
    [loadProfile],
  )

  const register = useCallback((payload) => patientsApi.register(payload), [])

  const updatePatient = useCallback((profile) => {
    if (!profile) return
    setPatient(profile)
    writeCache('patient', profile)
  }, [])

  const value = useMemo(
    () => ({
      token,
      patient,
      patientId: patient?._id ?? null,
      ohid: patient?.ohid ?? null,
      isAuthenticated: Boolean(token),
      booting,
      login,
      register,
      logout,
      refresh: loadProfile,
      updatePatient,
    }),
    [token, patient, booting, login, register, logout, loadProfile, updatePatient],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
