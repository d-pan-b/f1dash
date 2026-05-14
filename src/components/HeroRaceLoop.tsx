import { useCallback, useState } from 'react'
import { type CarLivery, randomLivery } from '../lib/carPalettes'

function F1CarProfile({ livery }: { livery: CarLivery }) {
  const { main, accent, rim, sidepod } = livery

  return (
    <svg
      className="hero-race__svg"
      viewBox="0 0 520 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <ellipse cx="260" cy="108" rx="210" ry="8" fill="rgba(0,0,0,0.45)" />
      <path
        d="M8 48 L34 44 L38 52 L38 68 L32 72 L8 76 Z"
        fill={main}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
      <path d="M12 52 L34 50" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 58 L34 56" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M38 64 L72 58 L92 76 L88 86 L46 92 L34 88 Z"
        fill={main}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />
      <g>
        <circle cx="102" cy="88" r="22" fill="#0a0c10" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        <circle cx="102" cy="88" r="14" fill="#12151a" stroke={rim} strokeWidth="2" />
        <circle cx="102" cy="88" r="5" fill="#2a3038" />
      </g>
      <path
        d="M118 44 L210 28 L268 24 L308 30 L338 42 L352 58 L348 78 L320 86 L260 88 L200 84 L130 76 Z"
        fill={main}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
      <path
        d="M188 38 L258 30 L300 34"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M232 30 Q258 2 284 30"
        stroke="rgba(200,205,215,0.55)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M218 72 L280 68 L318 74 L332 88 L312 96 L230 94 L208 88 Z"
        fill={sidepod}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />
      <path
        d="M248 42 L292 38 L302 54 L290 62 L250 58 Z"
        fill="#08090c"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
      />
      <path d="M332 62 L392 54" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" />
      <path d="M328 72 L384 68" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M388 58 L412 54 L508 72 L512 82 L508 90 L420 100 L390 96 L368 82 Z"
        fill={main}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
      <path d="M404 60 L492 74" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M400 68 L480 80" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M396 76 L465 86" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M498 74 L518 80 L516 86 L492 80 Z" fill={accent} opacity="0.95" />
      <path
        d="M372 88 L420 86 L502 96 L498 102 L418 96 L374 94 Z"
        fill="#10141a"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />
      <g>
        <circle cx="358" cy="88" r="21" fill="#0a0c10" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        <circle cx="358" cy="88" r="13" fill="#12151a" stroke={rim} strokeWidth="2" />
        <circle cx="358" cy="88" r="4.5" fill="#2a3038" />
      </g>
      <path d="M140 52 L320 38 L340 44 L338 50 L160 62 Z" fill={accent} opacity="0.38" />
    </svg>
  )
}

interface Props {
  reduceMotion: boolean
}

export function HeroRaceLoop({ reduceMotion }: Props) {
  const [a, setA] = useState<CarLivery>(() => randomLivery())
  const [b, setB] = useState<CarLivery>(() => randomLivery())

  const onLapA = useCallback(() => {
    setA(randomLivery())
  }, [])

  const onLapB = useCallback(() => {
    setB(randomLivery())
  }, [])

  return (
    <div
      className={`hero-race ${reduceMotion ? 'hero-race--reduced' : ''}`}
      role="presentation"
      aria-hidden
    >
      <div className="hero-race__inner">
        <div className="hero-race__lane" />
        <div className="hero-race__cars">
          <div
            className="hero-race__mover hero-race__mover--a"
            onAnimationIteration={reduceMotion ? undefined : onLapA}
          >
            <F1CarProfile livery={a} />
          </div>
          <div
            className="hero-race__mover hero-race__mover--b"
            onAnimationIteration={reduceMotion ? undefined : onLapB}
          >
            <F1CarProfile livery={b} />
          </div>
        </div>
      </div>
    </div>
  )
}
