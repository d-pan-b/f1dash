export interface F1Race {
  round: string
  raceName: string
  /** ISO date (YYYY-MM-DD) from Ergast — used to hide future rounds on the current calendar year */
  date?: string
  Results?: F1Result[]
}

export interface F1Result {
  points: string
  Driver: {
    driverId: string
    givenName: string
    familyName: string
    code?: string
    nationality?: string
  }
}

/** One row per round for Recharts (driver ids map to cumulative points). */
export interface ChartRow {
  label: string
  round: number
  [driverId: string]: string | number
}

export interface SeriesLine {
  dataKey: string
  label: string
  color: string
}

export interface LeaderSpotlight {
  driverId: string
  givenName: string
  familyName: string
  code: string
  nationality: string
  points: number
}

export interface SeasonChartPayload {
  rows: ChartRow[]
  series: SeriesLine[]
  rounds: number
  leaderLabel: string
  /** Full championship leader (P1 by points) for UI / imagery */
  leader: LeaderSpotlight | null
  /** Points advantage over P2 in standings (null if unknown) */
  gapToSecond: number | null
  /** Latest race date included in the chart (ISO), if known */
  lastRaceDate: string | null
}

interface MrData {
  total?: string | number
  limit?: string | number
  offset?: string | number
  RaceTable?: { Races?: F1Race[] }
  SeasonTable?: { Seasons?: { season: string }[] }
}

function apiBase(): string {
  return import.meta.env.DEV ? '/api/jolpica' : 'https://api.jolpi.ca'
}

export function resultsUrl(year: number, offset = 0, limit = 100): string {
  const base = apiBase()
  return `${base}/ergast/f1/${year}/results.json?limit=${limit}&offset=${offset}`
}

export function seasonsUrl(offset = 0, limit = 200): string {
  const base = apiBase()
  return `${base}/ergast/f1/seasons.json?limit=${limit}&offset=${offset}`
}

