import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './recent-activity.css'

// liveActivity pulls the Supabase SDK; load it lazily so no page pays for it
// up front (and never during prerender snapshots, which would bake a
// modulepreload for the chunk into every page's HTML).
let activityModule = null
const loadActivity = () => {
  if (typeof window !== 'undefined' && window.__PRERENDER__) return Promise.resolve(null)
  return (activityModule ||= import('../../utils/liveActivity'))
}

export function recordPreviewOpen() { void loadActivity().then(m => m?.logEvent('preview')).catch(() => {}) }
// action: 'print' (the print dialog was opened), 'download' (a PDF was saved), 'refresh' (new exercises)
export function recordSheetAction(action = 'print') {
  void loadActivity().then(m => {
    if (!m) return
    m.recordActivity(action, m.activityForPath(window.location.pathname))
    m.logEvent(action)
  }).catch(() => {})
}
export const recordPrintPreview = () => recordSheetAction('print')

export default function RecentActivity() {
  const { pathname } = useLocation()
  const [mod, setMod] = useState(null)
  const [state, setState] = useState({ count: null, events: [] })
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    let stopped = false, disconnect = null
    const idle = window.requestIdleCallback || (fn => setTimeout(fn, 200))
    const cancelIdle = window.cancelIdleCallback || clearTimeout
    const handle = idle(() => {
      void loadActivity().then(m => {
        if (!m || stopped) return
        setMod(() => m)
        disconnect = m.connectActivity(next => {
          setState(next)
          // Shared with TrafficProof (suppliers pages) so they don't open a second live connection.
          window.__bugaLiveCount = next.count
          try { window.dispatchEvent(new CustomEvent('buga:live-count', { detail: { count: next.count } })) } catch { /* old browser */ }
        })
      }).catch(() => {})
    })
    return () => { stopped = true; cancelIdle(handle); if (disconnect) disconnect() }
  }, [])
  useEffect(() => {
    // Every page view goes to the private owner log; the public live banner
    // still only shows the curated activity categories.
    let timer = null
    void loadActivity().then(m => {
      if (!m) return
      m.logEvent('open', pathname)
      m.trackTime(pathname)
      timer = setTimeout(() => m.recordActivity('open', m.activityForPath(pathname)), 1800)
    }).catch(() => {})
    return () => clearTimeout(timer)
  }, [pathname])
  if (hidden || !mod || state.count === null) return null
  const { ACTIVITY_LABELS, ACTION_LABELS } = mod
  // Anonymous: what was opened, never who — and not your own actions.
  const others = state.events.filter(e => !e.own)
  return <aside className="buga-live no-print" aria-label="פעילות חיה בעוגה בוגה" dir="rtl">
    <span className="buga-live-count" title="הערכה לפי דפדפנים מחוברים. לשוניות באותו דפדפן נספרות פעם אחת כשאחסון מקומי זמין.">
      <span className="buga-live-dot" aria-hidden="true" />
      {state.count === 1 ? 'מבקר אחד איתנו עכשיו' : `${state.count} מבקרים איתנו עכשיו`}
    </span>
    {others.length > 0 && <div className="buga-live-events" aria-label="מה פתחו עכשיו באתר">{others.map(event=><span className="buga-live-event" key={event.key}>{event.action==='print'?'🖨️ הדפיסו':event.action==='open'?'✨ פתחו':`✨ ${ACTION_LABELS[event.action]}`}: {ACTIVITY_LABELS[event.category]}</span>)}</div>}
    <button className="buga-live-close" onClick={() => setHidden(true)} aria-label="הסתרת באנר הפעילות">×</button>
  </aside>
}
