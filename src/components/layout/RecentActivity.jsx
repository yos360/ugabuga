import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { connectActivity, recordActivity, logEvent, trackTime, activityForPath, ACTIVITY_LABELS, ACTION_LABELS } from '../../utils/liveActivity'
import './recent-activity.css'

export function recordPreviewOpen() { logEvent('preview') }
export function recordPrintPreview() { recordActivity('print', activityForPath(window.location.pathname)); logEvent('print') }

export default function RecentActivity() {
  const { pathname } = useLocation()
  const [state, setState] = useState({ count: null, events: [] })
  const [hidden, setHidden] = useState(false)
  useEffect(() => connectActivity(setState), [])
  useEffect(() => {
    // Every page view goes to the private owner log; the public live banner
    // still only shows the curated activity categories.
    logEvent('open', pathname)
    trackTime(pathname)
    const timer = setTimeout(() => recordActivity('open', activityForPath(pathname)), 1800)
    return () => clearTimeout(timer)
  }, [pathname])
  if (hidden || state.count === null) return null
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
