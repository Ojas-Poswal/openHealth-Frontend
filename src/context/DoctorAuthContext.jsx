import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { doctorsApi } from '../api/doctors.api.js'
import { SESSION_EVENT } from '../api/client.js'
import { readToken, writeToken, readCache, writeCache, isTokenExpired } from '../utils/token.js'

const DoctorAuthContext = createContext(null)

/** Doctor session — deliberately separate from the patient session. */
export function DoctorAuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = readToken('doctor')
    if (stored && isTokenExpired(stored)) {
      writeToken('doctor', null)
      return null
    }
    return stored
  })
  const [doctor, setDoctor] = useState(() => (readToken('doctor') ? readCache('doctor') : null))
  const [booting, setBooting] = useState(() => Boolean(readToken('doctor')))

  const logout = useCallback(() => {
    writeToken('doctor', null)
    writeCache('doctor', null)
    setToken(null)
    setDoctor(null)
  }, [])

  const loadProfile = useCallback(async () => {
    try {
      const profile = await doctorsApi.getProfile()
      setDoctor(profile)
      writeCache('doctor', profile)
      return profile
    } catch (error) {
      if (error?.status === 401 || error?.status === 404) logout()
      return null
    }
  }, [logout])

  // The mount effect only exists to restore a session from storage; once that
  // has run, `login` owns loading the profile itself.
  const restored = useRef(false)

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

  useEffect(() => {
    const onExpired = (event) => {
      if (event.detail?.role === 'doctor') logout()
    }
    window.addEventListener(SESSION_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EVENT, onExpired)
  }, [logout])

  const login = useCallback(
    async (credentials) => {
      const data = await doctorsApi.login(credentials)

      // Hold the protected routes until the profile is in hand. Without this
      // the dashboard paints first and greets the doctor without a name.
      setBooting(true)

      if (data.doctor) {
        setDoctor(data.doctor)
        writeCache('doctor', data.doctor)
      }

      writeToken('doctor', data.token)
      setToken(data.token)

      await loadProfile()
      setBooting(false)

      return data
    },
    [loadProfile],
  )

  const register = useCallback((payload) => doctorsApi.register(payload), [])

  const updateDoctor = useCallback((profile) => {
    if (!profile) return
    setDoctor(profile)
    writeCache('doctor', profile)
  }, [])

  const value = useMemo(
    () => ({
      token,
      doctor,
      doctorId: doctor?._id ?? null,
      dhid: doctor?.dhid ?? null,
      isAuthenticated: Boolean(token),
      booting,
      login,
      register,
      logout,
      refresh: loadProfile,
      updateDoctor,
    }),
    [token, doctor, booting, login, register, logout, loadProfile, updateDoctor],
  )

  return <DoctorAuthContext.Provider value={value}>{children}</DoctorAuthContext.Provider>
}

export function useDoctorAuth() {
  const context = useContext(DoctorAuthContext)
  if (!context) throw new Error('useDoctorAuth must be used inside <DoctorAuthProvider>')
  return context
}
