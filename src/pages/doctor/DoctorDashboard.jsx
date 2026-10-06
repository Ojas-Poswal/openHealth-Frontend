import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  KeyRound,
  RotateCw,
  Search,
  ShieldCheck,
  Stethoscope,
  UserCheck,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import Card, { CardFooter, CardHeader } from '../../components/ui/Card.jsx'
import Alert from '../../components/ui/Alert.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Input from '../../components/ui/Input.jsx'
import Field from '../../components/ui/Field.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import Meter from '../../components/ui/Meter.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import { SkeletonCards } from '../../components/ui/Skeleton.jsx'
import { useDoctorAuth } from '../../context/DoctorAuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { doctorsApi } from '../../api/doctors.api.js'
import { formatDateTime } from '../../utils/format.js'

/**
 * Doctor dashboard.
 *
 * There is no "list all patients" endpoint — and deliberately so: a doctor
 * has no standing access to anyone's record. Everything a doctor can open is
 * reached from an active consent session or from an OHID they were given, so
 * the dashboard is built around those two things.
 */
export default function DoctorDashboard() {
  const { doctor } = useDoctorAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const sessions = useAsync(() => doctorsApi.getActiveSessions(), [], { emptyOn: [404] })

  const [ohid, setOhid] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)

  const sessionList = sessions.data ?? []

  /** How much of the editable profile is filled in — a real nudge, not a score. */
  const profileFields = useMemo(
    () => ['fullName', 'phone', 'qualification', 'specialization', 'workplace'],
    [],
  )
  const filledFields = profileFields.filter((field) => Boolean(doctor?.[field])).length
  const profilePercent = Math.round((filledFields / profileFields.length) * 100)

  const handleSearch = async (event) => {
    event.preventDefault()
    const value = ohid.trim()
    if (!value) return

    setSearching(true)
    setSearchError(null)
    try {
      const patient = await doctorsApi.searchPatientByOhid(value)
      toast.success(`Found ${patient.fullName}.`)
      navigate(`/doctor/patient/${patient._id}`)
    } catch (error) {
      setSearchError(error)
    } finally {
      setSearching(false)
    }
  }

  return (
    <>
      <PageHeader
        title={`Welcome, ${doctor?.fullName?.split(' ')[0] ?? 'doctor'}`}
        description="Open a patient's timeline with their consent, or pick up a session you already hold."
        actions={
          <>
            <Button
              variant="ghost"
              icon={RotateCw}
              onClick={sessions.refresh}
              loading={sessions.refreshing}
            >
              Refresh
            </Button>
            <Link to="/doctor/search">
              <Button icon={Search}>Search patients</Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {/* --- Find a patient ---------------------------------------- */}
          <Card>
            <CardHeader
              title="Find a patient"
              subtitle="Enter the openHealth ID they gave you."
              icon={Search}
            />

            <form onSubmit={handleSearch} className="mt-5 space-y-4">
              <Field
                label="Patient OHID"
                htmlFor="ohid"
                hint="The lookup is an exact match — copy the ID rather than typing it from memory."
              >
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <Input
                    id="ohid"
                    value={ohid}
                    onChange={(event) => setOhid(event.target.value)}
                    placeholder="OH-xxxxxxxx-xxxx-…"
                    autoComplete="off"
                    spellCheck={false}
                    className="font-mono"
                    error={Boolean(searchError)}
                  />
                  <Button type="submit" loading={searching} disabled={!ohid.trim()} className="shrink-0">
                    Look up
                  </Button>
                </div>
              </Field>

              {searchError && (
                <Alert tone="error" title="No patient found">
                  {searchError.status === 404
                    ? 'No patient on openHealth has that ID. Check it with the patient — the match has to be exact.'
                    : searchError.message}
                </Alert>
              )}
            </form>

            <CardFooter>
              <Alert tone="info">
                A doctor cannot browse or list patients. The only way into a record is an ID a patient
                gave you, or a consent session they approved — and either way they can revoke it.
              </Alert>
            </CardFooter>
          </Card>

          {/* --- Active sessions --------------------------------------- */}
          <Card>
            <CardHeader
              title="Patients you can currently open"
              subtitle="Consent is live for these patients."
              icon={UserCheck}
              actions={
                <Link to="/doctor/sessions">
                  <Button variant="ghost" size="sm" iconRight={ArrowRight}>
                    Manage
                  </Button>
                </Link>
              }
            />

            <div className="mt-4">
              {sessions.loading ? (
                <SkeletonCards count={1} />
              ) : sessions.error ? (
                <ErrorState error={sessions.error} onRetry={sessions.refetch} compact />
              ) : sessionList.length === 0 ? (
                <EmptyState
                  icon={ShieldCheck}
                  title="No active sessions"
                  message="When a patient approves your request with their one-time code, their timeline opens here for the rest of the session."
                  compact
                  action={
                    <Link to="/doctor/search">
                      <Button variant="secondary" icon={Search}>
                        Look up a patient
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <ul className="space-y-3">
                  {sessionList.slice(0, 4).map((session) => (
                    <li
                      key={session._id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-600/70 bg-ink-900/40 p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={session.patientId?.fullName} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {session.patientId?.fullName ?? 'Patient'}
                          </p>
                          <p className="mt-0.5 font-mono text-xs text-slate-500">
                            {session.patientId?.ohid ?? '—'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="hidden text-xs text-slate-500 sm:inline">
                          since {formatDateTime(session.createdAt)}
                        </span>
                        <Link to={`/doctor/patient/${session.patientId?._id}`}>
                          <Button size="sm" iconRight={ArrowRight}>
                            Open
                          </Button>
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {sessionList.length > 4 && (
              <CardFooter className="justify-center">
                <Link to="/doctor/sessions">
                  <Button variant="ghost" size="sm">
                    See all {sessionList.length} sessions
                  </Button>
                </Link>
              </CardFooter>
            )}
          </Card>

          {/* --- How consent works -------------------------------------- */}
          <Card>
            <CardHeader title="How access works" icon={KeyRound} />
            <ol className="mt-4 space-y-4">
              {[
                {
                  title: 'You request consent',
                  body: 'openHealth generates a one-time code for that patient and writes the request into their audit log.',
                },
                {
                  title: 'The patient gives you the code',
                  body: 'Read the code to them and confirm they want you to see their record. Nothing is shared until the code is verified.',
                },
                {
                  title: 'You verify and the session opens',
                  body: 'Their timeline, reports, prescriptions and AI summary become readable, and every view is logged.',
                },
                {
                  title: 'Either side can end it',
                  body: 'You can end the session, and the patient can revoke consent at any moment — access stops immediately.',
                },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-3.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-soft text-xs font-bold text-brand-200 ring-1 ring-inset ring-brand-400/25">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{step.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* --- Aside ---------------------------------------------------- */}
        <aside className="space-y-5">
          <Card>
            <CardHeader title="Your profile" icon={Stethoscope} />
            <div className="mt-4 flex items-center gap-3.5">
              <Avatar name={doctor?.fullName} size="lg" ring />
              <div className="min-w-0">
                <p className="font-display text-base font-bold text-white">
                  {doctor?.fullName ?? 'Doctor'}
                </p>
                <p className="mt-0.5 text-sm text-slate-400">
                  {doctor?.specialization || 'Specialisation not set'}
                </p>
              </div>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4 border-b border-ink-600/40 pb-2.5">
                <dt className="inline-flex shrink-0 items-center gap-2 text-slate-400">
                  <BadgeCheck className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  DHID
                </dt>
                <dd className="min-w-0 break-all text-right font-mono text-xs text-slate-200">
                  {doctor?.dhid ?? '—'}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-ink-600/40 pb-2.5">
                <dt className="shrink-0 text-slate-400">Qualification</dt>
                <dd className="text-right font-medium text-slate-200">
                  {doctor?.qualification || '—'}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="shrink-0 text-slate-400">Workplace</dt>
                <dd className="text-right font-medium text-slate-200">{doctor?.workplace || '—'}</dd>
              </div>
            </dl>

            <div className="mt-5">
              <Meter
                value={filledFields}
                max={profileFields.length}
                tone={profilePercent === 100 ? 'mint' : 'amber'}
                label="Profile completeness"
                valueText={`${filledFields} of ${profileFields.length} fields`}
              />
            </div>

            <CardFooter className="justify-end">
              <Link to="/doctor/profile">
                <Button variant="secondary" size="sm">
                  Edit profile
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader title="What you cannot do" icon={ShieldCheck} />
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-400">
              <li>You cannot see anyone's digital will, ever.</li>
              <li>You cannot see a patient who has not consented.</li>
              <li>You cannot edit or delete anything a patient recorded.</li>
              <li>What you can add is a prescription and a note on a report.</li>
            </ul>
          </Card>

          <Card>
            <CardHeader title="Session expiry" icon={CalendarClock} />
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Consent codes are valid for ten minutes, and a doctor's own sign-in lasts seven days.
              Access, though, lasts only as long as the patient allows it.
            </p>
          </Card>
        </aside>
      </div>
    </>
  )
}
