import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadPrintCounts, SHOW_FROM } from '../../utils/printCounts'

// The home page's one-line pointer to the printables, with the real number of PDF downloads
// (the same source as the printables page's "print pulse"). The whole strip is the link.
export default function PrintStrip() {
  const [total, setTotal] = useState(0)
  useEffect(() => {
    if (typeof window === 'undefined' || window.__PRERENDER__) return
    let live = true
    const update = () => loadPrintCounts().then(data => { if (live) setTotal(data.total || 0) })
    update()
    window.addEventListener('buga:downloads-changed', update)
    return () => { live = false; window.removeEventListener('buga:downloads-changed', update) }
  }, [])
  return <Link to="/printables" className="print-strip no-print">
    <span className="print-strip-dot" aria-hidden="true" />
    <span>🖨️ {total >= SHOW_FROM ? <>כבר הודפסו <b>{total.toLocaleString('he-IL')}</b> דפים מהאתר</> : <>דפים להדפסה בחינם</>}</span>
    <span className="print-strip-cta">להדפסות ←</span>
  </Link>
}
