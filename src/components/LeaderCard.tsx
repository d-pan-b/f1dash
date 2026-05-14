import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { LeaderSpotlight } from '../lib/f1Api'
import { fetchWikipediaPortraitUrl } from '../lib/wikipediaPortrait'

function initials(leader: LeaderSpotlight): string {
  const a = leader.givenName?.charAt(0) ?? ''
  const b = leader.familyName?.charAt(0) ?? ''
  const out = `${a}${b}`.toUpperCase()
  if (out) return out
  return (leader.code || leader.driverId).slice(0, 3).toUpperCase()
}

interface Props {
  leader: LeaderSpotlight
  seasonYear: number
}

export function LeaderCard({ leader, seasonYear }: Props) {
  const reduce = useReducedMotion()
  const [fetchDone, setFetchDone] = useState(false)
  const [portrait, setPortrait] = useState<string | null>(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    let alive = true

    queueMicrotask(() => {
      if (!alive) return
      setFetchDone(false)
      setPortrait(null)
      setImgLoaded(false)
      setImgFailed(false)
    })

    fetchWikipediaPortraitUrl(leader.givenName, leader.familyName)
      .then((url) => {
        if (!alive) return
        setPortrait(url)
        setFetchDone(true)
      })
      .catch(() => {
        if (!alive) return
        setPortrait(null)
        setFetchDone(true)
      })

    return () => {
      alive = false
    }
  }, [leader.driverId, leader.givenName, leader.familyName])

  const showPhoto = Boolean(portrait && !imgFailed && imgLoaded)
  const showInitials = fetchDone && (!portrait || imgFailed)
  const showSpinnerOverlay = !fetchDone || Boolean(portrait && !imgFailed && !imgLoaded)

  const name = `${leader.givenName} ${leader.familyName}`.trim()
  const mono = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 380, damping: 28 }

  return (
    <motion.article
      className="leader-card"
      layout
      initial={reduce ? false : { opacity: 0, y: 22, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={mono}
    >
      <div className="leader-card__glow" aria-hidden />
      <div className="leader-card__inner">
        <motion.div
          className="leader-card__photo-wrap"
          initial={reduce ? false : { rotate: -2 }}
          animate={{ rotate: 0 }}
          transition={{ ...mono, delay: reduce ? 0 : 0.06 }}
        >
          <div className="leader-card__photo-ring">
            {showInitials ? (
              <div className="leader-card__fallback leader-card__fallback--initials" aria-hidden>
                <span className="leader-card__initials">{initials(leader)}</span>
              </div>
            ) : null}
            {portrait && !imgFailed ? (
              <img
                src={portrait}
                alt=""
                className="leader-card__photo"
                decoding="async"
                loading="lazy"
                style={{ opacity: showPhoto ? 1 : 0 }}
                onLoad={() => setImgLoaded(true)}
                onError={() => {
                  setImgFailed(true)
                  setImgLoaded(false)
                }}
              />
            ) : null}
            {showSpinnerOverlay ? (
              <div className="leader-card__fallback leader-card__fallback--overlay" aria-hidden>
                <span className="leader-card__spinner-mini" />
              </div>
            ) : null}
          </div>
          <motion.span
            className="leader-card__badge"
            initial={reduce ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ ...mono, delay: reduce ? 0 : 0.12 }}
          >
            P1
          </motion.span>
        </motion.div>

        <div className="leader-card__copy">
          <motion.p
            className="leader-card__kicker"
            initial={reduce ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...mono, delay: reduce ? 0 : 0.05 }}
          >
            Paddock kingpin · {seasonYear}
          </motion.p>
          <motion.h2
            className="leader-card__name"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...mono, delay: reduce ? 0 : 0.08 }}
          >
            {name}
          </motion.h2>
          <motion.div
            className="leader-card__meta"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...mono, delay: reduce ? 0 : 0.1 }}
          >
            {leader.code ? <span className="leader-card__chip">{leader.code}</span> : null}
            {leader.nationality ? (
              <span className="leader-card__chip leader-card__chip--muted">{leader.nationality}</span>
            ) : null}
          </motion.div>
          <motion.div
            className="leader-card__points"
            initial={reduce ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...mono, delay: reduce ? 0 : 0.14 }}
          >
            <span className="leader-card__points-value">{leader.points}</span>
            <span className="leader-card__points-label">PTS ON BOARD</span>
          </motion.div>
        </div>
      </div>
    </motion.article>
  )
}
