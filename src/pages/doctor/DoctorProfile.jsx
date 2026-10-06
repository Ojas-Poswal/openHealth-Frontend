import { useMemo, useState } from 'react'
import {
  BadgeCheck,
  GraduationCap,
  Hash,
  Mail,
  RotateCw,
  Save,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import Card, { CardFooter, CardHeader } from '../../components/ui/Card.jsx'
import Alert from '../../components/ui/Alert.jsx'
import Field from '../../components/ui/Field.jsx'
import Input from '../../components/ui/Input.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import Meter from '../../components/ui/Meter.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import { PageSpinner } from '../../components/ui/Spinner.jsx'
import { useDoctorAuth } from '../../context/DoctorAuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useMutation } from '../../hooks/useMutation.js'
import { doctorsApi } from '../../api/doctors.api.js'

/**
 * Doctor profile.
 *
 * PATCH /doctors/profile applies each field only when it is truthy, so a
 * blank input cannot clear an existing value — the form says so rather than
 * letting a doctor believe they have erased something.
 */
export default function DoctorProfile() {
  const { doctor: cached, updateDoctor } = useDoctorAuth()

  const profile = useAsync(() => doctorsApi.getProfile(), [])
  const doctor = profile.data ?? cached

  if (profile.loading && !doctor) return <PageSpinner label="Loading your profile…" />

  if (profile.error && !doctor) {
    return (
      <>
        <PageHeader title="Profile" />
        <ErrorState error={profile.error} onRetry={profile.refetch} />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description="How patients and other doctors see you, and the password protecting your account."
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
          <ProfessionalDetails
            doctor={doctor}
            onSaved={(updated) => {
              updateDoctor(updated)
              profile.setData(updated)
            }}
          />
        </div>

        <aside className="space-y-5">
          <Card>
            <CardHeader title="Your identity" icon={BadgeCheck} />
            <div className="mt-4 flex items-center gap-3.5">
              <Avatar name={doctor?.fullName} size="xl" ring />
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
              <Row icon={BadgeCheck} label="DHID" value={doctor?.dhid} mono />
              <Row icon={Hash} label="Registration" value={doctor?.registrationNumber} mono />
              <Row icon={Mail} label="Email" value={doctor?.email} />
            </dl>

            <CardFooter>
              <Alert tone="info">
                Your DHID, registration number and email are set at registration and cannot be changed
                through the API.
              </Alert>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader title="What patients rely on" icon={ShieldCheck} />
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              A patient sees your name, DHID and specialisation when you request their consent. Keeping
              these accurate is what lets them confirm it is really you before they hand over a code.
            </p>
          </Card>
        </aside>
      </div>
    </>
  )
}

function Row({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink-600/40 pb-2.5 last:border-0">
      <dt className="inline-flex shrink-0 items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
        {label}
      </dt>
      <dd
        className={`min-w-0 break-all text-right text-slate-200 ${
          mono ? 'font-mono text-xs' : 'font-medium'
        }`}
      >
        {value || '—'}
      </dd>
    </div>
  )
}

function ProfessionalDetails({ doctor, onSaved }) {
  const toast = useToast()

  const [form, setForm] = useState(() => ({
    fullName: doctor?.fullName ?? '',
    phone: doctor?.phone ?? '',
    qualification: doctor?.qualification ?? '',
    specialization: doctor?.specialization ?? '',
    workplace: doctor?.workplace ?? '',
  }))
  const [touched, setTouched] = useState(false)

  const save = useMutation((payload) => doctorsApi.updateProfile(payload))

  const errors = useMemo(
    () => ({
      fullName: !form.fullName.trim() ? 'Your name is required.' : null,
      phone: !form.phone.trim() ? 'A phone number is required.' : null,
    }),
    [form.fullName, form.phone],
  )
  const valid = Object.values(errors).every((value) => value === null)

  const filled = ['fullName', 'phone', 'qualification', 'specialization', 'workplace'].filter(
    (field) => Boolean(doctor?.[field]),
  ).length

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setTouched(true)
    if (!valid) return

    const result = await save.run({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      qualification: form.qualification.trim(),
      specialization: form.specialization.trim(),
      workplace: form.workplace.trim(),
    })

    if (!result) {
      toast.error(save.error?.message ?? 'Could not save your profile.')
      return
    }

    toast.success('Profile updated.')
    onSaved(result)
  }

  return (
    <Card>
      <CardHeader
        title="Professional details"
        subtitle="Shown to a patient when you ask for consent."
        icon={Stethoscope}
      />

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        {save.error && <Alert tone="error">{save.error.message}</Alert>}

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

          <Field
            label="Qualification"
            htmlFor="qualification"
            hint="e.g. MBBS, MD"
          >
            <Input
              id="qualification"
              value={form.qualification}
              onChange={set('qualification')}
              placeholder="MBBS, MD"
            />
          </Field>

          <Field
            label="Specialisation"
            htmlFor="specialization"
            hint="What you want patients to see when you request access."
          >
            <Input
              id="specialization"
              value={form.specialization}
              onChange={set('specialization')}
              placeholder="e.g. Cardiologist"
            />
          </Field>

          <Field label="Workplace" htmlFor="workplace">
            <Input
              id="workplace"
              value={form.workplace}
              onChange={set('workplace')}
              placeholder="e.g. City General Hospital"
            />
          </Field>
        </div>

        <div className="rounded-2xl border border-ink-600/60 bg-ink-800/40 p-4">
          <Meter
            value={filled}
            max={5}
            tone={filled === 5 ? 'mint' : 'amber'}
            label="Profile completeness"
            valueText={`${filled} of 5 fields`}
          />
        </div>

        <Alert tone="warning" title="Blanking a field will not clear it">
          The API only applies a field when it has a value, so sending an empty box leaves what is
          already stored in place. If something needs to be removed, that has to be done directly in
          the database.
        </Alert>

        <CardFooter className="justify-end">
          <Button type="submit" icon={Save} loading={save.loading} disabled={!valid && touched}>
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
