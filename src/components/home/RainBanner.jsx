import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// Top of the home page, only while it rains (functions/api/rain.js): Buga with hot chocolate and the winter area.
const LINKS = [['#together', '📺', 'משחקים יחד'], ['#print', '🖨️', 'להדפסה'], ['#crafts', '🎨', 'יצירה'], ['#kitchen', '🍲', 'מטבח חם']]

export default function RainBanner() {
  const [rain, setRain] = useState(false)
  useEffect(() => {
    if (window.__PRERENDER__) return
    const ctrl = new AbortController()
    fetch('/api/rain', { signal: ctrl.signal }).then(r => (r.ok ? r.json() : null)).then(d => setRain(d?.rain === true)).catch(() => {})
    return () => ctrl.abort()
  }, [])
  if (!rain) return null
  return <aside className="rain-banner" aria-label="יורד גשם: בוגה שוקו חם">
    <img src="/images/buga-hot-chocolate.webp" alt="בוגה מחזיק ספל שוקו חם" width="480" height="462" />
    <div>
      <p className="rain-banner-kicker">יורד גשם בחוץ 🌧️</p>
      <Link to="/winter" className="rain-banner-title">בוגה שוקו חם</Link>
      <p className="rain-banner-lead">הכנו לכם שוקו חם ופעילויות לבית ולחורף</p>
      <nav aria-label="פעילויות לחורף">{LINKS.map(([hash, emoji, label]) => <Link key={hash} to={`/winter${hash}`}><span aria-hidden="true">{emoji}</span> {label}</Link>)}</nav>
    </div>
  </aside>
}
