import { useEffect, useRef, useState } from 'react'
import './bugaCarRun.css'

// Uga Buga drives his red car across the top of the home page, right to left, once per visit.
// The frames come from a green-screen video, keyed to transparency and packed into one sprite sheet
// (public/anim/buga-car.webp: 108 frames of 224×143, 12 per row, 12 fps). The sheet loads only after the
// page has loaded and the browser is idle, and nothing runs for reduced motion or during prerender.
const SRC = '/anim/buga-car.webp', FRAMES = 108, COLS = 12, ROWS = 9, FPS = 12
const SEEN = 'buga-car-run'

export default function BugaCarRun() {
  const [ready, setReady] = useState(false)
  const sprite = useRef(null)

  useEffect(() => {
    if (window.__PRERENDER__ || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    try { if (sessionStorage.getItem(SEEN)) return } catch { /* storage blocked: just show it */ }
    let cancelled = false
    const start = () => {
      const img = new Image()
      img.onload = () => { if (!cancelled) { setReady(true); try { sessionStorage.setItem(SEEN, '1') } catch { /* ignore */ } } }
      img.src = SRC
    }
    const idle = () => (window.requestIdleCallback ? requestIdleCallback(start, { timeout: 3000 }) : setTimeout(start, 1200))
    if (document.readyState === 'complete') idle()
    else window.addEventListener('load', idle, { once: true })
    return () => { cancelled = true; window.removeEventListener('load', idle) }
  }, [])

  useEffect(() => {
    if (!ready) return
    let raf, t0
    const car = sprite.current
    if (car) car.style.setProperty('--dx', `${car.parentElement.clientWidth + car.offsetWidth}px`)
    const tick = now => {
      t0 ??= now
      const f = Math.floor((now - t0) / 1000 * FPS)
      if (f >= FRAMES) { setReady(false); return }
      const el = sprite.current
      if (el) el.style.backgroundPosition = `${(f % COLS) / (COLS - 1) * 100}% ${Math.floor(f / COLS) / (ROWS - 1) * 100}%`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ready])

  if (!ready) return null
  return <div className="bcr no-print" aria-hidden="true">
    <div ref={sprite} className="bcr-car" style={{ backgroundImage: `url(${SRC})`, animationDuration: `${FRAMES / FPS}s` }} />
  </div>
}
