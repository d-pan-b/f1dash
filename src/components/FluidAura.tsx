import { useEffect, useRef } from 'react'

/**
 * Pointer-reactive glow + smooth follow + light displacement (no scroll hijinks).
 * CSS vars on :root: --mx/--my raw %, --fx/--fy smoothed for gradients.
 */
export function FluidAura({ disabled }: { disabled: boolean }) {
  const target = useRef({ x: 0.5, y: 0.45 })
  const current = useRef({ x: 0.5, y: 0.45 })
  const raf = useRef<number>(0)

  useEffect(() => {
    if (disabled) {
      document.documentElement.style.setProperty('--mx', '50%')
      document.documentElement.style.setProperty('--my', '45%')
      document.documentElement.style.setProperty('--fx', '50%')
      document.documentElement.style.setProperty('--fy', '45%')
      return
    }

    const root = document.documentElement
    const gw = () => Math.max(window.innerWidth, 1)
    const gh = () => Math.max(window.innerHeight, 1)

    const setFromClient = (cx: number, cy: number) => {
      target.current = { x: cx / gw(), y: cy / gh() }
      root.style.setProperty('--mx', `${target.current.x * 100}%`)
      root.style.setProperty('--my', `${target.current.y * 100}%`)
    }

    const onMove = (e: MouseEvent) => setFromClient(e.clientX, e.clientY)

    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) setFromClient(t.clientX, t.clientY)
    }

    const onLeave = () => {
      target.current = { x: 0.5, y: 0.42 }
    }

    const tick = () => {
      const t = target.current
      const c = current.current
      const k = 0.09
      c.x += (t.x - c.x) * k
      c.y += (t.y - c.y) * k
      root.style.setProperty('--fx', `${c.x * 100}%`)
      root.style.setProperty('--fy', `${c.y * 100}%`)
      raf.current = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('mouseleave', onLeave)
    raf.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf.current)
    }
  }, [disabled])

  if (disabled) return null

  return (
    <>
      <svg className="fluid-aura__svg-defs" aria-hidden focusable="false">
        <defs>
          <filter id="fluid-aura-displace" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008 0.012"
              numOctaves="2"
              seed="7"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="28s"
                values="0.008 0.012;0.0095 0.0105;0.0075 0.013;0.008 0.012"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <div className="fluid-aura" aria-hidden>
        <div className="fluid-aura__wash" />
        <div className="fluid-aura__ribbons" />
        <div className="fluid-aura__pointer" />
        <div className="fluid-aura__chroma" />
        <div className="fluid-aura__displace" />
      </div>
    </>
  )
}
