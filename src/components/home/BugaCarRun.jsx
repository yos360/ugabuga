import { useEffect, useRef, useState } from 'react'
import './bugaCarRun.css'

// A small Uga Buga drives his red car right to left in a thin strip under the home-page heading, again and
// again. The frames come from a green-screen video, keyed to transparency and packed into one sprite sheet
// (public/anim/buga-car.webp: 108 frames of 136×87, 12 per row, 12 fps). The strip keeps its height from the
// first paint (no layout shift); the sheet loads only after the page has loaded and the browser is idle.
// Reduced motion: the car stands still in the middle.
const SRC = '/anim/buga-car.webp', FRAMES = 108, COLS = 12, ROWS = 9, FPS = 12

export default function BugaCarRun() {
  const [mode, setMode] = useState(null) // null until the sheet is loaded, then 'drive' or 'still'
  const sprite = useRef(null)

  useEffect(() => {
    if (window.__PRERENDER__) return
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let cancelled = false
    const start = () => {
      const img = new Image()
      img.onload = () => { if (!cancelled) setMode(still ? 'still' : 'drive') }
      img.src = SRC
    }
    const idle = () => (window.requestIdleCallback ? requestIdleCallback(start, { timeout: 3000 }) : setTimeout(start, 1200))
    if (document.readyState === 'complete') idle()
    else window.addEventListener('load', idle, { once: true })
    return () => { cancelled = true; window.removeEventListener('load', idle) }
  }, [])

  useEffect(() => {
    if (mode !== 'drive') return
    let raf, t0
    const tick = now => {
      t0 ??= now
      const f = Math.floor((now - t0) / 1000 * FPS) % FRAMES, el = sprite.current
      if (el) el.style.backgroundPosition = `${(f % COLS) / (COLS - 1) * 100}% ${Math.floor(f / COLS) / (ROWS - 1) * 100}%`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [mode])

  return <div className="bcr no-print" aria-hidden="true">
    {mode && <div ref={sprite} className={`bcr-car bcr-${mode}`} style={{ backgroundImage: `url(${SRC})` }} />}
  </div>
}
