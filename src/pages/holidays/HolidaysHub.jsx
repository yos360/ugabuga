import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { HOLIDAYS_BY_DATE, summaryOf, whenOf } from '../../holidays/list'

// One home for every holiday area, in calendar order from the next holiday.
// Built from the holiday configs — a new area shows up here by itself.
const Card = ({ h }) => <Link to={h.base} className={`wobbly flex flex-col border-2 border-[var(--border)] ${h.soft} p-5 sketch-shadow transition-transform hover:-translate-y-1`}>
  <span className="text-5xl mb-1" aria-hidden="true">{h.emoji}</span>
  <h2 className="text-2xl font-bold">{h.name}</h2>
  <p className="text-sm font-bold text-[var(--muted-foreground)]">{whenOf(h)}</p>
  <p className="flex-1 mt-1">{summaryOf(h)}</p>
  <span className="mt-2 font-bold underline decoration-dashed">כניסה ←</span>
  </Link>

export default function HolidaysHub() {
  const now = new Date()
  const upcoming = HOLIDAYS_BY_DATE.filter(h => new Date(h.info.end) > now)
  const past = HOLIDAYS_BY_DATE.filter(h => new Date(h.info.end) <= now)
  const names = HOLIDAYS_BY_DATE.map(h => h.name).join(', ')
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="חגים עם ילדים — משחקים, דפי צביעה ופעילויות לכל חג" description={`פעילויות לחגים עם ילדים: ${names} — משחקים על המסך, חידונים, דפי צביעה ודפי עבודה להדפסה ורעיונות לחופשות. בחינם.`} path="/holidays" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חגים' }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-2">🎉 חגים עם ילדים</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">משחקים, חידונים, דפים להדפסה ורעיונות — לפי סדר החגים בלוח השנה</p>
      <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[...upcoming, ...past].map(h => <Card key={h.slug} h={h} />)}</div>
      <SeoBody paragraphs={[
        'לכל חג יש כאן אזור משלו: חידון ב־3 רמות, דפי צביעה ודפי עבודה להדפסה לגן ולכיתה א׳, ורעיונות לפעילויות בגן, בכיתה ובבית — ולחלק מהחגים גם משחקים מיוחדים, כמו סביבון וירטואלי לחנוכה ומשחק שבעת המינים לט״ו בשבט.',
        'החגים מסודרים לפי התאריך הבא שלהם, כך שהחג הקרוב תמיד מופיע ראשון. הכול בחינם ובלי הרשמה.',
      ]} />
    </div>
  )
}
