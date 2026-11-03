import { Link } from 'react-router-dom'
import { upcomingHoliday, currentInfo } from '../../holidays/list'

// Home-page strip for the next holiday's coloring pages, from about a month before it until it ends.
// Seasonal coloring is the site's best-converting page type (Sigd 2026: more prints than opens).
// Lazy from the home page, like HolidayToday: the holiday list pulls in every holiday's config.
const DAYS_BEFORE = 35
export default function SeasonColoring() {
  const h = upcomingHoliday()
  const page = h?.pages.find(p => p.to === `${h.base}/coloring`)
  if (!page || new Date(currentInfo(h).start) - Date.now() > DAYS_BEFORE * 86400000) return null
  return <Link to={page.to} className="travel-spotlight season-coloring">
    <span className="travel-plane" aria-hidden="true">🖍️</span>
    <span className="travel-copy"><b>{h.emoji} דפי צביעה ל{h.name}</b><small>להדפסה בחינם או לשמירה כ־PDF, לבית, לגן ולכיתה</small></span>
    <span className="travel-cta">לצביעה ←</span>
  </Link>
}
