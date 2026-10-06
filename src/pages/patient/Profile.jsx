import { useMemo, useState } from 'react'
import {
  BadgeCheck,
  CalendarDays,
  Check,
  Copy,
  Mail,
  Phone,
  RotateCw,
  Save,
  ShieldCheck,
  User,
  X,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import Card, { CardFooter, CardHeader } from '../../components/ui/Card.jsx'
import Alert from '../../components/ui/Alert.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Field from '../../components/ui/Field.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import { PageSpinner } from '../../components/ui/Spinner.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useMutation } from '../../hooks/useMutation.js'
import { patientsApi } from '../../api/patients.api.js'
import { BLOOD_GROUP_OPTIONS, GENDER_OPTIONS } from '../../utils/constants.js'
import { formatDate } from '../../utils/format.js'

/** Splits a stored date into the `YYYY-MM-DD` an <input type="date"> needs. */
function toDateInput(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

/**
 * Patient profile.
 *
 * POST-side identity (email, OHID) is immutable — the backend's PATCH reads
 * only fullName, phone, dateOfBirth, gender, bloodGroup and allergies, so
 * those are the only editable fields here and the rest are shown read-only
 * rather than offered and silently ignored.
 */
export default function Profile() {
  const { patient: cached, updatePatient, refresh } = useAuth()
  const toast = useToast()

  const profile = useAsync(() => patientsApi.getProfile(), [])
  const patient = profile.data ?? cached

  const [copied, setCopied] = useState(false)

  if (profile.loading && !patient) return <PageSpinner label="Loading your profile…" />

  if (profile.error && !patient) {
    return (
      <>
        <PageHeader title="Profile" />
        <ErrorState error={profile.error} onRetry={profile.refetch} />
      </>
    )
  }

  const copyOhid = async () => {
    if (!patient?.ohid) return
    try {
      await navigator.clipboard.writeText(patient.ohid)
      setCopied(true)
      toast.success('OHID copied — share this so family can invite you.')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy automatically. Select the ID and copy it manually.')
    }
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your identity on openHealth, what you are allergic to, and your password."
        actions={
          <Button
            variant="ghost"
            icon={RotateCw}
            onClick={profile.refetch}
            loading={profile.refreshing}
          >
            Refresh
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <PersonalDetails
            patient={patient}
            onSaved={(updated) => {
              updatePatient(updated)
              profile.setData(updated)
            }}
          />
        </div>

        <aside className="space-y-5">
          <Card>
            <CardHeader title="Your openHealth ID" icon={BadgeCheck} />
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Family members use this ID to invite you into a group, and a doctor uses it to find you.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-brand-400/25 bg-brand-soft p-3.5">
              <code className="min-w-0 flex-1 break-all font-mono text-xs text-brand-100">
                {patient?.ohid ?? 'Not assigned'}
              </code>
              <Button
                variant="ghost"
                size="sm"
                icon={copied ? Check : Copy}
                onClick={copyOhid}
                aria-label="Copy your OHID"
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Account" icon={ShieldCheck} />
            <dl className="mt-4 space-y-3 text-sm">
              <Row icon={Mail} label="Email" value={patient?.email} />
              <Row icon={Phone} label="Phone" value={patient?.phone} />
              <Row
                icon={CalendarDays}
                label="Member since"
                value={patient?.createdAt ? formatDate(patient.createdAt) : null}
              />
            </dl>
            <CardFooter>
              <Alert tone="info">
                Your email and OHID are fixed once the account is created — the API does not accept
                changes to them.
              </Alert>
            </CardFooter>
          </Card>
        </aside>
      </div>
    </>
  )
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink-600/40 pb-2.5 last:border-0">
      <dt className="inline-flex shrink-0 items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
        {label}
      </dt>
      <dd className="min-w-0 break-all text-right font-medium text-slate-200">{value || '—'}</dd>
    </div>
  )
}

function PersonalDetails({ patient, onSaved }) {
  const toast = useToast()

  const [form, setForm] = useState(() => ({
    fullName: patient?.fullName ?? '',
    phone: patient?.phone ?? '',
    dateOfBirth: toDateInput(patient?.dateOfBirth),
    gender: patient?.gender ?? '',
    bloodGroup: patient?.bloodGroup ?? '',
  }))
  const [allergies, setAllergies] = useState(() => patient?.allergies ?? [])
  const [allergyDraft, setAllergyDraft] = useState('')
  const [touched, setTouched] = useState(false)

  const save = useMutation((payload) => patientsApi.updateProfile(payload))

  const errors = useMemo(
    () => ({
      fullName: !form.fullName.trim() ? 'Your name is required.' : null,
      phone: !form.phone.trim() ? 'A phone number is required.' : null,
    }),
    [form.fullName, form.phone],
  )
  const valid = Object.values(errors).every((value) => value === null)

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const addAllergy = () => {
    const value = allergyDraft.trim()
    if (!value) return
    if (allergies.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setAllergyDraft('')
      return
    }
    setAllergies((current) => [...current, value])
    setAllergyDraft('')
  }

  const handleAllergyKey = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addAllergy()
    } else if (event.key === 'Backspace' && !allergyDraft && allergies.length > 0) {
      setAllergies((current) => current.slice(0, -1))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setTouched(true)
    if (!valid) return

    // A draft still sitting in the input would otherwise be lost when the
    // button takes focus before `onBlur` commits it.
    const pending = allergyDraft.trim()
    const finalAllergies =
      pending && !allergies.some((item) => item.toLowerCase() === pending.toLowerCase())
        ? [...allergies, pending]
        : allergies

    const result = await save.run({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      dateOfBirth: form.dateOfBirth || undefined,
      gender: form.gender || undefined,
      bloodGroup: form.bloodGroup || undefined,
      allergies: finalAllergies,
    })

    if (!result) {
      toast.error(save.error?.message ?? 'Could not save your profile.')
      return
    }

    toast.success('Profile updated.')
    setAllergies(finalAllergies)
    setAllergyDraft('')
    onSaved(result)
  }

  return (
    <Card>
      <CardHeader
        title="Personal details"
        subtitle="These travel with your timeline, so a doctor sees them without asking."
        icon={User}
      />

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        {save.error && <Alert tone="error">{save.error.message}</Alert>}

        <div className="flex items-center gap-4">
          <Avatar name={form.fullName} size="lg" />
          <div className="min-w-0">
            <p className="font-display text-base font-bold text-white">
              {form.fullName || 'Your name'}
            </p>
            <p className="mt-0.5 font-mono text-xs text-slate-500">{patient?.ohid}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full name"
            htmlFor="fullName"
            required
            error={touched ? errors.fullName : null}
            className="sm:col-span-2"
          >
            <Input
              id="fullName"
              value={form.fullName}
              onChange={set('fullName')}
              error={touched && errors.fullName}
              autoComplete="name"
            />
          </Field>

          <Field
            label="Phone"
            htmlFor="phone"
            required
            error={touched ? errors.phone : null}
            hint="Used for account recovery."
          >
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              error={touched && errors.phone}
              autoComplete="tel"
            />
          </Field>

          <Field label="Date of birth" htmlFor="dateOfBirth">
            <Input
              id="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={set('dateOfBirth')}
              max={new Date().toISOString().slice(0, 10)}
            />
          </Field>

          <Field label="Gender" htmlFor="gender">
            <Select
              id="gender"
              options={GENDER_OPTIONS}
              placeholder="Not specified"
              value={form.gender}
              onChange={set('gender')}
            />
          </Field>

          <Field label="Blood group" htmlFor="bloodGroup">
            <Select
              id="bloodGroup"
              options={BLOOD_GROUP_OPTIONS}
              placeholder="Not specified"
              value={form.bloodGroup}
              onChange={set('bloodGroup')}
            />
          </Field>
        </div>

        <div>
          <label className="label-base" htmlFor="allergy-input">
            Allergies
          </label>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ink-600 bg-ink-900/60 p-2.5 focus-within:border-brand-400/60">
            {allergies.map((allergy) => (
              <span
                key={allergy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400/12 py-1 pl-2.5 pr-1.5 text-xs font-medium text-amber-200 ring-1 ring-inset ring-amber-400/30"
              >
                {allergy}
                <button
                  type="button"
                  onClick={() => setAllergies((current) => current.filter((item) => item !== allergy))}
                  className="rounded p-0.5 transition hover:bg-amber-400/20"
                  aria-label={`Remove ${allergy}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            <input
              id="allergy-input"
              value={allergyDraft}
              onChange={(event) => setAllergyDraft(event.target.value)}
              onKeyDown={handleAllergyKey}
              onBlur={addAllergy}
              placeholder={allergies.length === 0 ? 'e.g. Penicillin — press Enter' : 'Add another…'}
              className="min-w-[10rem] flex-1 bg-transparent px-1.5 py-1 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
            Press Enter or comma after each one. A doctor sees these before prescribing.
          </p>
        </div>

        <CardFooter className="justify-end">
          <Button type="submit" icon={Save} loading={save.loading} disabled={!valid && touched}>
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
