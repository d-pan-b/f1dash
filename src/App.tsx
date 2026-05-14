import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AmbientBackdrop } from './components/AmbientBackdrop'
import { FluidAura } from './components/FluidAura'
import { CumulativeLineChart } from './components/CumulativeLineChart'
import { HeroRaceLoop } from './components/HeroRaceLoop'
import { LeaderCard } from './components/LeaderCard'
import { useSeasonCatalog } from './hooks/useSeasonCatalog'
import { useSeasonResults } from './hooks/useSeasonResults'
import { resultsUrl } from './lib/f1Api'

function formatRaceDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function App() {
  const reduce = useReducedMotion()
  const spring = reduce
    ? { duration: 0.01 }
    : { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.9 }

  const { seasons, loading: catalogLoading, error: catalogError } = useSeasonCatalog()
  const [pickedYear, setPickedYear] = useState<number | null>(null)

  const defaultYear = useMemo(() => {
    if (!seasons?.length) return null
    return Math.max(...seasons)
  }, [seasons])

  const year = pickedYear ?? defaultYear

  const setYear = useCallback(
    (y: number) => {
      if (!seasons?.length) return
      const lo = seasons[0]
      const hi = seasons[seasons.length - 1]
      setPickedYear(Math.min(hi, Math.max(lo, y)))
    },
    [seasons],
  )

  const { loading, error, rows, series, rounds, leader, gapToSecond, lastRaceDate, retry } =
    useSeasonResults(year)

  const hasChart = Boolean(rows?.length && series?.length)
  const seasonSpan =
    seasons && seasons.length > 0
      ? `${seasons[0]}–${seasons[seasons.length - 1]}`
      : 'every recorded season'

  const chartSubtitle =
    lastRaceDate && year != null
      ? year === new Date().getFullYear()
        ? `Season to date · last round ${formatRaceDate(lastRaceDate)}`
        : `Last round ${formatRaceDate(lastRaceDate)}`
      : null

  const glassBusy = catalogLoading || (Boolean(year) && loading)
  const showStats =
    !catalogLoading && !catalogError && !loading && !error && hasChart
  const gapDisplay =
    showStats && gapToSecond != null ? (gapToSecond === 0 ? '0' : `+${gapToSecond}`) : '—'

  return (
    <div className="shell">
      <AmbientBackdrop />
      <FluidAura disabled={Boolean(reduce)} />

      <motion.header
        className="topbar"
        initial={reduce ? false : { opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <div className="brand">
          <motion.div
            className="brand__mark"
            aria-hidden
            initial={reduce ? false : { scale: 0.85, rotate: -6 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={reduce ? undefined : { scale: 1.06, rotate: 1 }}
            whileTap={reduce ? undefined : { scale: 0.95 }}
            transition={spring}
          />
          <div>
            <p className="brand__kicker">Lights out · data in</p>
            <h1 className="brand__title">
              F1 <span className="brand__accent">Dash</span>
            </h1>
          </div>
        </div>

        <div className="topbar__actions">
          <label className="field">
            <span className="field__label">Year</span>
            <div className="select-wrap">
              <select
                className="select"
                value={year ?? ''}
                onChange={(e) => setYear(Number(e.target.value))}
                disabled={catalogLoading || !seasons?.length}
                aria-label="Select Formula 1 season"
              >
                {catalogLoading && (
                  <option value="" disabled>
                    Loading seasons…
                  </option>
                )}
                {!catalogLoading &&
                  seasons
                    ?.slice()
                    .reverse()
                    .map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <span className="select-chevron" aria-hidden />
            </div>
          </label>
        </div>
      </motion.header>

      <motion.section
        className="hero"
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: reduce ? 0 : 0.05 }}
      >
        <p className="hero__eyebrow">Full-send analytics</p>
        <h2 className="hero__headline">The title fight, unmuted — point by point, round by round</h2>
        <HeroRaceLoop reduceMotion={reduce ?? false} />
        <p className="hero__lede">
          Rip through {seasonSpan} of pure Constructors chaos: who stacked points when it hurt,
          who went missing under pressure, and who is still climbing after the last chequered flag.
        </p>
      </motion.section>

      <AnimatePresence mode="wait">
        {showStats && leader && year != null ? (
          <motion.div
            key={`leader-${year}-${leader.driverId}`}
            className="leader-slot"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -12 }}
            transition={{ ...spring, delay: reduce ? 0 : 0.04 }}
          >
            <LeaderCard leader={leader} seasonYear={year} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        className="stats"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: reduce ? 0 : 0.1 }}
      >
        <motion.article
          className="stat-card"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: reduce ? 0 : 0.12 }}
        >
          <p className="stat-card__label">Rounds locked</p>
          <p className="stat-card__value">{showStats ? rounds : '—'}</p>
        </motion.article>
        <motion.article
          className="stat-card stat-card--accent"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: reduce ? 0 : 0.18 }}
        >
          <p className="stat-card__label">Air gap to P2</p>
          <p className="stat-card__value">{gapDisplay}</p>
          <p className="stat-card__hint">points cushion · same standings as chart</p>
        </motion.article>
        <motion.article
          className="stat-card"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: reduce ? 0 : 0.24 }}
        >
          <p className="stat-card__label">Last signal</p>
          <p className="stat-card__value stat-card__value--xs">
            {showStats && lastRaceDate ? formatRaceDate(lastRaceDate) : '—'}
          </p>
        </motion.article>
      </motion.div>

      <motion.main
        className="stage"
        layout
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: reduce ? 0 : 0.14 }}
      >
        <div className="glass" aria-busy={glassBusy}>
          <div className="glass__shine" aria-hidden />
          <AnimatePresence mode="wait">
            {catalogLoading && (
              <motion.div
                key="cat"
                className="state state--load"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0.01 : 0.25 }}
              >
                <div className="spinner" role="status" aria-label="Loading seasons" />
                <p className="state__title">Indexing every season on file…</p>
                <p className="state__sub">Jolpica F1 API — cataloguing the years you can detonate.</p>
              </motion.div>
            )}

            {!catalogLoading && catalogError && (
              <motion.div
                key="cat-err"
                className="state state--error"
                initial={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0.01 : 0.28 }}
              >
                <p className="state__title">Standings feed went sideways</p>
                <p className="state__sub">{catalogError}</p>
              </motion.div>
            )}

            {!catalogLoading && !catalogError && loading && year != null && (
              <motion.div
                key="load"
                className="state state--load"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0.01 : 0.25 }}
              >
                <div className="spinner" role="status" aria-label="Loading chart data" />
                <p className="state__title">Syncing {year} race tape…</p>
                <p className="state__sub">Every page of results loads before the chart drops — hold tight.</p>
              </motion.div>
            )}

            {!catalogLoading && !catalogError && !loading && error && year != null && (
              <motion.div
                key="err"
                className="state state--error"
                initial={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0.01 : 0.28 }}
              >
                <p className="state__title">Telemetry line is dead</p>
                <p className="state__sub">{error}</p>
                <code className="state__code">{resultsUrl(year)}</code>
                <button type="button" className="btn" onClick={retry}>
                  Retry fetch
                </button>
              </motion.div>
            )}

            {!catalogLoading && !catalogError && !loading && !error && hasChart && year != null && (
              <motion.div
                key="chart"
                className="chart-host"
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0.01 : 0.35 }}
              >
                <CumulativeLineChart
                  rows={rows!}
                  series={series!}
                  seasonYear={year}
                  subtitle={chartSubtitle}
                />
              </motion.div>
            )}

            {!catalogLoading && !catalogError && !loading && !error && !hasChart && year != null && (
              <motion.div
                key="empty"
                className="state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="state__title">No rubber on the road yet</p>
                <p className="state__sub">
                  Zero completed grands prix in the feed for this year — either the calendar hasn&apos;t
                  fired or everything still lives in the future.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.main>

      <footer className="footer">
        <p>
          Data:{' '}
          <a href="https://github.com/jolpica/jolpica-f1" target="_blank" rel="noreferrer">
            Jolpica F1 API
          </a>
          . Portraits via Wikipedia thumbnails when available. Sprint weekends excluded — grand prix
          points only. Current year clips at today. Now go tell your group chat the chart proves you
          right.
        </p>
      </footer>
    </div>
  )
}
