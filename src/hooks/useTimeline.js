import { useCallback } from 'react'
import { medicalCasesApi } from '../api/medicalCases.api.js'
import { useAsync } from './useAsync.js'

/**
 * Loads the signed-in patient's full timeline.
 *
 * The backend resolves the patient from the bearer token, so no id is passed.
 * This is the single source for the dashboard, timeline, cases and reports
 * screens — they all derive their view from the same payload.
 */
export function useTimeline() {
  const fetcher = useCallback(() => medicalCasesApi.getTimeline(), [])
  return useAsync(fetcher, [])
}
