import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { connectActivity, recordActivity, activityForPath, ACTIVITY_LABELS, ACTION_LABELS } from '../../utils/liveActivity'
import './recent-activity.css'

export function recordPrintPreview() { recordActivity('print', activityForPath(window.location.pathname)) }

export default function RecentActivity() {
  const { pathname } = useLocation()
  const [state, setState] = useState({ count: null, events: [] })
  const [hidden, setHidden] = useState(false)
  useEffect(() => connectActivity(setState), [])
  useEffect(() => {
    const timer = setTimeout(() => recordActivity('open', activityForPath(pathname)), 1800)
    return () => clearTimeout(timer)
  }, [pathname])
  if (hidden || state.count === null) return null
  return <aside className="buga-live no-print" aria-label="פעילות חיה בעוגה בוגה" dir="rtl">
    <span className="buga-live-count" title="הערכה לפי דפדפנים מחוברים. לשוניות באותו דפדפן נספרות פעם אחת כשאחסון מקומי זמין.">
      <span className="buga-live-dot" aria-hidden="true" />
      {state.count === 1 ? 'מבקר אחד איתנו עכשיו' : `${state.count} מבקרים איתנו עכשיו`}
    </span>
    <div className="buga-live-events" aria-label="פעולות אחרונות של מבקרים מחוברים">{state.events.length?state.events.map(event=><span className="buga-live-event" key={event.key}>{event.action==='print'?'🖨️':'✨'} {event.own?'אצלך':'מבקר/ת'}: {ACTION_LABELS[event.action]} — {ACTIVITY_LABELS[event.category]}</span>):<span className="buga-live-event">🎈 כיף שאתם כאן! כאן יופיעו פעולות של מבקרים מחוברים.</span>}</div>
    <button className="buga-live-close" onClick={() => setHidden(true)} aria-label="הסתרת באנר הפעילות">×</button>
  </aside>
}
