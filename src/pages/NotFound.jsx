import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Logo from '../components/layout/Logo.jsx'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Link to="/" className="mb-10">
        <Logo size="md" />
      </Link>

      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-soft ring-1 ring-inset ring-brand-400/20">
        <Compass className="h-7 w-7 text-brand-300" aria-hidden="true" />
      </span>

      <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-white">
        This page isn&rsquo;t on the timeline
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
        The page you were looking for doesn&rsquo;t exist, or it may have been moved.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button variant="secondary" icon={ArrowLeft}>
            Back to openHealth
          </Button>
        </Link>
        <Link to="/app/dashboard">
          <Button variant="primary">Go to my dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
