import { englishCounterpart } from '../../en/englishLinks'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { HOLIDAYS_BY_DATE, summaryOf, whenOf, isOver } from '../../holidays/list'

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
  const upcoming = HOLIDAYS_BY_DATE.filter(h => !isOver(h, now))
  const past = HOLIDAYS_BY_DATE.filter(h => isOver(h, now))
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO counterpartPath={englishCounterpart('/holidays')} title="שבתות וחגים עם ילדים — חידונים, לוחות ופעילויות" description="שבתות וחגים עם ילדים: חידון פרשת השבוע, זמני שבת ולוח עם תמונה, אבא ואמא של שבת להדפסה, משחקים ופעילויות לכל חג. בחינם." path="/holidays" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'שבתות וחגים' }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-2">🕯️ שבתות וחגים עם ילדים</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">משחקים, חידונים, דפים להדפסה ורעיונות — לפי סדר החגים בלוח השנה</p>
      <section className="mb-10 rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-5 sm:p-7"><h2 className="text-3xl mb-2">כל שבוע, רגע של שבת</h2><p className="mb-5">מכינים לפני שבת, נהנים יחד בכיתה, בגן ובבית.</p><div className="grid gap-4 sm:grid-cols-2">{[["/holidays/shabbat-parents","🖼️","אבא של שבת ואמא של שבת","מזכרת עם שם הילד או הילדה ותמונה אישית."],["/shabbat-times#calendar","🕯️","לוח שבת עם תמונה","זמני שבת לפי עיר, לוח חודשי או שנתי להדפסה."],["/parasha","🔎","בלשי הפרשה","חידון שבועי, דפי תלמידים ודף תשובות למורה."],["/games/shabbat","🎲","משחקים לשבת","רעיונות לזמן משותף בלי מסכים."]].map(([to,icon,title,desc]) => <Link key={to} to={to} className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-5"><span className="text-3xl" aria-hidden="true">{icon}</span><h3 className="text-xl mt-2">{title}</h3><p className="mt-2">{desc}</p><span className="block mt-3 underline font-bold">בואו נכין ←</span></Link>)}</div></section>
      <h2 className="text-3xl mb-5">חגי ישראל</h2>
      <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[...upcoming, ...past].map(h => <Card key={h.slug} h={h} />)}</div>
      <SeoBody paragraphs={[
        'לכל חג יש כאן אזור משלו: חידון ב־3 רמות, דפי צביעה ודפי עבודה להדפסה לגן ולכיתה א׳, ורעיונות לפעילויות בגן, בכיתה ובבית — ולחלק מהחגים גם משחקים מיוחדים, כמו סביבון וירטואלי לחנוכה ומשחק שבעת המינים לט״ו בשבט.',
        'החגים מסודרים לפי התאריך הבא שלהם, כך שהחג הקרוב תמיד מופיע ראשון. הכול בחינם ובלי הרשמה.',
      ]} />
    </div>
  )
}
