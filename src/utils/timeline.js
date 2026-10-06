/**
 * Derivations over the timeline payload that
 * GET /medical-case/timeline returns:
 *   [{ medicalCase, reports[], doctorNotes[], prescriptions[] }]
 */

export function countStats(timeline = []) {
  return timeline.reduce(
    (stats, entry) => {
      const status = entry.medicalCase?.status
      stats.cases += 1
      if (status === 'active') stats.active += 1
      if (status === 'resolved') stats.resolved += 1
      stats.reports += entry.reports?.length ?? 0
      stats.prescriptions += entry.prescriptions?.length ?? 0
      stats.medicines += (entry.prescriptions ?? []).reduce(
        (total, prescription) => total + (prescription.medicines?.length ?? 0),
        0,
      )
      stats.notes += entry.doctorNotes?.length ?? 0
      return stats
    },
    { cases: 0, active: 0, resolved: 0, reports: 0, prescriptions: 0, medicines: 0, notes: 0 },
  )
}

/** Flattens every report across the timeline, keeping its parent case. */
export function flattenReports(timeline = []) {
  return timeline.flatMap((entry) =>
    (entry.reports ?? []).map((report) => ({
      report,
      medicalCase: entry.medicalCase,
      doctorNotes: (entry.doctorNotes ?? []).filter(
        (note) => String(note.reportId) === String(report._id),
      ),
    })),
  )
}

export function findEntry(timeline = [], caseId) {
  return timeline.find((entry) => String(entry.medicalCase?._id) === String(caseId)) ?? null
}

/** Most recent first, by diagnosis date then creation date. */
export function sortByRecency(timeline = []) {
  return [...timeline].sort((a, b) => {
    const left = new Date(a.medicalCase?.diagnosedAt ?? a.medicalCase?.createdAt ?? 0).getTime()
    const right = new Date(b.medicalCase?.diagnosedAt ?? b.medicalCase?.createdAt ?? 0).getTime()
    return right - left
  })
}

export function collectTags(timeline = []) {
  const counts = new Map()
  timeline.forEach((entry) => {
    ;(entry.medicalCase?.tags ?? []).forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    })
  })
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}
