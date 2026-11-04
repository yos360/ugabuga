import { useEffect, useRef, useState } from 'react'

// A looping Buga animation from a sprite sheet (frames keyed from a green-screen video, packed
// cols × rows into one transparent webp under public/anim). The box keeps its size from the
// first paint (no layout shift); the sheet loads only once the page has loaded and the browser
// is idle. Reduced motion: the first frame stands still. Hidden when printing.
export const BUGA_PRINTER = { src: '/anim/buga-printer.webp', frames: 60, cols: 10, rows: 6, fps: 10, ratio: 144 / 150 }

export default function BugaSprite({ anim = BUGA_PRINTER, height = 150, className = '' }) {
  const { src, frames, cols, rows, fps, ratio } = anim
  const [mode, setMode] = useState(null) // null until the sheet is loaded, then 'play' or 'still'
  const box = useRef(null)

  useEffect(() => {
    if (window.__PRERENDER__) return undefined
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let cancelled = false
    const start = () => {
      const img = new Image()
      img.onload = () => { if (!cancelled) setMode(still ? 'still' : 'play') }
      img.src = src
    }
    const idle = () => (window.requestIdleCallback ? requestIdleCallback(start, { timeout: 2500 }) : setTimeout(start, 800))
    if (document.readyState === 'complete') idle()
    else window.addEventListener('load', idle, { once: true })
    return () => { cancelled = true; window.removeEventListener('load', idle) }
  }, [src])

  useEffect(() => {
    if (mode !== 'play') return undefined
    let raf, t0
    const tick = now => {
      t0 ??= now
      const f = Math.floor((now - t0) / 1000 * fps) % frames, el = box.current
      if (el) el.style.backgroundPosition = `${(f % cols) / (cols - 1) * 100}% ${Math.floor(f / cols) / (rows - 1) * 100}%`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [mode, fps, frames, cols, rows])

  return <div ref={box} className={`no-print mx-auto ${className}`} aria-hidden="true"
    style={{ height, width: Math.round(height * ratio), backgroundImage: mode ? `url(${src})` : undefined, backgroundSize: `${cols * 100}% ${rows * 100}%`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat' }} />
}
