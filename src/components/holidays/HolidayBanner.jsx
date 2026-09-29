import { Link } from 'react-router-dom'

// A slim one-line pointer to the next holiday's area, shown on the home page.
// Each entry shows from `from` until the holiday ends; add the next holiday here
// when its area is built (ט״ו בשבט, פורים…).
const SEASONS = [
  { from: '2026-09-01', until: '2026-12-13', emoji: '🕎', to: '/holidays/hanukkah', title: 'חנוכה מתקרב', text: 'סביבון, חידון ודפי צביעה' },
]

export const currentSeason = (now = new Date()) => SEASONS.find(s => now >= new Date(s.from) && now < new Date(s.until))

export default function HolidayBanner({ className = '' }) {
  const s = currentSeason()
  if (!s) return null
  return (
    <Link to={s.to} dir="rtl" className={`wobbly-sm mx-auto flex w-fit max-w-full items-center gap-2 border-2 border-[var(--border)] bg-[var(--postit)] px-4 py-1.5 text-sm font-bold transition-transform hover:-translate-y-0.5 sm:text-base ${className}`}>
      <span aria-hidden="true">{s.emoji}</span>
      <span>{s.title}</span>
      <span className="font-normal text-[var(--muted-foreground)]">· {s.text}</span>
      <span aria-hidden="true">←</span>
    </Link>
  )
}
