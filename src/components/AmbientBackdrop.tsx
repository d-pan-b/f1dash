/** Static ambient depth — no spinning kaleidoscope or scroll-parallax tricks. */
export function AmbientBackdrop() {
  return (
    <div className="ambient" aria-hidden>
      <div className="ambient__gradient" />
      <div className="ambient__depth ambient__depth--1" />
      <div className="ambient__depth ambient__depth--2" />
      <div className="ambient__orb ambient__orb--a" />
      <div className="ambient__orb ambient__orb--b" />
      <div className="ambient__grid" />
    </div>
  )
}
