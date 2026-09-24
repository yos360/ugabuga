import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()
  const [show, setShow] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400)
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
