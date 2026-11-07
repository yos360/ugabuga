import { Link } from 'react-router-dom'
import { upcomingHoliday, currentInfo } from '../../holidays/list'

// Home-page strip for the next holiday's coloring pages, from about a month before it until it ends.
// Seasonal coloring is the site's best-converting page type (Sigd 2026: more prints than opens).
// Lazy from the home page, like HolidayToday: the holiday list pulls in every holiday's config.
// From TOP_DAYS before the holiday until it ends, the strip moves to the very top of the home page
// (rendered with `top`), with a second button for the holiday's workbook when it has one.
const DAYS_BEFORE = 35, TOP_DAYS = 3
export default function SeasonColoring({ top = false }) {
  const h = upcomingHoliday()
  const page = h?.pages.find(p => p.to === `${h.base}/coloring`)
  if (!page) return null
  const until = new Date(currentInfo(h).start) - Date.now()
  if (until > DAYS_BEFORE * 86400000) return null
  if (top !== until <= TOP_DAYS * 86400000) return null
  const workbook = top && h.pages.find(p => p.to === `${h.base}/workbook`)
  return <>
    <Link to={page.to} className="travel-spotlight season-coloring">
      <span className="travel-plane" aria-hidden="true">🖍️</span>
      <span className="travel-copy"><b>{h.emoji} דפי צביעה ל{h.name}</b><small>להדפסה בחינם או לשמירה כ־PDF, לבית, לגן ולכיתה</small></span>
      <span className="travel-cta">לצביעה ←</span>
    </Link>
    {workbook && <Link to={workbook.to} className="travel-spotlight season-coloring">
      <span className="travel-plane" aria-hidden="true">📒</span>
      <span className="travel-copy"><b>{h.emoji} חוברת עבודה ל{h.name}</b><small>{workbook.blurb}</small></span>
      <span className="travel-cta">לחוברת ←</span>
    </Link>}
  </>
}
