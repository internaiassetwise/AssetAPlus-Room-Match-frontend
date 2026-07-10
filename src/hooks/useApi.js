import { useCallback, useEffect, useState } from 'react'

export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Bumped by refetch() to re-run the effect without remounting.
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetcher()
      .then((res) => { if (!cancelled) setData(res) })
      .catch((err) => { if (!cancelled) setError(err) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  // Re-run the fetcher on demand (e.g. after a mutation mutates the list).
  const refetch = useCallback(() => setNonce((n) => n + 1), [])

  return { data, loading, error, refetch }
}
