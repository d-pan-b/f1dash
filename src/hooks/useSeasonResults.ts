import { useCallback, useEffect, useRef, useState } from 'react'
import { buildSeasonChart, fetchSeasonRaces, type SeasonChartPayload } from '../lib/f1Api'

/** Invalidate in-memory cache from older chart formats after upgrades. */
function isStaleCacheEntry(hit: SeasonChartPayload | null | undefined): boolean {
  if (hit == null) return false
  if (!Array.isArray(hit.rows) || !Array.isArray(hit.series)) return true
  if (!('leader' in hit) || !('gapToSecond' in hit)) return true
  return false
}

export function useSeasonResults(year: number | null) {
  const [retryTick, setRetryTick] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [payload, setPayload] = useState<SeasonChartPayload | null>(null)
  const cacheRef = useRef(new Map<number, SeasonChartPayload | null>())

  useEffect(() => {
    let cancelled = false

    if (year == null || !Number.isFinite(year)) {
      queueMicrotask(() => {
        if (cancelled) return
        setError(null)
        setPayload(null)
        setLoading(false)
      })
      return () => {
        cancelled = true
      }
    }

    if (cacheRef.current.has(year)) {
      const hit = cacheRef.current.get(year)
      if (isStaleCacheEntry(hit)) {
        cacheRef.current.delete(year)
      } else {
        queueMicrotask(() => {
          if (cancelled) return
          setError(null)
          setPayload(hit ?? null)
          setLoading(false)
        })
        return () => {
          cancelled = true
        }
      }
    }

    queueMicrotask(() => {
      if (cancelled) return
      setError(null)
      setLoading(true)
    })

    ;(async () => {
      try {
        const races = await fetchSeasonRaces(year)
        const built = buildSeasonChart(races)
        if (cancelled) return
        cacheRef.current.set(year, built)
        setPayload(built)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
        setPayload(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [year, retryTick])

  const retry = useCallback(() => {
    if (year == null) return
    cacheRef.current.delete(year)
    setRetryTick((t) => t + 1)
  }, [year])

  return {
    loading,
    error,
    rows: payload?.rows ?? null,
    series: payload?.series ?? null,
    rounds: payload?.rounds ?? 0,
    leaderLabel: payload?.leaderLabel ?? '—',
    leader: payload?.leader ?? null,
    gapToSecond: payload?.gapToSecond ?? null,
    lastRaceDate: payload?.lastRaceDate ?? null,
    retry,
  }
}
