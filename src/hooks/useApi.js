import { useCallback, useEffect, useRef, useState } from 'react'

export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Bumped by refetch() to re-run the effect without remounting.
  const [nonce, setNonce] = useState(0)

  // The caller passes a fresh arrow every render, while refresh() below is
  // stable and may fire much later — so it must read the CURRENT fetcher rather
  // than the one captured when it was created.
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

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

  /**
   * Background refresh — same request, no loading state.
   *
   * refetch() flips `loading`, so polling with it would flash the screen's
   * "กำลังโหลด…" placeholder on every tick. This swaps the data in quietly and
   * keeps the last good data on failure: a momentary network blip must not
   * blank a screen someone is reading.
   */
  const refresh = useCallback(async () => {
    try {
      const res = await fetcherRef.current()
      setData(res)
      setError(null)
    } catch {
      /* keep whatever is on screen */
    }
  }, [])

  return { data, loading, error, refetch, refresh }
}
