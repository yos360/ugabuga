import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { HebrewCalendar as HC, flags } from '@hebcal/core'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { HEB_MONTHS, HEB_DAYS } from '../../utils/hebrewCalendar'
import { israelToday } from '../../utils/parashaCalendar'

// Sefirat HaOmer: which day it is, what is counted tonight, and the 49 days with dates — computed with
// @hebcal/core. A day of the Omer is counted on the evening before its date (the Hebrew day starts at
// nightfall), so "tonight" means the Omer day of tomorrow's date.
const BLESSING = 'בָּרוּךְ אַתָּה ה׳ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו וְצִוָּנוּ עַל סְפִירַת הָעֹמֶר.'
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const label = d => `${d.getDay() === 6 ? 'מוצאי שבת' : 'יום ' + HEB_DAYS[d.getDay()]}, ${d.getDate()} ב${HEB_MONTHS[d.getMonth()]}`

function omerDays(from, to) {
  return HC.calendar({ start: from, end: to, il: true, omer: true, noHolidays: true })
    .filter(e => e.getFlags() & flags.OMER_COUNT)
    .map(e => { const date = e.getDate().greg(); return { day: e.omer, date, eve: addDays(date, -1), text: e.getTodayIs('he'), sefira: e.sefira('he') } })
}

