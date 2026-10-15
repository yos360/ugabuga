import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { countPath, loadPrintCounts, printablePath, printLabel, SHOW_FROM } from '../../utils/printCounts'

export default function PrintCount({ className = '', path, fallback, total = false }) {
  const { pathname } = useLocation()
  const target = countPath(path || pathname)
  const [counts, setCounts] = useState({ total: 0, pages: {} })
  const ready = fallback ?? printablePath(target)
  useEffect(() => {
    if (typeof window === 'undefined' || window.__PRERENDER__) return
    let live = true
    const update = () => { loadPrintCounts().then(data => { if (live) setCounts(data) }) }
    update()
    window.addEventListener('buga:downloads-changed', update)
    return () => { live = false; window.removeEventListener('buga:downloads-changed', update) }
  }, [target])
  const number = total ? counts.total : counts.pages[target]
  const text = total ? (number >= SHOW_FROM ? `${number.toLocaleString('he-IL')} הורדות PDF מהאתר` : '') : printLabel(number) || (ready ? 'מוכן להדפסה בחינם' : '')
  if (!text) return null
  return <span data-download-count className={`no-print inline-flex items-center gap-1 rounded-full bg-[var(--postit)] px-3 py-1 text-sm font-bold text-[var(--ink)] ${className}`}>{number >= SHOW_FROM ? '⬇️' : '🖨️'} {text}</span>
}
