import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ZOOMS, enterPresent, exitPresent, presentAllowed, stepZoom, usePresentMode } from '../../utils/presentMode'
import './present-mode.css'

// 📺 button on classroom-friendly pages, and the small toolbar shown while projecting.
export default function PresentMode() {
  const { pathname, search } = useLocation()
  const { on, zoom } = usePresentMode()
  const allowed = presentAllowed(pathname)

  useEffect(() => { if (allowed && new URLSearchParams(search).get('present') === '1') enterPresent() }, [allowed, search])
  useEffect(() => { if (!allowed) exitPresent() }, [allowed])
  useEffect(() => {
    if (!on) return undefined
    const onKey = e => {
      if (e.target.closest?.('input, textarea, [contenteditable="true"]')) return
      if (e.key === 'Escape' && !document.querySelector('dialog[open]')) exitPresent()
      else if (e.key === '+' || e.key === '=') stepZoom(1)
      else if (e.key === '-') stepZoom(-1)
    }
    // leaving the browser's full screen (Esc there) also leaves projection
    const onFs = () => { if (!document.fullscreenElement) exitPresent() }
    // anything marked data-answer stays blurred until the teacher clicks it
    const onClick = e => {
      const a = e.target.closest?.('[data-answer]')
      if (!a || a.classList.contains('is-revealed')) return
      e.preventDefault(); e.stopPropagation()
      a.classList.add('is-revealed')
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('fullscreenchange', onFs)
    document.addEventListener('click', onClick, true)
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('fullscreenchange', onFs); document.removeEventListener('click', onClick, true) }
  }, [on])

  if (!allowed) return null
  if (!on) return <button type="button" className="pm-open no-print" onClick={enterPresent} title="הקרנה בכיתה: מסך מלא, אותיות גדולות ותשובות שנחשפות בלחיצה">📺 <span>הקרנה</span></button>
  return (
    <div className="pm-bar no-print" role="toolbar" aria-label="מצב הקרנה">
      <button type="button" onClick={() => stepZoom(-1)} disabled={zoom <= ZOOMS[0]} aria-label="הקטנה">A−</button>
      <span className="pm-zoom" aria-live="polite">{Math.round(zoom * 100)}%</span>
      <button type="button" onClick={() => stepZoom(1)} disabled={zoom >= ZOOMS.at(-1)} aria-label="הגדלה">A+</button>
      <button type="button" className="pm-exit" onClick={exitPresent}>✕ יציאה</button>
    </div>
  )
}
