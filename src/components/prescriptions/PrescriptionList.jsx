import { Pill } from 'lucide-react'
import Badge from '../ui/Badge.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import Button from '../ui/Button.jsx'
import { formatDateTime } from '../../utils/format.js'

/**
 * Prescriptions written against a case. Each prescription document can hold
 * several medicines, so they render as one block per visit with a table of
 * medicines inside.
 */
export default function PrescriptionList({ prescriptions = [], canAdd = false, onAdd }) {
  if (!prescriptions.length) {
    return (
      <EmptyState
        icon={Pill}
        title="No prescriptions yet"
        message={
          canAdd
            ? 'Write a prescription and it will be filed straight into this case.'
            : 'A doctor can add a prescription to this case during a consented session.'
        }
        compact
        action={
          canAdd && onAdd ? (
            <Button variant="primary" size="sm" onClick={onAdd}>
              Write a prescription
            </Button>
          ) : null
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {canAdd && onAdd && (
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" icon={Pill} onClick={onAdd}>
            Write another prescription
          </Button>
        </div>
      )}

      {prescriptions.map((prescription) => (
        <div key={prescription._id} className="surface-soft overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-600/50 px-4 py-3">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
              <Pill className="h-4 w-4 text-violet-300" aria-hidden="true" />
              Prescription
            </p>
            <div className="flex items-center gap-2">
              <Badge tone="neutral" size="sm">
                {prescription.medicines?.length ?? 0} medicine
                {(prescription.medicines?.length ?? 0) === 1 ? '' : 's'}
              </Badge>
              <span className="text-xs text-slate-500">{formatDateTime(prescription.createdAt)}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[38rem] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-600/50 text-[11px] uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-4 py-2.5 font-semibold">Medicine</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Dosage</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Frequency</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Duration</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-600/40">
                {(prescription.medicines ?? []).map((medicine, index) => (
                  <tr key={`${prescription._id}-${index}`} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-medium text-white">{medicine.medicine}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-300">{medicine.dosage}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-300">{medicine.frequency}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-300">{medicine.duration}</td>
                    <td className="px-4 py-3 text-slate-400">{medicine.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
