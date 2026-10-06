import { useState } from 'react'
import {
  Eye,
  EyeOff,
  Gauge,
  RefreshCw,
  Sparkles,
  Stethoscope,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import Card, { CardFooter, CardHeader } from '../../components/ui/Card.jsx'
import Alert from '../../components/ui/Alert.jsx'
import Badge from '../../components/ui/Badge.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import { SkeletonText } from '../../components/ui/Skeleton.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useTimeline } from '../../hooks/useTimeline.js'
import { useAsync } from '../../hooks/useAsync.js'
import { useMutation } from '../../hooks/useMutation.js'
import { aiSummaryApi } from '../../api/aiSummary.api.js'
import { countStats } from '../../utils/timeline.js'
import { formatDateTime } from '../../utils/format.js'

/**
 * AI summary.
 *
 * The backend keeps exactly one summary per patient (an upsert on
 * generate), so the screen is built around that: an explicit fetch of the
 * stored summary, and an explicit regenerate that replaces it.
 */
export default function AISummary() {
  const { patientId } = useAuth()
  const toast = useToast()
  const timeline = useTimeline()

  const [revealed, setRevealed] = useState(false)

  const saved = useAsync(() => aiSummaryApi.get(patientId), [patientId], {
    immediate: false,
    emptyOn: [404],
  })
  const generate = useMutation(() => aiSummaryApi.generate(patientId))

  const stats = countStats(timeline.data ?? [])
  const summary = saved.data
  const hasFetched = revealed

  const handleFetch = async () => {
    setRevealed(true)
    const result = await saved.refetch()
    if (!result) return
    toast.success('Saved summary loaded.')
  }

  const handleGenerate = async () => {
    const result = await generate.run()
    if (!result) {
      toast.error(generate.error?.message ?? 'Could not generate a summary.')
      return
    }
    saved.setData(result)
    setRevealed(true)
    toast.success('Summary generated and stored.')
  }

  return (
    <>
      <PageHeader
        title="AI summary"
        description="A short, readable version of your whole timeline — the thing you hand a new doctor instead of retelling five years."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Your medical summary"
              subtitle="Generated from the diagnoses, verdicts, advice and medicines already on your timeline."
              icon={Sparkles}
              actions={
                <>
                  {revealed && summary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={EyeOff}
                      onClick={() => setRevealed(false)}
                    >
                      Hide
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Eye}
                    onClick={handleFetch}
                    loading={saved.loading}
                  >
                    Fetch saved
                  </Button>
                  <Button
                    size="sm"
                    icon={RefreshCw}
                    onClick={handleGenerate}
                    loading={generate.loading}
                    disabled={stats.cases === 0}
                    title={stats.cases === 0 ? 'Add a case to your timeline first' : undefined}
                  >
                    Get new summary
                  </Button>
                </>
              }
            />

            <div className="mt-4">
              {!hasFetched ? (
                <div className="rounded-xl border border-dashed border-ink-600/80 bg-ink-900/40 px-6 py-12 text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft ring-1 ring-inset ring-brand-400/20">
                    <Sparkles className="h-6 w-6 text-brand-300" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-white">
                    Your summary is hidden
                  </h3>
                  <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-slate-400">
                    Choose <span className="font-medium text-slate-200">Fetch saved</span> to read the
                    summary already stored for you, or{' '}
                    <span className="font-medium text-slate-200">Get new summary</span> to rebuild it
                    from the latest state of your timeline.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                    <Button variant="secondary" size="sm" icon={Eye} onClick={handleFetch} loading={saved.loading}>
                      Fetch saved summary
                    </Button>
                    <Button
                      size="sm"
                      icon={RefreshCw}
                      onClick={handleGenerate}
                      loading={generate.loading}
                      disabled={stats.cases === 0}
                    >
                      Get new summary
                    </Button>
                  </div>
                  {stats.cases === 0 && (
                    <p className="mt-4 text-xs text-amber-300/80">
                      There is nothing to summarise yet — add a case to your timeline first.
                    </p>
                  )}
                </div>
              ) : saved.loading ? (
                <SkeletonText lines={5} />
              ) : saved.error ? (
                <ErrorState error={saved.error} onRetry={saved.refetch} compact />
              ) : summary ? (
                <div className="animate-fade-in">
                  <div className="rounded-xl border border-brand-400/20 bg-brand-soft p-5">
                    <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-slate-100">
                      {summary.summary}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <Badge tone="brand" size="sm">
                      Generated {formatDateTime(summary.generatedAt)}
                    </Badge>
                    <span>
                      Built from {stats.cases} case{stats.cases === 1 ? '' : 's'} · {stats.medicines}{' '}
                      medicine{stats.medicines === 1 ? '' : 's'}
                    </span>
                  </div>

                  <Alert tone="warning" className="mt-4" title="Not a medical document">
                    This summary is generated by an AI model from the records you entered. It can be
                    incomplete or wrong — always confirm treatment decisions with a qualified doctor.
                  </Alert>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-ink-600/80 bg-ink-900/40 px-6 py-10 text-center">
                  <h3 className="font-display text-base font-bold text-white">No summary stored yet</h3>
                  <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-slate-400">
                    Nothing has been generated for your account so far. Build one from your timeline —
                    it takes a moment and is stored for next time.
                  </p>
                  <Button
                    className="mt-5"
                    icon={RefreshCw}
                    onClick={handleGenerate}
                    loading={generate.loading}
                    disabled={stats.cases === 0}
                  >
                    Get new summary
                  </Button>
                </div>
              )}
            </div>

            {generate.error && (
              <Alert tone="error" className="mt-4" title="Generation failed">
                {generate.error.message}
              </Alert>
            )}
          </Card>
        </div>

        <aside className="space-y-5">
          <Card>
            <CardHeader
              title="What feeds the summary"
              subtitle="Only what is already on your timeline."
              icon={Gauge}
            />
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ['Cases', stats.cases],
                ['Active', stats.active],
                ['Resolved', stats.resolved],
                ['Reports', stats.reports],
                ['Prescriptions', stats.prescriptions],
                ['Medicines', stats.medicines],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-ink-600/40 pb-2.5 last:border-0">
                  <dt className="text-slate-400">{label}</dt>
                  <dd className="font-semibold text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <CardHeader title="How doctors see it" icon={Stethoscope} />
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              A doctor can read this summary during a consented session — never the digital will, and
              never without your one-time code. Every view is written to your audit log.
            </p>
            <CardFooter>
              <Alert tone="info">
                Generating a new summary replaces the stored one. The previous text is not kept.
              </Alert>
            </CardFooter>
          </Card>
        </aside>
      </div>
    </>
  )
}
