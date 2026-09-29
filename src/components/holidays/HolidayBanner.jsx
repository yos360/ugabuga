import { Link } from 'react-router-dom'
import { upcomingHoliday, currentInfo } from '../../holidays/list'

// A slim one-line pointer to the next holiday's area, shown on the home page.
// It picks the next holiday automatically from the holiday configs.
export default function HolidayBanner({ className = '' }) {
  const h = upcomingHoliday()
  if (!h) return null
  const started = new Date() >= new Date(currentInfo(h).start)
  return (
    <Link to={h.base} dir="rtl" className={`wobbly-sm mx-auto flex w-fit max-w-full items-center gap-2 border-2 border-[var(--border)] bg-[var(--postit)] px-4 py-1.5 text-sm font-bold transition-transform hover:-translate-y-0.5 sm:text-base ${className}`}>
      <span aria-hidden="true">{h.emoji}</span>
      <span>{started ? `${h.name} שמח!` : `${h.name} מתקרב`}</span>
      <span className="font-normal text-[var(--muted-foreground)]">· {h.bannerText || summaryShort(h)}</span>
      <span aria-hidden="true">←</span>
    </Link>
  )
}

const summaryShort = h => h.pages.slice(1, 4).map(p => p.label).join(', ')
