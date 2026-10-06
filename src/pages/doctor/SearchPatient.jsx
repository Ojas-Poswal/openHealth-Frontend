import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Info,
  KeyRound,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  UserSearch,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import Card, { CardHeader } from '../../components/ui/Card.jsx'
import Alert from '../../components/ui/Alert.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Input from '../../components/ui/Input.jsx'
import Field from '../../components/ui/Field.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { doctorsApi } from '../../api/doctors.api.js'
import { formatDate } from '../../utils/format.js'

/**
 * Patient lookup.
 *
 * GET /doctors/search/:ohid is an exact match on the OHID. There is no
 * name-search endpoint and no patient directory, so this page offers the
 * lookup that exists rather than pretending to search by name.
 */
export default function SearchPatient() {
  const navigate = useNavigate()

  const [ohid, setOhid] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const trimmed = ohid.trim()
  const formatLooksWrong = Boolean(trimmed) && !/^OH-/i.test(trimmed)

  const handleSearch = async (event) => {
    event.preventDefault()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const patient = await doctorsApi.searchPatientByOhid(trimmed)
      setResult(patient)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setOhid('')
    setResult(null)
    setError(null)
  }

  return (
    <>
      <PageHeader
        title="Find a patient"
        description="Look a patient up by the openHealth ID they give you, then request their consent to open the record."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Search by OHID"
              subtitle="An exact match — the ID starts with “OH-”."
              icon={Search}
            />

            <form onSubmit={handleSearch} className="mt-5 space-y-4">
              <Field
                label="Patient OHID"
                htmlFor="ohid"
                required
                hint="Ask the patient to read it from their profile page, or paste it straight from a message."
              >
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <Input
                    id="ohid"
                    value={ohid}
                    onChange={(event) => setOhid(event.target.value)}
                    placeholder="OH-xxxxxxxx-xxxx-…"
                    className="font-mono"
                    autoComplete="off"
                    spellCheck={false}
                    autoFocus
                  />
                  <Button type="submit" icon={Search} loading={loading} disabled={!trimmed} className="shrink-0">
                    Search
                  </Button>
                </div>
              </Field>

              {formatLooksWrong && !error && (
                <Alert tone="warning">
                  That does not look like an openHealth ID yet — they begin with “OH-”.
                </Alert>
              )}

              {error && (
                <Alert tone="error" title={error.status === 404 ? 'No such patient' : 'Search failed'}>
                  {error.status === 404 ? (
                    <>
                      No patient on openHealth has the ID{' '}
                      <span className="font-mono">{trimmed}</span>. The lookup is case-sensitive and
                      exact, so a single wrong character will miss — ask them to copy it from their
                      profile page rather than typing it out.
                    </>
                  ) : (
                    error.message
                  )}
                </Alert>
              )}
            </form>
          </Card>

          {result && (
            <Card className="animate-fade-in">
              <CardHeader
                title="Patient found"
                subtitle="Confirm this is the person in front of you before requesting access."
                icon={BadgeCheck}
                actions={
                  <Badge tone="mint" icon={ShieldCheck}>
                    Verified lookup
                  </Badge>
                }
              />

              <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-ink-600/60 bg-ink-800/40 p-5">
                <Avatar name={result.fullName} size="xl" ring />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-bold text-white">{result.fullName}</h3>
                  <p className="mt-0.5 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <BadgeCheck className="h-4 w-4 text-slate-500" aria-hidden="true" />
                      <span className="font-mono text-xs">{result.ohid}</span>
                    </span>
                  </p>
                </div>
              </div>

              <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                <Meta label="Blood group" value={result.bloodGroup} />
                <Meta
                  label="Date of birth"
                  value={result.dateOfBirth ? formatDate(result.dateOfBirth) : null}
                />
                <Meta label="Gender" value={result.gender} />
              </dl>

              {result.allergies?.length > 0 && (
                <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5">
                  <p className="label-base text-amber-200">Allergies on record</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.allergies.map((allergy) => (
                      <Badge key={allergy} tone="amber" size="sm">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5 border-t border-ink-600/60 pt-4">
                <Button variant="ghost" onClick={reset}>
                  Clear
                </Button>
                <Button
                  icon={KeyRound}
                  iconRight={ArrowRight}
                  onClick={() => navigate(`/doctor/patient/${result._id}`)}
                >
                  Request consent & open record
                </Button>
              </div>
            </Card>
          )}

          {!result && !error && !loading && (
            <EmptyState
              icon={UserSearch}
              title="No search yet"
              message="Enter an OHID above. Once a patient is found you can request consent, and their timeline opens as soon as they approve the code."
              compact
            />
          )}
        </div>

        <aside className="space-y-5">
          <Card>
            <CardHeader title="Why not search by name?" icon={Info} />
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              openHealth has no patient directory and no name index — by design. Two patients can share
              a name, and a directory would let any doctor browse the whole patient population. The
              only supported lookup is the exact ID.
            </p>
            <Alert tone="info" className="mt-4">
              If the patient does not know their OHID, they can read it from the Profile page in their
              own account.
            </Alert>
          </Card>

          <Card>
            <CardHeader title="Before you open a record" icon={KeyRound} />
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-400">
              <li>Check the name and blood group match who is with you.</li>
              <li>Ask them to give you the one-time code in person.</li>
              <li>Every view you make is written to their audit log.</li>
            </ul>
          </Card>

          <Card>
            <CardHeader title="What this shows" icon={Phone} />
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Only the details a doctor needs to confirm identity and prescribe safely: name, OHID,
              blood group, date of birth, gender and allergies. A patient's email and phone exist on
              the record but are not displayed in this interface.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="neutral" icon={Mail} size="sm">
                Email not shown
              </Badge>
              <Badge tone="neutral" icon={Phone} size="sm">
                Phone not shown
              </Badge>
            </div>
            <div className="mt-4">
              <Link to="/doctor/sessions">
                <Button variant="ghost" size="sm" iconRight={ArrowRight}>
                  My active sessions
                </Button>
              </Link>
            </div>
          </Card>
        </aside>
      </div>
    </>
  )
}

function Meta({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm capitalize text-slate-200">{value || '—'}</dd>
    </div>
  )
}