export default function OmerCount() {
  const [y, m, d] = israelToday().split('-').map(Number)
  const today = new Date(y, m - 1, d)
  // This year's Omer if it hasn't ended yet, otherwise next year's.
  const days = useMemo(() => {
    const now = omerDays(new Date(y, 0, 1), new Date(y, 11, 31))
    return now.length && now[now.length - 1].date >= today ? now : omerDays(new Date(y + 1, 0, 1), new Date(y + 1, 11, 31))
  }, [y]) // eslint-disable-line react-hooks/exhaustive-deps
  const byDate = new Map(days.map(x => [iso(x.date), x]))
  const daytime = byDate.get(iso(today)), tonight = byDate.get(iso(addDays(today, 1)))
  const first = days[0], year = first.date.getFullYear()

  return <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <SEO title="ספירת העומר היום — כמה סופרים הערב, נוסח וברכה" description={`ספירת העומר היום: איזה יום בעומר, מה סופרים הערב ובאיזה נוסח, הברכה, וטבלת כל 49 הימים עם התאריכים לשנת ${year}.`} path="/omer" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חגים', href: '/holidays' }, { label: 'ספירת העומר' }]} />
    <h1 className="text-center text-4xl font-black sm:text-5xl">🌾 ספירת העומר היום</h1>

    <section className="mx-auto mt-5 max-w-2xl rounded-3xl border-[3px] border-amber-400 bg-amber-50 p-5 text-center">
      {tonight ? <>
        <p className="font-bold text-amber-800">הערב, {label(today)}, אחרי צאת הכוכבים סופרים:</p>
        <p className="mt-2 text-3xl font-black leading-snug sm:text-4xl" lang="he">{tonight.text}</p>
        <p className="mt-2 text-lg text-slate-700">יום {tonight.day} בעומר · {tonight.sefira}</p>
      </> : daytime ? <p className="text-2xl font-black">היום יום {daytime.day} — היום האחרון של ספירת העומר. מחר חג שבועות.</p>
        : <p className="text-2xl font-black">ספירת העומר מתחילה ב{label(first.eve)} {first.eve.getFullYear()} בערב — מוצאי יום טוב ראשון של פסח.</p>}
      {daytime && tonight && <p className="mt-3 text-sm text-slate-600">ביום (עד השקיעה) זה יום {daytime.day} בעומר. מי ששכח לספור אתמול בלילה סופר היום בלי ברכה, וממשיך לספור בברכה מהלילה.</p>}
    </section>

    <section className="mt-6 rounded-2xl border-2 border-slate-200 bg-white p-5">
      <h2 className="text-2xl font-black">הברכה</h2>
      <p className="mt-2 text-2xl leading-relaxed" lang="he">{BLESSING}</p>
      <p className="mt-2 text-slate-600">אחרי הברכה אומרים את נוסח הספירה של אותו לילה. יש קהילות שאומרות ״לָעֹמֶר״ ויש שאומרות ״בָּעֹמֶר״ — כל אחד לפי המנהג שלו.</p>
    </section>

    <section className="mt-8">
      <h2 className="mb-2 text-2xl font-black">כל 49 הימים — {year}</h2>
      <p className="mb-3 text-slate-600">התאריך בטבלה הוא הערב שבו סופרים.</p>
      <div className="overflow-x-auto"><table className="w-full text-right">
        <thead><tr className="border-b-2"><th className="p-2">יום</th><th className="p-2">סופרים בערב</th><th className="p-2">נוסח</th></tr></thead>
        <tbody>{days.map(x => <tr key={x.day} className={`border-b align-top ${tonight?.day === x.day ? 'bg-amber-100 font-bold' : ''}`}><td className="p-2 text-xl font-black">{x.day}{x.day === 33 && <div className="text-xs text-violet-700">ל״ג בעומר</div>}</td><td className="whitespace-nowrap p-2">{label(x.eve)}</td><td className="p-2 text-lg" lang="he">{x.text}</td></tr>)}</tbody>
      </table></div>
    </section>

    <div className="mt-10"><SeoBody paragraphs={[
      'ספירת העומר היא מצווה לספור 49 ימים — שבעה שבועות — מהיום השני של פסח ועד חג שבועות, שנקרא כך בגלל השבועות שסופרים. סופרים בכל ערב אחרי צאת הכוכבים, כי היום העברי מתחיל בלילה: קודם מברכים, ואז אומרים כמה ימים (ומהיום השביעי גם כמה שבועות) עברו.',
      'בעמוד הזה הספירה מחושבת אוטומטית לפי התאריך בישראל: רואים מה סופרים הערב, את נוסח הספירה המלא ואת הטבלה של כל הימים. ל״ג בעומר, היום ה־33, הוא יום שמח עם מדורות, ובערב שלפני חג שבועות סופרים את היום ה־49 והאחרון.',
    ]} faq={FAQ} related={[{ label: 'לוח שנה עברי לועזי', href: '/hebrew-calendar' }, { label: 'ל״ג בעומר לילדים', href: '/holidays/lag-baomer' }, { label: 'חג שבועות', href: '/holidays/shavuot' }, { label: 'פסח לילדים', href: '/holidays/pesach' }]} /></div>
    <p className="mt-4 text-center"><Link to="/hebrew-calendar" className="underline">ללוח השנה העברי ←</Link></p>
  </div>
}

const FAQ = [
  { q: 'מתי סופרים ספירת העומר?', a: 'בכל ערב אחרי צאת הכוכבים, מהערב השני של פסח (מוצאי יום טוב ראשון) ועד הערב שלפני חג שבועות — 49 ערבים.' },
  { q: 'שכחתי לספור בלילה, מה עושים?', a: 'לפי ההלכה המקובלת, מי ששכח בלילה סופר במשך היום בלי ברכה, ובלילה הבא ממשיך לספור בברכה. מי שלא ספר יום שלם ממשיך לספור בלי ברכה. במקרה של ספק כדאי לשאול רב.' },
  { q: 'כמה ימים סופרים?', a: '49 ימים, שהם שבעה שבועות שלמים. ביום החמישים חל חג שבועות.' },
  { q: 'מה זה ל״ג בעומר?', a: 'היום ה־33 של ספירת העומר (ל״ג = 33). זה יום שמח שבו נהוג להדליק מדורות.' },
  { q: 'אומרים ״לעומר״ או ״בעומר״?', a: 'שני הנוסחים מקובלים: בחלק מהקהילות אומרים ״לָעֹמֶר״ ובחלק ״בָּעֹמֶר״. כל אחד לפי מנהג המשפחה או בית הכנסת.' },
]
