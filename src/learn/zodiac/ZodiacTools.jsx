import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import '../learn.css'
import '../subjects/subjects.css'

// "Which sign am I?" (/learn/zodiac/which-sign): a pure lookup by day and month. The ranges are the common Western
// ones and differ by a day or two between sources, so days near a boundary say so. No predictions, no personality text.
export const SIGNS = [
  { name: 'טלה', symbol: '♈', emoji: '🐏', from: [3, 21], element: 'אש', mode: 'מתחיל', month: 'ניסן', constellation: 'קבוצת הטלה' },
  { name: 'שור', symbol: '♉', emoji: '🐂', from: [4, 20], element: 'אדמה', mode: 'יציב', month: 'אייר', constellation: 'קבוצת השור' },
  { name: 'תאומים', symbol: '♊', emoji: '👬', from: [5, 21], element: 'אוויר', mode: 'משתנה', month: 'סיוון', constellation: 'קבוצת התאומים' },
  { name: 'סרטן', symbol: '♋', emoji: '🦀', from: [6, 21], element: 'מים', mode: 'מתחיל', month: 'תמוז', constellation: 'קבוצת הסרטן' },
  { name: 'אריה', symbol: '♌', emoji: '🦁', from: [7, 23], element: 'אש', mode: 'יציב', month: 'אב', constellation: 'קבוצת הארי' },
  { name: 'בתולה', symbol: '♍', emoji: '🌾', from: [8, 23], element: 'אדמה', mode: 'משתנה', month: 'אלול', constellation: 'קבוצת הבתולה' },
  { name: 'מאזניים', symbol: '♎', emoji: '⚖️', from: [9, 23], element: 'אוויר', mode: 'מתחיל', month: 'תשרי', constellation: 'קבוצת המאזניים' },
  { name: 'עקרב', symbol: '♏', emoji: '🦂', from: [10, 23], element: 'מים', mode: 'יציב', month: 'חשוון', constellation: 'קבוצת העקרב' },
  { name: 'קשת', symbol: '♐', emoji: '🏹', from: [11, 22], element: 'אש', mode: 'משתנה', month: 'כסלו', constellation: 'קבוצת הקשת' },
  { name: 'גדי', symbol: '♑', emoji: '🐐', from: [12, 22], element: 'אדמה', mode: 'מתחיל', month: 'טבת', constellation: 'קבוצת הגדי' },
  { name: 'דלי', symbol: '♒', emoji: '🏺', from: [1, 20], element: 'אוויר', mode: 'יציב', month: 'שבט', constellation: 'קבוצת הדלי' },
  { name: 'דגים', symbol: '♓', emoji: '🐟', from: [2, 19], element: 'מים', mode: 'משתנה', month: 'אדר', constellation: 'קבוצת הדגים' },
]
const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
const DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const ord = ([m, d]) => m * 100 + d
// The sign whose start is the latest one on or before the date (wrapping around the new year).
export function signFor(month, day) {
  const sorted = [...SIGNS].sort((a, b) => ord(a.from) - ord(b.from))
  const date = month * 100 + day
  return [...sorted].reverse().find(s => ord(s.from) <= date) || sorted[sorted.length - 1]
}
// A date within two days of a sign boundary: sources may disagree.
export function nearBoundary(month, day) {
  return SIGNS.some(s => { const [m, d] = s.from; return m === month && Math.abs(day - d) <= 1 || (m === month % 12 + 1 && d <= 1 && day >= DAYS[month - 1]) })
}
const FAQ = [
  { q: 'איך יודעים איזה מזל אני?', a: 'לפי היום והחודש שבהם נולדתם, בלי קשר לשנה. הכלי כאן מחפש את התאריך בטבלת המזלות הנפוצה.' },
  { q: 'למה המזל שלי שונה באתר אחר?', a: 'אם נולדתם בקרבת תאריך שבו מזל מתחלף, מקורות שונים מזיזים את הגבול ביום או ביומיים. זה לא טעות, אלא הסכמה שונה.' },
  { q: 'האם המזל קובע איך אני?', a: 'לא. המדע לא מצא קשר בין מזל הלידה לאופי או לעתיד. המזל כאן הוא עובדה על לוח השנה והמסורת, לא תיאור אישי.' },
]