function endOfToday(): Date {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Keep races that already have published results and are not after "today"
 * (handles calendar years where the API may list future rounds without full Results).
 */
export function filterRacesThroughToday(races: F1Race[]): F1Race[] {
  const today = endOfToday()
  return races.filter((r) => {
    if (!r.Results?.length) return false
    if (!r.date) return true
    const dt = new Date(r.date)
    return !Number.isNaN(dt.getTime()) && dt <= today
  })
}

async function readJson(res: Response): Promise<unknown> {
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`)
  }
  return res.json()
}

/**
 * All championship seasons available from the API (sorted ascending).
 * Paginates until a short page is returned.
 */
export async function fetchAvailableSeasonYears(): Promise<number[]> {
  const years = new Set<number>()
  let offset = 0
  const limit = 200

  for (let guard = 0; guard < 50; guard++) {
    const res = await fetch(seasonsUrl(offset, limit))
    const json = (await readJson(res)) as { MRData?: MrData }
    const seasons = json.MRData?.SeasonTable?.Seasons
    if (!Array.isArray(seasons) || seasons.length === 0) break
    for (const s of seasons) {
      const y = parseInt(s.season, 10)
      if (Number.isFinite(y)) years.add(y)
    }
    if (seasons.length < limit) break
    offset += limit
  }

  const list = [...years].sort((a, b) => a - b)
  if (!list.length) {
    throw new Error('Unexpected API response: no seasons in SeasonTable')
  }
  return list
}

/**
 * Fetch **every** results page for a season, then return merged races in one array.
 * Each request is awaited in sequence so callers only receive data after pagination completes.
 */
export async function fetchSeasonRaces(year: number): Promise<F1Race[]> {
  const byRound = new Map<number, F1Race>()
  const pageSize = 100
  let offset = 0
  /** Total races the API reports for this query (when present). */
  let totalCap: number | null = null

  for (let page = 0; page < 80; page++) {
    const res = await fetch(resultsUrl(year, offset, pageSize))
    const json = (await readJson(res)) as { MRData?: MrData }
    const mr = json.MRData

    if (page === 0 && mr?.total != null) {
      const t = parseInt(String(mr.total), 10)
      if (Number.isFinite(t) && t > 0) totalCap = t
    }

    const races: F1Race[] = Array.isArray(mr?.RaceTable?.Races) ? mr!.RaceTable!.Races! : []

    if (races.length === 0) {
      break
    }

    for (const r of races) {
      const rd = parseInt(r.round, 10)
      if (Number.isFinite(rd)) byRound.set(rd, r)
    }

    offset += pageSize

    if (totalCap != null && byRound.size >= totalCap) {
      break
    }

    if (races.length < pageSize) {
      if (totalCap == null) {
        break
      }
      if (byRound.size >= totalCap) {
        break
      }
    }
  }

  const sorted = sortRacesByRound([...byRound.values()])
  return filterRacesThroughToday(sorted)
}

function sortRacesByRound(races: F1Race[]): F1Race[] {
  return [...races].sort((a, b) => parseInt(a.round, 10) - parseInt(b.round, 10))
}

const LINE_COLORS = [
  '#e10600',
  '#00d2be',
  '#fcd700',
  '#3671c6',
  '#ff8700',
  '#6cd3bf',
  '#d0d4dc',
  '#f596c8',
  '#b82929',
  '#5caa97',
]

export function buildSeasonChart(racesRaw: F1Race[]): SeasonChartPayload | null {
  const races = sortRacesByRound(racesRaw)
  if (!races.length) return null

  const pointsByDriverRound = new Map<string, Map<number, number>>()
  const driverMeta = new Map<string, { label: string }>()

  for (const race of races) {
    const rd = parseInt(race.round, 10)
    for (const res of race.Results ?? []) {
      const id = res.Driver?.driverId
      if (!id) continue
      const pts = parseFloat(res.points)
      if (!Number.isFinite(pts)) continue
      if (!pointsByDriverRound.has(id)) pointsByDriverRound.set(id, new Map())
      pointsByDriverRound.get(id)!.set(rd, pts)

      if (!driverMeta.has(id)) {
        const code = (res.Driver.code ?? '').trim()
        const gn = res.Driver.givenName ?? ''
        const fn = res.Driver.familyName ?? ''
        const label = code ? `${code} · ${gn} ${fn}` : `${gn} ${fn}`.trim() || id
        driverMeta.set(id, { label })
      }
    }
  }

  const totals = new Map<string, number>()
  pointsByDriverRound.forEach((roundMap, driverId) => {
    let t = 0
    roundMap.forEach((p) => {
      t += p
    })
    totals.set(driverId, t)
  })

  const top10 = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id)

  if (!top10.length) return null

  const labels = races.map((r) => {
    const n = parseInt(r.round, 10)
    const short = (r.raceName ?? '').split(' ').slice(0, 2).join(' ')
    return `R${n}${short ? ` · ${short}` : ''}`
  })

  const cum: Record<string, number> = Object.fromEntries(top10.map((id) => [id, 0]))

  const rows: ChartRow[] = races.map((race, idx) => {
    const rnum = parseInt(race.round, 10)
    const row: ChartRow = {
      label: labels[idx] ?? `R${rnum}`,
      round: rnum,
    }
    for (const driverId of top10) {
      cum[driverId] += pointsByDriverRound.get(driverId)?.get(rnum) ?? 0
      row[driverId] = cum[driverId]
    }
    return row
  })

  const series: SeriesLine[] = top10.map((driverId, i) => ({
    dataKey: driverId,
    label: driverMeta.get(driverId)?.label ?? driverId,
    color: LINE_COLORS[i % LINE_COLORS.length],
  }))

  const leaderId = top10[0]
  let leaderSpotlight: LeaderSpotlight | null = null
  if (leaderId) {
    let d: F1Result['Driver'] | undefined
    outer: for (const race of races) {
      for (const res of race.Results ?? []) {
        if (res.Driver?.driverId === leaderId) {
          d = res.Driver
          break outer
        }
      }
    }
    if (d) {
      const pts = totals.get(leaderId) ?? 0
      leaderSpotlight = {
        driverId: leaderId,
        givenName: d.givenName ?? '',
        familyName: d.familyName ?? '',
        code: (d.code ?? '').trim(),
        nationality: (d.nationality ?? '').trim(),
        points: pts,
      }
    }
  }

  const leaderLabel = series[0]?.label ?? '—'
  const last = races[races.length - 1]
  const lastRaceDate = last?.date ?? null

  const p1Pts = leaderId ? (totals.get(leaderId) ?? 0) : 0
  const p2Id = top10[1]
  const gapToSecond =
    p2Id != null && leaderId != null ? p1Pts - (totals.get(p2Id) ?? 0) : null

  return {
    rows,
    series,
    rounds: races.length,
    leaderLabel,
    leader: leaderSpotlight,
    gapToSecond,
    lastRaceDate,
  }
}
