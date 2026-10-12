import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { countPath, loadPrintCounts, printLabel } from '../../utils/printCounts'

// Small "🖨️ הודפס 1,245 פעמים" badge for the current page (shown only once a page is popular).
export default function PrintCount({ className = '' }) {
  const { pathname } = useLocation()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (typeof window === 'undefined' || window.__PRERENDER__) return
    let live = true
    setN(0)
    loadPrintCounts().then(map => { if (live) setN(map[countPath(pathname)] || 0) })
    return () => { live = false }
  }, [pathname])
  const text = printLabel(n)
  if (!text) return null
  return <span className={`no-print inline-flex items-center gap-1 rounded-full bg-[var(--postit)] px-3 py-1 text-sm font-bold text-[var(--ink)] ${className}`}>🖨️ {text}</span>
}
