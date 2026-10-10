import { useEffect, useState } from 'react'
import { daysUntil } from '../../utils/israelDate'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import HanukkahShell, { HANUKKAH_PAGES } from '../../components/hanukkah/HanukkahShell'
import { HANUKKAH } from '../../data/hanukkah'

const BLURB = {
  '/holidays/hanukkah/songs': 'סביבון, כד קטן, מעוז צור וברכות ההדלקה',
  '/holidays/hanukkah/sevivon': 'מסובבים בלחיצה, עם ניקוד אוטומטי לכל המשפחה',
  '/holidays/hanukkah/quiz': '3 רמות, הסבר אחרי כל תשובה — גם להדפסה',
  '/holidays/hanukkah/coloring': 'חנוכייה, סביבון, סופגניות ועוד — 6 דפים',
  '/holidays/hanukkah/worksheets': 'ספירה, חשבון וכתיבה לגן ולכיתה א׳',
  '/holidays/hanukkah/what-to-do': 'רעיונות לחופשה — בבית, בחוץ ובדרך',
}
const COLORS = ['bg-blue-100', 'bg-yellow-100', 'bg-pink-100', 'bg-green-100', 'bg-orange-100', 'bg-purple-100']

const FAQ = [
  { q: 'מתי חנוכה 2026?', a: 'את הנר הראשון מדליקים ביום שישי, 4 בדצמבר 2026 בערב (כ״ד בכסלו תשפ״ז). את הנר השמיני מדליקים ב־11 בדצמבר, והחג מסתיים ב־12 בדצמבר.' },
  { q: 'כמה נרות מדליקים בכל ערב?', a: 'בערב הראשון נר אחד, ובכל ערב מוסיפים נר — עד שמונה בערב האחרון. בנוסף יש תמיד את השמש, שבעזרתו מדליקים את כולם.' },
  { q: 'אילו ברכות מברכים בהדלקת נרות חנוכה?', a: 'בכל ערב: "ברוך אתה ה׳ אלוהינו מלך העולם אשר קידשנו במצוותיו וציוונו להדליק נר של חנוכה" ו"ברוך אתה ה׳ אלוהינו מלך העולם שעשה ניסים לאבותינו בימים ההם בזמן הזה". בערב הראשון מוסיפים גם "שהחיינו".' },
]

function Countdown() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(t) }, [])
  const start = new Date(HANUKKAH.firstCandle).getTime(), end = new Date(HANUKKAH.end).getTime()
  const days = daysUntil(start, now)
  const candle = Math.min(8, 1 - days) // tonight's candle, by Israeli calendar date
  const text = now >= end ? 'חנוכה הסתיים — נתראה בשנה הבאה 🕎' : now >= start ? `חג שמח! הערב מדליקים נר ${candle} של חנוכה 🕎` : days <= 0 ? 'הערב מדליקים נר ראשון! 🕯️' : days === 1 ? 'מחר מדליקים נר ראשון! 🕯️' : `עוד ${days} ימים לנר הראשון 🕯️`
  return <p className="text-3xl font-bold">{text}</p>
}

export default function HanukkahHub() {
  return (
    <HanukkahShell>
      <SEO title={`חנוכה ${HANUKKAH.year} לילדים — סביבון, חידון, דפי צביעה ורעיונות`} description="כל מה שצריך לחנוכה עם ילדים במקום אחד: סביבון וירטואלי, חידון חנוכה, דפי צביעה ודפי עבודה להדפסה, ורעיונות מה עושים בחופשת חנוכה. תאריכי חנוכה 2026 וספירה לאחור." path="/holidays/hanukkah" structuredData={faqSchema(FAQ)} />
      <div className="mb-8 rounded-3xl border-2 border-slate-800 bg-gradient-to-b from-blue-700 to-indigo-900 p-6 text-center text-white sketch-shadow">
        <p className="text-6xl mb-2" aria-hidden="true">🕎</p>
        <h1 className="text-4xl sm:text-5xl mb-3 text-white">חנוכה {HANUKKAH.year} לילדים</h1>
        <Countdown />
        <p className="mt-2 text-blue-100">{HANUKKAH.datesText}</p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HANUKKAH_PAGES.slice(1).map((p, i) => <Link key={p.to} to={p.to} className={`wobbly flex flex-col border-2 border-[var(--border)] ${COLORS[i]} p-5 sketch-shadow transition-transform hover:-translate-y-1`}>
          <span className="text-4xl mb-1" aria-hidden="true">{p.emoji}</span>
          <h2 className="text-2xl font-bold">{p.label}</h2>
          <p className="flex-1 text-[var(--muted-foreground)]">{BLURB[p.to]}</p>
          <span className="mt-2 font-bold underline decoration-dashed">כניסה ←</span>
        </Link>)}
        <Link to="/ideas/hanukkah-party" className="wobbly flex flex-col border-2 border-[var(--border)] bg-purple-100 p-5 sketch-shadow transition-transform hover:-translate-y-1">
          <span className="text-4xl mb-1" aria-hidden="true">🎉</span>
          <h2 className="text-2xl font-bold">מסיבת חנוכה</h2>
          <p className="flex-1 text-[var(--muted-foreground)]">איך מארגנים מסיבת חנוכה לילדים — משחקים, אוכל ותוכנית</p>
          <span className="mt-2 font-bold underline decoration-dashed">כניסה ←</span>
        </Link>
      </div>

      <section className="mb-10 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5">
        <h2 className="text-2xl font-bold mb-3">🕯️ איך מדליקים נרות חנוכה?</h2>
        <ol className="list-decimal space-y-2 pr-6">
          <li>מעמידים את החנוכייה ליד החלון או ליד הפתח — כדי שיראו אותה מבחוץ.</li>
          <li>מניחים את הנרות מימין לשמאל: בערב הראשון נר אחד בצד ימין, ובכל ערב מוסיפים נר אחד משמאל.</li>
          <li>מדליקים את השמש, מברכים, ומדליקים בעזרתו — מתחילים מהנר החדש (השמאלי ביותר).</li>
          <li>שרים "מעוז צור", ונהנים מהאור. הנרות צריכים לדלוק לפחות חצי שעה.</li>
        </ol>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">חשוב: לא משאירים נרות דולקים בלי השגחה של מבוגר, ומרחיקים אותם מווילונות.</p>
      </section>

      <SeoBody
        paragraphs={[
          'חנוכה הוא חג האורים: שמונה ימים שבהם מדליקים נרות, אוכלים סופגניות ולביבות ומשחקים בסביבון — לזכר ניצחון המכבים ונס פך השמן שדלק שמונה ימים בבית המקדש.',
          'באזור החנוכה של עוגה בוגה ריכזנו את כל מה שצריך לחג עם ילדים: משחקים על המסך, דפים להדפסה לגן ולבית הספר, ורעיונות לימי החופשה. הכול בחינם ובלי הרשמה.',
        ]}
        faq={FAQ}
        related={[{ label: 'כל החגים', href: '/holidays' }, { label: 'משחקים לגן', href: '/games/kindergarten' }, { label: 'חדרי בריחה להדפסה', href: '/tools/escape-rooms' }]}
      />
    </HanukkahShell>
  )
}
