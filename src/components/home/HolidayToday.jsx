import { Link } from 'react-router-dom'
import { upcomingHoliday, currentInfo, holidayHeadline } from '../../holidays/list'

// "Today on Buga" card for the next holiday — picked from the holiday configs, so it never goes stale.
// Loaded lazily from the home page: the holiday list pulls in every holiday's config.
export default function HolidayToday() {
  const h = upcomingHoliday()
  if (!h) return <Link to="/holidays" className="hp-today hp-today-holiday"><span className="hp-today-ic">🕯️</span><b>שבתות וחגים</b><small>לוח עברי, פעילויות וברכות</small><i>לחגים ←</i></Link>
  const started = new Date() >= new Date(currentInfo(h).start)
  const sub = h.pages.slice(1, 4).map(p => p.label).join(', ')
  return <Link to={h.base} className="hp-today hp-today-holiday"><span className="hp-today-ic">{h.emoji}</span><b>{holidayHeadline(h, started)}</b><small>{sub}</small><i>לפעילויות ←</i></Link>
}
