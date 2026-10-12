import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { gematria, hebrewParts, HEB_DAYS } from '../../utils/hebrewCalendar'
import { ageParts } from '../../utils/calc'

// "בן כמה אני?" — age in years/months/days, total days, the weekday of birth, the Hebrew birth date
// and how long until the next birthday.
const FAQ = [
  { q: 'איך מחשבים בן כמה אני בימים?', a: 'מקלידים את תאריך הלידה, והמחשבון סופר את כל הימים מיום הלידה ועד היום — כולל שנים מעוברות.' },
  { q: 'איך יודעים באיזה יום בשבוע נולדתי?', a: 'המחשבון מראה את היום בשבוע של תאריך הלידה (ראשון עד שבת) ואת התאריך העברי שבו נולדתם.' },
  { q: 'כמה זמן נשאר עד יום ההולדת?', a: 'מתחת לגיל מופיע כמה ימים נשארו עד יום ההולדת הבא, ובאיזה גיל תחגגו.' },
]

export default function AgeCalculator() {
  const [val, setVal] = useState('')
  const birth = /^\d{4}-\d{2}-\d{2}$/.test(val) ? new Date(val + 'T12:00:00') : null
  const today = new Date()
  const ok = birth && birth <= today && birth.getFullYear() > 1900
  const a = ok ? ageParts(birth, today) : null
  const h = ok ? hebrewParts(birth) : null
  return <div className="mx-auto max-w-2xl px-4 py-8" dir="rtl">
    <SEO title="בן כמה אני? מחשבון גיל בימים, וגם באיזה יום בשבוע נולדתי" description="מחשבון גיל: מקלידים תאריך לידה ומקבלים גיל בשנים, חודשים וימים, בן כמה אני בימים, באיזה יום בשבוע נולדתי, התאריך העברי וכמה ימים נשארו ליום ההולדת." path="/tools/age-calculator" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'מחשבון גיל' }]} />
    <h1 className="mb-2 text-center text-4xl font-black">🎂 בן כמה אני?</h1>
    <p className="mb-6 text-center text-lg text-[var(--muted-foreground)]">גיל בשנים ובימים, באיזה יום בשבוע נולדתם, התאריך העברי — וכמה נשאר ליום ההולדת</p>
    <label className="mx-auto block max-w-xs text-center font-bold">תאריך לידה
      <input type="date" value={val} max={today.toISOString().slice(0, 10)} onChange={e => setVal(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 text-lg" />
    </label>
    {a && <div className="mx-auto mt-6 max-w-md space-y-3 rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-5 text-center sketch-shadow" aria-live="polite">
      <p className="text-3xl font-black">{a.y} שנים, {a.m} חודשים ו־{a.d} ימים</p>
      <p className="text-xl">כלומר <b>{a.days.toLocaleString('he-IL')}</b> ימים 🎉</p>
      <p className="text-lg">נולדתם ביום <b>{HEB_DAYS[birth.getDay()]}</b>{h ? <>, <b>{gematria(h.day)} ב{h.month} {gematria(h.year)}</b></> : null}</p>
      <p className="text-lg">{a.toNext === 0 ? '🎂 יום הולדת שמח! היום!' : `עוד ${a.toNext} ימים ליום ההולדת ה־${a.nextAge}`}</p>
    </div>}
    <div className="mt-8 flex flex-wrap justify-center gap-2 text-sm">
      <Link to="/tools/hebrew-birthday" className="rounded-full border-2 border-[var(--border)] bg-white px-3 py-1 font-bold">📅 יום הולדת עברי</Link>
      <Link to="/tools/birthday-famous" className="rounded-full border-2 border-[var(--border)] bg-white px-3 py-1 font-bold">⭐ מי נולד ביום שלי?</Link>
      <Link to="/days-until" className="rounded-full border-2 border-[var(--border)] bg-white px-3 py-1 font-bold">⏳ כמה ימים עד…</Link>
    </div>
    <div className="mt-10"><SeoBody paragraphs={['מחשבון הגיל סופר בדיוק כמה זמן עבר מיום הלידה: בשנים, בחודשים ובימים, וגם את סך כל הימים — נתון שילדים אוהבים לגלות ("אני בן 3,000 ימים!"). הוא מראה גם באיזה יום בשבוע נולדתם ומה התאריך העברי של יום הלידה.']} faq={FAQ} /></div>
  </div>
}
