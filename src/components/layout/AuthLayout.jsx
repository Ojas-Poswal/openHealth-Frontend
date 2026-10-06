import { Link } from 'react-router-dom'
import { Activity, ShieldCheck, Sparkles, Users } from 'lucide-react'
import Logo from './Logo.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { pingApi } from '../../api/health.api.js'

const HIGHLIGHTS = [
  {
    icon: Activity,
    title: 'One timeline for everything',
    body: 'Every illness becomes a card holding its reports, prescriptions and advice.',
  },
  {
    icon: Sparkles,
    title: 'Summarised on demand',
    body: 'Generate a short medical summary your doctor can read in seconds.',
  },
  {
    icon: Users,
    title: 'Built for families',
    body: 'Share records with the people who look after you — on your terms.',
  },
  {
    icon: ShieldCheck,
    title: 'Consent, always',
    body: 'No doctor sees your history until you hand them a one-time code.',
  },
]

/**
 * Split-screen shell for the sign-in / sign-up / recovery screens.
 * The left panel carries the brand story, the right panel the form.
 */
export default function AuthLayout({ title, subtitle, children, footer, wide = false }) {
  return (
    <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden border-r border-ink-600/50 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,197,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(148,197,255,0.35) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-brand-400/20 blur-[100px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-mint-400/15 blur-[110px]" aria-hidden="true" />

        <Link to="/" className="relative">
          <Logo size="lg" />
        </Link>

        <div className="relative max-w-lg">
          <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white">
            Your medical history,
            <br />
            <span className="text-gradient">finally in one place.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            openHealth keeps every diagnosis, report and prescription together — so nothing gets
            forgotten at home, and no doctor has to guess the rest of your story.
          </p>

          <ul className="mt-9 space-y-5">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="flex items-start gap-4">
                <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft ring-1 ring-inset ring-brand-400/20">
                  <item.icon className="h-5 w-5 text-brand-300" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-slate-100">{item.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <BackendStatus />
      </section>

      {/* Form panel */}
      <section className="flex flex-1 overflow-y-auto px-5 pt-6 pb-10 sm:px-8 sm:pt-8 sm:pb-12">
        {/* `m-auto` rather than `items-center` on the section: it centres the
            card when there is room, but pins it to the top and lets the panel
            scroll when there is not — flex centring would clip the sign-up
            links off the top of a short viewport. */}
        <div className={`m-auto w-full ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
          <Link to="/" className="mb-6 inline-flex lg:hidden">
            <Logo size="md" />
          </Link>

          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-slate-400">{subtitle}</p>}

          <div className="mt-6">{children}</div>

          {footer && <div className="mt-6 text-sm text-slate-400">{footer}</div>}
        </div>
      </section>
    </div>
  )
}

function BackendStatus() {
  const { data, error, loading } = useAsync(() => pingApi(), [])

  const state = loading
    ? { tone: 'bg-slate-400', text: 'Checking the openHealth API…' }
    : error
      ? { tone: 'bg-rose-400', text: 'API unreachable — is the backend running on :8000?' }
      : { tone: 'bg-mint-400', text: data }

  return (
    <p className="relative inline-flex items-center gap-2.5 text-xs text-slate-500">
      <span className={`h-2 w-2 shrink-0 rounded-full ${state.tone}`} aria-hidden="true" />
      {state.text}
    </p>
  )
}
