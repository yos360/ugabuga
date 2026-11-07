import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadTotalPrintedSheets } from '../../utils/printCounts'
import FlipCounter from './FlipCounter'

// Home page pointer to the printables: every real sheet printed from the site so far (print
// dialogs + PDF exports). The number is checked every minute; new prints are added to it one at
// a time, a couple of minutes apart (faster only when many piled up), never in one jump.
const STEP_MS = 120000, CATCH_UP_MS = 20000, POLL_MS = 60000

export default function PrintStrip() {
  const [real, setReal] = useState(null)
  const [shown, setShown] = useState(null)
  const shownRef = useRef(null)
  useEffect(() => {
    if (typeof window === 'undefined' || window.__PRERENDER__) return
    let live = true
    const update = fresh => loadTotalPrintedSheets({ fresh }).then(n => { if (live && n > 0) setReal(n) })
    update(false)
    const timer = window.setInterval(() => update(true), POLL_MS)
    window.addEventListener('buga:downloads-changed', update)
    return () => { live = false; window.clearInterval(timer); window.removeEventListener('buga:downloads-changed', update) }
  }, [])
  useEffect(() => {
    if (real == null) return
    if (shownRef.current == null || real < shownRef.current) { shownRef.current = real; setShown(real); return }
    if (real === shownRef.current) return
    let timer
    const step = () => {
      if (shownRef.current >= real) return
      shownRef.current += 1
      setShown(shownRef.current)
      timer = window.setTimeout(step, real - shownRef.current > 15 ? CATCH_UP_MS : STEP_MS)
    }
    timer = window.setTimeout(step, real - shownRef.current > 15 ? CATCH_UP_MS : STEP_MS)
    return () => window.clearTimeout(timer)
  }, [real])
  return <Link to="/printables" className="print-strip no-print">
    <span className="print-strip-dot" aria-hidden="true" />
    {shown > 0
      ? <span>🖨️ עד היום הודפסו <FlipCounter value={shown} size="flip-sm" /> דפים מהאתר</span>
      : <span>🖨️ דפים להדפסה בחינם</span>}
    <span className="print-strip-cta">להדפסות ←</span>
  </Link>
}
