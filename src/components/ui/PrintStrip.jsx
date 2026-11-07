import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadTodayPrints } from '../../utils/printCounts'
import FlipCounter from './FlipCounter'

// Home page pointer to the printables: today's real printed sheets (print dialogs + PDF exports).
// When the real number grows, the flip counter climbs to it one page at a time.
export default function PrintStrip() {
  const [real, setReal] = useState(null)
  const [shown, setShown] = useState(null)
  const shownRef = useRef(null)
  useEffect(() => {
    if (typeof window === 'undefined' || window.__PRERENDER__) return
    let live = true
    const update = () => loadTodayPrints().then(d => { if (live) setReal(d.today) })
    update()
    const timer = window.setInterval(update, 60000)
    window.addEventListener('buga:downloads-changed', update)
    return () => { live = false; window.clearInterval(timer); window.removeEventListener('buga:downloads-changed', update) }
  }, [])
  useEffect(() => {
    if (real == null) return
    if (shownRef.current == null || real < shownRef.current) { shownRef.current = real; setShown(real); return }
    if (real === shownRef.current) return
    const timer = window.setInterval(() => {
      if (shownRef.current >= real) { window.clearInterval(timer); return }
      shownRef.current += 1
      setShown(shownRef.current)
    }, Math.max(700, Math.min(2500, 50000 / (real - shownRef.current))))
    return () => window.clearInterval(timer)
  }, [real])
  return <Link to="/printables" className="print-strip no-print">
    <span className="print-strip-dot" aria-hidden="true" />
    {shown > 0
      ? <span>🖨️ היום הודפסו <FlipCounter value={shown} size="flip-sm" /> דפים מהאתר</span>
      : <span>🖨️ דפים להדפסה בחינם</span>}
    <span className="print-strip-cta">להדפסות ←</span>
  </Link>
}
