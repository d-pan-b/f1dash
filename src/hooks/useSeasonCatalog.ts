import { useEffect, useState } from 'react'
import { fetchAvailableSeasonYears } from '../lib/f1Api'

export function useSeasonCatalog() {
  const [seasons, setSeasons] = useState<number[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    queueMicrotask(() => {
      if (cancelled) return
      setLoading(true)
    })

    fetchAvailableSeasonYears()
      .then((years) => {
        if (cancelled) return
        queueMicrotask(() => {
          if (cancelled) return
          setSeasons(years)
          setError(null)
          setLoading(false)
        })
      })
      .catch((e) => {
        if (cancelled) return
        queueMicrotask(() => {
          if (cancelled) return
          setError(e instanceof Error ? e.message : String(e))
          setSeasons(null)
          setLoading(false)
        })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { seasons, loading, error }
}