export function WhichSign() {
  const [month, setMonth] = useState(0)
  const [day, setDay] = useState(0)
  const sign = month && day ? signFor(month, day) : null
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="איזה מזל אני? מחשבון מזל לפי תאריך לידה" description="איזה מזל אני? בוחרים יום וחודש לידה ורואים את המזל, הסמל, היסוד, החודש העברי וקבוצת הכוכבים. הסבר לילדים, בלי ניבוי." path="/learn/zodiac/which-sign" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, { label: 'מזלות לילדים', href: '/learn/zodiac' }, { label: 'איזה מזל אני' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2">♈ איזה מזל אני?</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">בוחרים יום וחודש לידה, ומגלים את המזל במסורת.</p>
    <section className="ln-box flex flex-wrap items-end justify-center gap-4">
      <label className="font-bold">חודש<br /><select className="min-h-11 rounded-xl border-2 px-3" value={month} onChange={e => { setMonth(+e.target.value); setDay(0) }}>
        <option value={0}>בחרו חודש</option>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select></label>
      <label className="font-bold">יום<br /><select className="min-h-11 rounded-xl border-2 px-3" value={day} disabled={!month} onChange={e => setDay(+e.target.value)}>
        <option value={0}>בחרו יום</option>{Array.from({ length: month ? DAYS[month - 1] : 0 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label>
    </section>
    {sign && <section className="ln-box mt-5 text-center" aria-live="polite">
      <div className="text-7xl" aria-hidden="true">{sign.symbol}</div>
      <h2 className="text-3xl font-black mt-2">{sign.emoji} מזל {sign.name}</h2>
      <p className="mt-3">יסוד: <b>{sign.element}</b> · תכונה: <b>{sign.mode}</b> · חודש עברי מקביל במסורת: <b>{sign.month}</b> · בשמיים: <b>{sign.constellation}</b></p>
      {nearBoundary(month, day) && <p className="mt-3 text-sm font-bold text-amber-700">התאריך שלכם קרוב לגבול בין שני מזלות. מקורות שונים מזיזים את הגבול ביום או ביומיים, ולכן ייתכן שתמצאו מזל אחר באתר אחר.</p>}
      <p className="mt-3 text-sm text-slate-600">זו עובדה על לוח השנה והמסורת, לא תיאור של האופי שלכם ולא ניבוי.</p>
      <p className="mt-4"><Link to={`/learn/zodiac/concepts/${slugOf(sign.name)}`} className="ln-btn">קראו על מזל {sign.name}</Link></p>
    </section>}
    <div className="mt-10"><SeoBody paragraphs={['מזל הלידה נקבע לפי היום והחודש, בלי קשר לשנה. הכלי משתמש בתאריכים הנפוצים של שנים־עשר המזלות, ולכן בימים שליד המעבר בין שני מזלות עשויה להיות הבדל קטן בין אתרים.', 'המזלות הם מסורת תרבותית ולא מדע: אין הוכחה שהם משפיעים על אופי או על עתיד. לכן הכלי מציג רק עובדות — סמל, יסוד, חודש עברי וקבוצת כוכבים — ולא תיאורי אישיות.']} faq={FAQ} related={[{ label: 'מה זה גלגל המזלות', href: '/learn/zodiac/what-is-the-zodiac' }, { label: 'כל המושגים בנושא מזלות', href: '/learn/zodiac/concepts' }, { label: 'מזלות לילדים', href: '/learn/zodiac' }]} /></div>
  </div>
}
export const SLUGS = { טלה: 'aries', שור: 'taurus', תאומים: 'gemini', סרטן: 'cancer', אריה: 'leo', בתולה: 'virgo', מאזניים: 'libra', עקרב: 'scorpio', קשת: 'sagittarius', גדי: 'capricorn', דלי: 'aquarius', דגים: 'pisces' }
function slugOf(name) { return SLUGS[name] }
