import { Link } from 'react-router-dom'

// The next holiday's area, shown on the home page and the classroom hub.
// Each entry shows from `from` until the holiday ends; add the next holiday here
// when its area is built (ט״ו בשבט, פורים…).
const SEASONS = [
  {
    from: '2026-09-01', until: '2026-12-13', emoji: '🕎', to: '/holidays/hanukkah',
    title: 'חנוכה מתקרב!', text: 'סביבון וירטואלי, חידון חנוכה, דפי צביעה ודפי עבודה לגן ולכיתה',
    links: [['🎲 סביבון', '/holidays/hanukkah/sevivon'], ['❓ חידון', '/holidays/hanukkah/quiz'], ['🖍️ דפי צביעה', '/holidays/hanukkah/coloring'], ['✏️ דפי עבודה', '/holidays/hanukkah/worksheets']],
  },
]

export const currentSeason = (now = new Date()) => SEASONS.find(s => now >= new Date(s.from) && now < new Date(s.until))

export default function HolidayBanner({ className = '' }) {
  const s = currentSeason()
  if (!s) return null
  return (
    <section aria-label={s.title} className={`mx-auto max-w-5xl rounded-3xl border-2 border-slate-800 bg-gradient-to-l from-blue-700 to-indigo-900 p-4 text-white shadow-[0_6px_0_rgba(20,30,60,.25)] sm:p-5 ${className}`} dir="rtl">
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-right">
        <span className="text-5xl" aria-hidden="true">{s.emoji}</span>
        <div className="flex-1">
          <Link to={s.to} className="text-2xl font-black text-white underline-offset-4 hover:underline sm:text-3xl">{s.title}</Link>
          <p className="text-blue-100">{s.text}</p>
        </div>
        <Link to={s.to} className="shrink-0 rounded-2xl bg-yellow-300 px-5 py-3 font-black text-slate-900">לכל החג ←</Link>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
        {s.links.map(([label, to]) => <Link key={to} to={to} className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/25">{label}</Link>)}
      </div>
    </section>
  )
}
