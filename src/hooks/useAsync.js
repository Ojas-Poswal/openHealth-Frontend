import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Runs an async function and tracks the request lifecycle.
 *
 * Every page in openHealth needs the same three visual states — loading,
 * error, empty — so this hook models them explicitly instead of leaving each
 * screen to invent its own flags.
 *
 * @param {() => Promise<any>} fn
 * @param {any[]} deps
 * @param {{
 *   immediate?: boolean,
 *   initialData?: any,
 *   emptyOn?: number[],   // statuses that mean "nothing here yet", not "failed"
 * }} options
 */
export function useAsync(fn, deps = [], options = {}) {
  const { immediate = true, initialData = null, emptyOn = [] } = options

  const [data, setData] = useState(initialData)
  const [error, setError] = useState(null)
  const [empty, setEmpty] = useState(false)
  const [loading, setLoading] = useState(immediate)
  const [refreshing, setRefreshing] = useState(false)

  const mounted = useRef(true)
  const requestId = useRef(0)
  const fnRef = useRef(fn)
  fnRef.current = fn
  const emptyKey = emptyOn.join(',')

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const execute = useCallback(
    async ({ silent = false } = {}) => {
      const id = ++requestId.current
      if (silent) setRefreshing(true)
      else setLoading(true)
      setError(null)

      try {
        const result = await fnRef.current()
        if (!mounted.current || id !== requestId.current) return null
        setData(result)
        setEmpty(false)
        return result
      } catch (err) {
        if (!mounted.current || id !== requestId.current) return null
        const treatAsEmpty = emptyOn.includes(err?.status)
        if (treatAsEmpty) {
          setData(null)
          setEmpty(true)
          setError(null)
        } else {
          setError(err)
        }
        return null
      } finally {
        if (mounted.current && id === requestId.current) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [emptyKey],
  )

  useEffect(() => {
    if (!immediate) return
    execute()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return {
    data,
    error,
    loading,
    refreshing,
    empty,
    /** Re-runs with a spinner on the content area. */
    refetch: () => execute(),
    /** Re-runs keeping current content visible (pull-to-refresh feel). */
    refresh: () => execute({ silent: true }),
    setData,
    reset: () => {
      setData(initialData)
      setError(null)
      setEmpty(false)
    },
  }
}
