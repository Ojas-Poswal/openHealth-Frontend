import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  FileText,
  KeyRound,
  Lock,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react'
import Logo, { LogoMark } from '../components/layout/Logo.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'

const FEATURES = [
  {
    icon: Activity,
    title: 'The timeline',
    body: 'Every illness becomes a card — January 2026, ulcers — holding what happened, the diagnosis, the verdict, the advice, the reports and the prescription. Your whole story, in order.',
  },
  {
    icon: Sparkles,
    title: 'AI summary',
    body: 'Condense the entire timeline into a few lines your doctor can read in seconds. Generate a fresh one whenever your history changes; the last summary is always kept.',
  },
  {
    icon: Users,
    title: 'Family groups',
    body: 'Invite family by their OHID and see each other’s timelines and summaries. Useful when you are the one managing everyone’s appointments.',
  },
  {
    icon: ScrollText,
    title: 'Digital will',
    body: 'Insurance, property, accounts and final wishes in one locked vault — readable only by you, or by your family after a death certificate is approved.',
  },
  {
    icon: ShieldCheck,
    title: 'Consented doctor access',
    body: 'A doctor requests access; you read out a one-time code; the session opens. You can revoke it whenever you like, and every view is logged.',
  },
  {
    icon: FileText,
    title: 'Reports that never go missing',
    body: 'Scan the paper report once and it lives with its case forever — no more forgetting the file at home on the day of the appointment.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-ink-600/40 bg-ink-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo size="md" />
          <nav className="flex items-center gap-2">
            <Link to="/doctor/login" className="hidden sm:block">
              <Button variant="ghost" size="sm" icon={Stethoscope}>
                For doctors
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Get started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-brand-400/12 blur-[130px]" aria-hidden="true" />

          <div className="relative mx-auto max-w-4xl text-center">
            <Badge tone="brand" className="mb-6">
              Your health record, in your hands
            </Badge>

            <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl">
              Nobody should have to
              <br />
              <span className="text-gradient">remember their whole medical history.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
              Prescriptions get lost. Reports stay at home. And at the appointment, half the story goes
              untold. openHealth keeps every case, document and decision in one timeline — ready for any
              doctor, any time.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <Button size="lg" iconRight={ArrowRight}>
                  Create your timeline
                </Button>
              </Link>
              <Link to="/doctor/register">
                <Button size="lg" variant="secondary" icon={Stethoscope}>
                  I&rsquo;m a doctor
                </Button>
              </Link>
            </div>

            <p className="mt-5 text-xs text-slate-500">
              Free for patients · No doctor sees anything without your one-time code
            </p>
          </div>

          {/* Timeline illustration built from the real card anatomy */}
          <div className="relative mx-auto mt-16 max-w-3xl">
            <div className="surface p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <LogoMark size="sm" />
                <span className="text-sm font-semibold text-slate-300">Your timeline</span>
                <span className="h-px flex-1 bg-ink-600/70" />
              </div>

              <ol className="relative space-y-5 border-l border-ink-600/60 pl-6">
                {[
                  { when: 'August 2025', what: 'Peptic ulcer', tone: 'bg-brand-gradient', meta: '2 reports · 3 medicines · 1 note' },
                  { when: 'January 2026', what: 'Dengue fever', tone: 'bg-mint-400', meta: '4 reports · 2 medicines' },
                  { when: 'June 2026', what: 'Knee sprain', tone: 'bg-mint-400', meta: '1 report · physiotherapy advice' },
                ].map((item) => (
                  <li key={item.when} className="relative">
                    <span
                      className={`absolute -left-[1.9rem] top-4 h-3 w-3 rounded-full ring-4 ring-ink-800/80 ${item.tone}`}
                      aria-hidden="true"
                    />
                    <div className="rounded-xl border border-ink-600/60 bg-ink-900/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">
                        {item.when}
                      </p>
                      <p className="mt-1 font-display text-base font-bold text-white">{item.what}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.meta}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-ink-600/40 px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Everything openHealth does
            </h2>
            <p className="mt-3 max-w-2xl text-base text-slate-400">
              Built around one idea: your medical history should travel with you, not live in a drawer.
            </p>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <article key={feature.title} className="surface p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft ring-1 ring-inset ring-brand-400/20">
                    <feature.icon className="h-5 w-5 text-brand-300" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Consent explainer */}
        <section className="border-t border-ink-600/40 px-5 py-20 sm:px-8">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge tone="mint" className="mb-5" icon={Lock}>
                Consent first
              </Badge>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                A doctor never sees your history until you say so.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-400">
                Access is a conversation, not a setting. The doctor asks, you read out a one-time code,
                and the session opens for as long as you both need it. End it from either side at any
                moment — and see every view in your audit log.
              </p>
            </div>

            <ol className="space-y-4">
              {[
                { icon: Stethoscope, title: 'The doctor requests access', body: 'They find you by OHID and send a request.' },
                { icon: KeyRound, title: 'You share the code', body: 'Only you can read it out. It expires in ten minutes.' },
                { icon: Activity, title: 'They read your timeline', body: 'Cases, reports, prescriptions and summaries — no digital will.' },
                { icon: ShieldCheck, title: 'Either side ends it', body: 'Revoke instantly; the app records who viewed what, and when.' },
              ].map((step, index) => (
                <li key={step.title} className="surface flex items-start gap-4 p-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-400/12 text-sm font-bold text-brand-200 ring-1 ring-inset ring-brand-400/25">
                    {index + 1}
                  </span>
                  <div>
                    <p className="inline-flex items-center gap-2 font-semibold text-white">
                      <step.icon className="h-4 w-4 text-brand-300" aria-hidden="true" />
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 pb-24 sm:px-8">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-brand-400/25 bg-brand-soft p-10 text-center sm:p-14">
            <LogoMark size="lg" className="mx-auto" />
            <h2 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Start your timeline today.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-300">
              It takes a minute to sign up, and the first case you add might be the one you keep
              forgetting to explain.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <Button size="lg" iconRight={ArrowRight}>
                  Create your account
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  I already have one
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-600/40 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-xs text-slate-500">
            openHealth — a personal health record you actually own.
          </p>
        </div>
      </footer>
    </div>
  )
}
