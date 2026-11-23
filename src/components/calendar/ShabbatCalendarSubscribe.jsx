import { useState } from 'react'
import { SHABBAT_CITIES, SHABBAT_PLACES } from '../../data/shabbatCities'
import { shabbatFeedPath } from '../../utils/calendarFeeds'
import FeedButtons from './FeedButtons'

// "Candle-lighting in my calendar" (owner's idea, 23.11.2026): pick a city, subscribe once, and every Friday the
// calendar shows the candle-lighting time with an hour's warning. The feed (/calendar/shabbat-<city>.ics) is written
// at build time from the same times as this page. Clicks: invite-cta:calendar-shabbat-<app> on /shabbat-times/<city>.
const MAJOR = new Set(SHABBAT_CITIES.map(c => c.slug))
const byName = (a, b) => a.name.localeCompare(b.name, 'he')
const MAIN = SHABBAT_PLACES.filter(c => MAJOR.has(c.slug)).sort(byName)
const OTHER = SHABBAT_PLACES.filter(c => !MAJOR.has(c.slug)).sort(byName)

export default function ShabbatCalendarSubscribe({ city, className = 'mt-6' }) {
  const [slug, setSlug] = useState(city?.slug || 'jerusalem')
  const chosen = SHABBAT_PLACES.find(c => c.slug === slug) || SHABBAT_PLACES[0]
  return <section aria-labelledby="scs-title" className={`no-print rounded-3xl border-2 border-[var(--border)] bg-sky-50 p-5 ${className}`}>
    <h2 id="scs-title" className="text-2xl font-bold">🕯️ הדלקת נרות ישר ליומן</h2>
    <p className="mt-1 text-[var(--muted-foreground)]">בוחרים עיר, מצטרפים פעם אחת, ובכל יום שישי היומן מציג את שעת כניסת השבת, הפרשה וצאת השבת, עם התראה שעה לפני. בלי הרשמה ובלי מייל.</p>
    <label className="mt-3 block font-bold">העיר שלכם
      <select value={slug} onChange={e => setSlug(e.target.value)} className="mt-1 block min-h-[48px] w-full max-w-sm rounded-2xl border-2 border-[var(--border)] bg-white px-3">
        <optgroup label="ערים מרכזיות">{MAIN.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</optgroup>
        <optgroup label="ערים ומועצות נוספות">{OTHER.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</optgroup>
      </select>
    </label>
    <FeedButtons key={chosen.slug} feedPath={shabbatFeedPath(chosen.slug)} code={app => `calendar-shabbat-${app}`} logPath={`/shabbat-times/${chosen.slug}`} />
    <p className="mt-3 text-sm text-[var(--muted-foreground)]">ליישוב שאינו ברשימה: בחרו את העיר הקרובה אליכם. הזמנים לשנה הקרובה, והם מתעדכנים לבד. אפשר להסיר בכל רגע מהגדרות היומן.</p>
  </section>
}
