import { useCallback, useState } from 'react'

/**
 * Wraps a write action (create / update / delete) with pending + error state.
 *
 * `run` never throws — it resolves to the result on success or `null` on
 * failure, so callers can keep their submit handlers flat:
 *
 *   const save = useMutation((payload) => api.create(payload))
 *   const onSave = async (values) => {
 *     if (!(await save.run(values))) return
 *     toast.success('Saved')
 *   }
 */
export function useMutation(mutateFn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const run = useCallback(
    async (...args) => {
      setLoading(true)
      setError(null)
      try {
        return await mutateFn(...args)
      } catch (err) {
        setError(err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [mutateFn],
  )

  return { run, loading, error, reset: () => setError(null) }
}
