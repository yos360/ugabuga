import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPrintEvent } from '../../utils/printEvents'

// Phones: while the page's own print button ([data-print-main]) is out of view, a print / PDF
// pill stays at the bottom between the share and back-to-top buttons and presses that same button.
// Mobile is ~72% of visits but acts far less than desktop; the print button is usually far up the page.
export default function MobilePrintBar() {
  const { pathname } = useLocation()
  const [target, setTarget] = useState(null), [hidden, setHidden] = useState(true)
  useEffect(() => {
    setTarget(null); setHidden(true)
    if (!window.matchMedia?.('(max-width: 640px)').matches || typeof IntersectionObserver === 'undefined') return
    let el = null, io = null
    // Print buttons often appear only after data or a choice loads, so look again every second.
    const find = () => {
      const next = document.querySelector('main [data-print-main]:not(:disabled)')
      if (next === el) return
      io?.disconnect(); el = next; setTarget(next)
      if (!next) return
      io = new IntersectionObserver(([e]) => setHidden(e.isIntersecting))
      io.observe(next)
    }
    find()
    const timer = setInterval(find, 1000)
    return () => { clearInterval(timer); io?.disconnect() }
  }, [pathname])
  if (!target || hidden) return null
  return <button type="button" className="mobile-print-bar no-print" onClick={() => { trackPrintEvent('mobile_print_bar'); target.click() }}>🖨️ הדפסה או PDF</button>
}
