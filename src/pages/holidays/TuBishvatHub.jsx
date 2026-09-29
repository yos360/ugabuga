import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import HolidayShell from '../../components/holidays/HolidayShell'
import SpeciesIcon from '../../components/tubishvat/SpeciesIcon'
import { TUBISHVAT_H } from '../../holidays/tubishvat'
import { TUBISHVAT } from '../../data/tubishvat'

const BLURB = {
  '/seven-species': 'הסבר על כל מין ומשחק זיכרון',
  '/quiz': '3 רמות, הסבר אחרי כל תשובה — גם להדפסה',
  '/coloring': 'עץ, שקדייה, רימון, ענבים ועוד — 6 דפים',
  '/worksheets': 'ספירה, התאמה וכתיבה לגן ולכיתה א׳',
  '/what-to-do': 'שתילה, סדר ט״ו בשבט, טיולים ורעיונות לגן',
}
const COLORS = ['bg-green-100', 'bg-yellow-100', 'bg-pink-100', 'bg-lime-100', 'bg-orange-100']

const FAQ = [
  { q: 'מתי ט״ו בשבט 2027?', a: 'ט״ו בשבט תשפ״ז חל ביום שבת, 23 בינואר 2027, ומתחיל ביום שישי בערב (22 בינואר). בגנים ובבתי הספר חוגגים בדרך כלל ביום חמישי או שישי שלפני.' },
  { q: 'למה ט״ו בשבט נקרא "ראש השנה לאילנות"?', a: 'במשנה נקבע ט״ו בשבט כתאריך שבו מתחילה "שנה חדשה" לעצים — לעניין חישוב גיל העץ ומצוות הקשורות לפירות. בתקופה הזו מסתיימת עונת הגשמים העיקרית והעצים מתחילים להתעורר.' },
  { q: 'מה נוהגים לעשות בט״ו בשבט?', a: 'שותלים עצים, אוכלים פירות — במיוחד פירות יבשים ופירות משבעת המינים — ויש שעורכים "סדר ט״ו בשבט" עם פירות וברכות.' },
]

function Countdown() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(t) }, [])
  const start = new Date(TUBISHVAT.start).getTime(), end = new Date(TUBISHVAT.end).getTime()
  const days = Math.ceil((start - now) / 86400000)
  return <p className="text-3xl font-bold">{now >= end ? 'ט״ו בשבט עבר — נתראה בשנה הבאה 🌳' : now >= start ? 'ט״ו בשבט שמח! 🌳' : `עוד ${days} ימים לט״ו בשבט 🌱`}</p>
}

export default function TuBishvatHub() {
  const h = TUBISHVAT_H
  return (
    <HolidayShell h={h}>
      <SEO title={`ט״ו בשבט ${TUBISHVAT.year} לילדים — שבעת המינים, חידון ודפי צביעה`} description="כל מה שצריך לט״ו בשבט עם ילדים: שבעת המינים ומשחק זיכרון, חידון ב־3 רמות, דפי צביעה ודפי עבודה להדפסה ורעיונות לפעילויות בגן ובבית. תאריך ט״ו בשבט 2027 וספירה לאחור." path={h.base} structuredData={faqSchema(FAQ)} />
      <div className="mb-8 rounded-3xl border-2 border-slate-800 bg-gradient-to-b from-green-600 to-emerald-800 p-6 text-center text-white sketch-shadow">
        <p className="text-6xl mb-2" aria-hidden="true">🌳</p>
        <h1 className="text-4xl sm:text-5xl mb-3 text-white">ט״ו בשבט {TUBISHVAT.year} לילדים</h1>
        <Countdown />
        <p className="mt-2 text-green-100">{TUBISHVAT.datesText}</p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {h.pages.slice(1).map((p, i) => <Link key={p.to} to={p.to} className={`wobbly flex flex-col border-2 border-[var(--border)] ${COLORS[i]} p-5 sketch-shadow transition-transform hover:-translate-y-1`}>
          <span className="mb-1 text-4xl" aria-hidden="true">{i === 0 ? <SpeciesIcon id="pomegranate" size={44} /> : p.emoji}</span>
          <h2 className="text-2xl font-bold">{p.label === 'חידון' ? 'חידון ט״ו בשבט' : p.label}</h2>
          <p className="flex-1 text-[var(--muted-foreground)]">{BLURB[p.to.replace(h.base, '')]}</p>
          <span className="mt-2 font-bold underline decoration-dashed">כניסה ←</span>
        </Link>)}
      </div>

      <SeoBody
        paragraphs={[
          'ט״ו בשבט הוא "ראש השנה לאילנות" — החג של העצים. בחורף, כשהגשמים משקים את האדמה והשקדייה מתחילה לפרוח, יוצאים לשתול עצים, אוכלים פירות ולומדים על שבעת המינים של ארץ ישראל.',
          'באזור ט״ו בשבט של עוגה בוגה ריכזנו את כל מה שצריך לחג עם ילדים: משחק ומידע על שבעת המינים, חידון, דפי צביעה ודפי עבודה להדפסה ורעיונות לפעילויות. הכול בחינם ובלי הרשמה.',
        ]}
        faq={FAQ}
        related={[{ label: 'כל החגים', href: '/holidays' }, { label: 'חנוכה', href: '/holidays/hanukkah' }, { label: 'משחקים לגן', href: '/games/kindergarten' }]}
      />
    </HolidayShell>
  )
}
