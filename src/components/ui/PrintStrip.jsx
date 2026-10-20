import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadTotalPrintedSheets } from '../../utils/printCounts'

// The home page's one-line pointer to the printables. It is a single real aggregate: print-dialog
// sheets and successful PDF exports, never an invented marketing number.
export default function PrintStrip() {
  const [total, setTotal] = useState(0)
  useEffect(() => {
    if (typeof window === 'undefined' || window.__PRERENDER__) return
    let live = true
    const update = () => loadTotalPrintedSheets().then(value => { if (live) setTotal(value || 0) })
    update()
    const timer = window.setInterval(update, 5 * 60000)
    window.addEventListener('buga:downloads-changed', update)
    return () => {
      live = false
      window.clearInterval(timer)
      window.removeEventListener('buga:downloads-changed', update)
    }
  }, [])
  return <Link to="/printables" className="print-strip no-print">
    <span className="print-strip-dot" aria-hidden="true" />
    <span aria-live="polite">🖨️ {total > 0 ? <>כבר הודפסו <b>{total.toLocaleString('he-IL')}</b> דפים מהאתר</> : <>דפים להדפסה בחינם</>}</span>
    <span className="print-strip-cta">להדפסות ←</span>
  </Link>
}
