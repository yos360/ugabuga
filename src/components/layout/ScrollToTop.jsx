import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { rememberNavigation, saveScroll, savedScroll } from '../../utils/navMemory'

export default function ScrollToTop() {
  const location = useLocation()
  const { pathname } = location
  const navType = useNavigationType()
  const [show, setShow] = useState(false)
  const current = useRef(location)

  // New page → top. Back/forward → the spot the visitor left, retried while the page (lazy
  // chunks, data) is still growing tall enough; any touch or wheel by the visitor stops it.
  useEffect(() => {
    const prev = current.current
    current.current = location
    if (prev.key === location.key) return
    rememberNavigation(prev, navType)
    try { window.history.scrollRestoration = 'manual' } catch { /* old browser */ }
    const y = navType === 'POP' ? savedScroll(location.key) : undefined
    if (y == null) {
      if (prev.pathname !== location.pathname) window.scrollTo(0, 0)
      return
    }
    let tries = 0, stopped = false
    const stop = () => { stopped = true }
    const opts = { passive: true, once: true }
    window.addEventListener('wheel', stop, opts); window.addEventListener('touchstart', stop, opts); window.addEventListener('keydown', stop, opts)
    const attempt = () => {
      if (stopped) return
      window.scrollTo(0, y)
      if (Math.abs(window.scrollY - y) > 2 && ++tries < 30) timer = setTimeout(attempt, 100)
    }
    let timer = setTimeout(attempt, 0)
    return () => { clearTimeout(timer); window.removeEventListener('wheel', stop); window.removeEventListener('touchstart', stop); window.removeEventListener('keydown', stop) }
  }, [location, navType])

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      setShow(window.scrollY > 400)
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => saveScroll(current.current.key, window.scrollY))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Tools with their own fixed bottom action bar.
  if (!show || /bring-list|^\/l\//.test(pathname)) return null
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-4 start-4 z-40 wobbly-sm flex h-11 w-11 items-center justify-center border-2 border-[var(--border)] bg-[var(--card)] text-xl sketch-shadow-sm sketch-press no-print"
      aria-label="חזרה למעלה">↑</button>
  )
}
