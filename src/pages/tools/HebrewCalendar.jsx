import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { HDate, HebrewCalendar as HC } from '@hebcal/core'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { gematria, HEB_MONTHS, HEB_DAYS } from '../../utils/hebrewCalendar'
import { israelToday } from '../../utils/parashaCalendar'

// Hebrew–Gregorian calendar: a month grid with the Hebrew date, Israeli holidays and the weekly
// portion on every day, today's Hebrew date, a two-way date converter and the year's holiday list.
// Everything is computed with @hebcal/core (Israel schedule) — no data file to maintain.
export const CAL_YEARS = [2025, 2026, 2027, 2028, 2029, 2030]
const noNikud = s => s.replace(/[֑-ׇ]/g, m => (m === '־' ? m : ''))
const he = e => noNikud(e.render('he')).replace(/\b(5\d{3})\b/, (_, y) => gematria(Number(y)))
// Days the grid leaves out: school observances and minor commemorations nobody plans around.
const SKIP = new Set(['Leil Selichot', 'Yom HaAliyah School Observance', 'Chag HaBanot', 'Rosh Hashana LaBehemot', 'Purim Katan', 'Shushan Purim Katan', 'Family Day', 'Hebrew Language Day', 'Herzl Day', 'Jabotinsky Day', 'Ben-Gurion Day'])
// The year's list ("חגי ישראל"): first day of each holiday, with a friendlier label where needed.
const MAIN = [
  [/^Rosh Hashana \d/, 'ראש השנה'], ['Yom Kippur', 'יום כיפור'], ['Sukkot I', 'סוכות'], ['Shmini Atzeret', 'שמחת תורה (שמיני עצרת)'],
  ['Chanukah: 1 Candle', 'חנוכה — הדלקת נר ראשון'], ["Asara B'Tevet", 'צום עשרה בטבת'], ['Tu BiShvat', 'ט״ו בשבט'],
  ["Ta'anit Esther", 'תענית אסתר'], ['Purim', 'פורים'], ['Shushan Purim', 'שושן פורים (ירושלים)'], ['Erev Pesach', 'ערב פסח — ליל הסדר'],
  ['Pesach I', 'פסח'], ['Pesach VII', 'שביעי של פסח'], ['Yom HaShoah', 'יום השואה'], ['Yom HaZikaron', 'יום הזיכרון'],
  ["Yom HaAtzma'ut", 'יום העצמאות'], ['Lag BaOmer', 'ל״ג בעומר'], ['Yom Yerushalayim', 'יום ירושלים'], ['Shavuot', 'שבועות'],
  ['Tzom Tammuz', 'צום י״ז בתמוז'], ["Tish'a B'Av", 'תשעה באב'], ["Tu B'Av", 'ט״ו באב'],
]
// Holidays that begin at sunset the evening before (shown as "נכנס ב…").
const EVE = new Set(['ראש השנה', 'יום כיפור', 'סוכות', 'שמחת תורה (שמיני עצרת)', 'פסח', 'שביעי של פסח', 'שבועות', 'תשעה באב', 'פורים', 'יום השואה', 'יום הזיכרון', 'יום העצמאות', 'ל״ג בעומר', 'יום ירושלים', 'ט״ו בשבט', 'ט״ו באב'])
const HEB_MONTH_NAMES = { 7: 'תשרי', 8: 'חשון', 9: 'כסלו', 10: 'טבת', 11: 'שבט', 12: 'אדר', 13: 'אדר ב׳', 1: 'ניסן', 2: 'אייר', 3: 'סיון', 4: 'תמוז', 5: 'אב', 6: 'אלול' }
const monthsOf = y => (HDate.isLeapYear(y) ? [7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4, 5, 6] : [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6])
const monthName = (m, y) => (m === 12 && HDate.isLeapYear(y) ? 'אדר א׳' : HEB_MONTH_NAMES[m])
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const gregLabel = d => `${HEB_DAYS[d.getDay()] === 'שבת' ? 'שבת' : 'יום ' + HEB_DAYS[d.getDay()]}, ${d.getDate()} ב${HEB_MONTHS[d.getMonth()]} ${d.getFullYear()}`
const hebLabel = d => new HDate(d).renderGematriya(true)

function eventsBetween(start, end, sedrot) {
  const map = new Map()
  for (const e of HC.calendar({ start, end, il: true, sedrot })) {
    if (SKIP.has(e.getDesc())) continue
    const k = iso(e.getDate().greg())
    if (!map.has(k)) map.set(k, [])
    map.get(k).push({ text: he(e), parasha: e.getDesc().startsWith('Parashat') })
  }
  return map
}
export function yearHolidays(year) {
  const out = []
  for (const e of HC.calendar({ start: new Date(year, 0, 1), end: new Date(year, 11, 31), il: true })) {
    const hit = MAIN.find(([k]) => (k instanceof RegExp ? k.test(e.getDesc()) : k === e.getDesc()))
    if (hit) out.push({ name: hit[1], date: e.getDate().greg(), eve: EVE.has(hit[1]) })
  }
  return out
}

export default function HebrewCalendar() {
  const { year: yParam } = useParams()
  const [params, setParams] = useSearchParams()
  const todayIso = israelToday()
  const [ty, tm, td] = todayIso.split('-').map(Number)
  const today = new Date(ty, tm - 1, td)
  const pageYear = CAL_YEARS.includes(Number(yParam)) ? Number(yParam) : null
  const y = Number(params.get('y')) || pageYear || ty
  const m = Math.min(12, Math.max(1, Number(params.get('m')) || (pageYear && pageYear !== ty ? 1 : tm)))
  const go = (yy, mm) => { const d = new Date(yy, mm - 1, 1); setParams({ y: String(d.getFullYear()), m: String(d.getMonth() + 1) }, { replace: true }) }

  const first = new Date(y, m - 1, 1), days = new Date(y, m, 0).getDate()
  const events = useMemo(() => eventsBetween(new Date(y, m - 1, 1), new Date(y, m - 1, days), true), [y, m, days])
  const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => new Date(y, m - 1, i + 1))]
  const listYear = pageYear || y
  const holidays = useMemo(() => yearHolidays(listYear), [listYear])
  const hFirst = new HDate(first), hLast = new HDate(new Date(y, m - 1, days))
  const hebSpan = hFirst.getMonth() === hLast.getMonth() ? `${monthName(hFirst.getMonth(), hFirst.getFullYear())} ${gematria(hFirst.getFullYear())}` : `${monthName(hFirst.getMonth(), hFirst.getFullYear())}–${monthName(hLast.getMonth(), hLast.getFullYear())} ${gematria(hLast.getFullYear())}`
  const todayEvents = eventsBetween(today, today, false).get(todayIso) || []

  const title = pageYear ? `לוח שנה עברי לועזי ${pageYear} — חגי ישראל ${pageYear} ותאריכים עבריים` : 'לוח שנה עברי לועזי — התאריך העברי היום, חגים וממיר תאריכים'
  const desc = pageYear ? `לוח שנה עברי-לועזי ${pageYear} עם כל חגי ישראל, ראשי חודשים, צומות ופרשות השבוע. מתי פסח, ראש השנה וחנוכה ב-${pageYear}, ממיר תאריך עברי ולוח להדפסה.` : 'לוח שנה עברי לועזי אונליין: מה התאריך העברי היום, כל חגי ישראל, ראשי חודשים ופרשת השבוע בכל יום, ממיר תאריך לועזי לעברי ועברי ללועזי, ולוח להדפסה.'
  return <div className="mx-auto max-w-5xl px-3 py-8 sm:px-4" dir="rtl">
    <SEO title={title} description={desc} path={pageYear ? `/hebrew-calendar/${pageYear}` : '/hebrew-calendar'} structuredData={faqSchema(FAQ)} />
    <div className="print:hidden"><Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לוח שנה עברי', href: pageYear ? '/hebrew-calendar' : undefined }, ...(pageYear ? [{ label: String(pageYear) }] : [])]} /></div>
    <h1 className="text-center text-3xl font-black sm:text-5xl">📅 לוח שנה עברי לועזי{pageYear ? ` ${pageYear}` : ''}</h1>
    <div className="mx-auto mt-4 max-w-xl rounded-2xl border-[3px] border-amber-400 bg-amber-50 p-4 text-center print:hidden">
      <div className="text-sm font-bold text-amber-800">היום</div>
      <div className="text-3xl font-black">{hebLabel(today)}</div>
      <div className="text-lg">{gregLabel(today)}</div>
      {todayEvents.length > 0 && <div className="mt-1 font-bold text-violet-800">{todayEvents.map(e => e.text).join(' · ')}</div>}
      <div className="mt-1 text-xs text-slate-500">התאריך העברי מתחלף בשקיעה — מהערב זה כבר היום העברי הבא.</div>
    </div>

    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between gap-2 print:hidden">
        <button type="button" onClick={() => go(y, m - 1)} className="min-h-11 rounded-xl border-2 border-slate-300 bg-white px-3 font-bold">→ הקודם</button>
        <div className="flex flex-wrap items-center justify-center gap-1">
          <select value={m} onChange={e => go(y, Number(e.target.value))} aria-label="חודש" className="min-h-11 rounded-xl border-2 border-slate-300 bg-white px-2 font-bold">{HEB_MONTHS.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}</select>
          <select value={y} onChange={e => go(Number(e.target.value), m)} aria-label="שנה" className="min-h-11 rounded-xl border-2 border-slate-300 bg-white px-2 font-bold">{Array.from({ length: 21 }, (_, i) => ty - 10 + i).map(v => <option key={v} value={v}>{v}</option>)}</select>
          <button type="button" onClick={() => go(ty, tm)} className="min-h-11 rounded-xl bg-amber-400 px-3 font-bold">היום</button>
        </div>
        <button type="button" onClick={() => go(y, m + 1)} className="min-h-11 rounded-xl border-2 border-slate-300 bg-white px-3 font-bold">הבא ←</button>
      </div>
      <h2 className="text-center text-2xl font-black">{HEB_MONTHS[m - 1]} {y} <span className="text-violet-700">· {hebSpan}</span></h2>
      <div className="mt-2 grid grid-cols-7 overflow-hidden rounded-2xl border-2 border-slate-300 bg-white text-center">
        {HEB_DAYS.map(d => <div key={d} className="border-b-2 border-slate-300 bg-slate-100 py-1 text-xs font-black sm:text-sm">{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} className="min-h-20 border-b border-l border-slate-200 bg-slate-50 sm:min-h-28" />
          const k = iso(d), h = new HDate(d), ev = events.get(k) || []
          const isToday = k === todayIso, holiday = ev.some(e => !e.parasha)
          return <div key={k} className={`min-h-20 border-b border-l border-slate-200 p-0.5 text-right sm:min-h-28 sm:p-1 ${isToday ? 'bg-amber-100 ring-2 ring-inset ring-amber-500' : holiday ? 'bg-violet-50' : d.getDay() === 6 ? 'bg-sky-50' : ''}`}>
            <div className="flex items-baseline justify-between gap-1"><span className="text-lg font-black sm:text-2xl">{d.getDate()}</span><span className="text-[11px] font-bold text-violet-800 sm:text-sm">{gematria(h.getDate())}{(h.getDate() === 1 || d.getDate() === 1) && <span className="hidden sm:inline"> {monthName(h.getMonth(), h.getFullYear())}</span>}</span></div>
            {ev.map((e, j) => <div key={j} className={`text-[10px] leading-tight sm:text-xs ${e.parasha ? 'text-sky-800' : 'font-bold text-violet-900'}`}>{e.text}</div>)}
          </div>
        })}
      </div>
      <div className="mt-2 flex justify-center print:hidden"><button type="button" onClick={() => window.print()} className="min-h-11 rounded-xl border-2 border-slate-300 bg-white px-5 font-bold">🖨️ הדפסת החודש</button></div>
    </section>

    <Converter />

    <section className="mt-10 print:hidden">
      <h2 className="mb-2 text-2xl font-black">חגי ישראל {listYear}</h2>
      <div className="overflow-x-auto"><table className="w-full text-right">
        <thead><tr className="border-b-2"><th className="p-2">החג</th><th className="p-2">תאריך לועזי</th><th className="p-2">תאריך עברי</th></tr></thead>
        <tbody>{holidays.map((h, i) => { const eve = new Date(h.date.getFullYear(), h.date.getMonth(), h.date.getDate() - 1); return <tr key={i} className="border-b align-top"><td className="p-2 font-bold">{h.name}</td><td className="p-2">{gregLabel(h.date)}{h.eve && <div className="text-sm text-slate-500">נכנס בערב {gregLabel(eve).replace(/ \d{4}$/, '')}</div>}</td><td className="p-2">{hebLabel(h.date)}</td></tr> })}</tbody>
      </table></div>
      <p className="mt-3 flex flex-wrap gap-2">{CAL_YEARS.map(yy => <Link key={yy} to={`/hebrew-calendar/${yy}`} className={`rounded-lg border-2 px-3 py-1 font-bold ${yy === listYear ? 'border-violet-600 bg-violet-100' : 'border-slate-300 bg-white'}`}>{yy}</Link>)}</p>
    </section>

    <div className="mt-10 print:hidden"><SeoBody paragraphs={[
      'לוח השנה העברי הוא לוח ירחי-שמשי: החודשים נקבעים לפי הירח (29 או 30 ימים), ופעם בכמה שנים מוסיפים חודש — אדר א׳ — כדי שהחגים יישארו בעונה שלהם. לכן פסח, ראש השנה וחנוכה נופלים בכל שנה בתאריך לועזי אחר. כאן רואים את שני הלוחות יחד: בכל יום את התאריך הלועזי, את התאריך העברי, את החגים, ראשי החודשים והצומות, ובשבת — את פרשת השבוע.',
      'החגים מחושבים לפי המנהג בארץ ישראל: יום טוב אחד בפסח, בסוכות ובשבועות, ושמחת תורה ביום שמיני עצרת. ימי הזיכרון והעצמאות מוזזים כמו בחוק כשהם נופלים סמוך לשבת. התאריך העברי מתחלף בשקיעה, ולכן חג ״נכנס״ בערב שלפני התאריך שבלוח.',
    ]} faq={FAQ} related={[{ label: 'יום הולדת עברי', href: '/tools/hebrew-birthday' }, { label: 'זמני כניסת שבת', href: '/shabbat-times' }, { label: 'פרשת השבוע', href: '/parasha' }, { label: 'חופשות בית ספר', href: '/school-holidays' }, { label: 'לוח שנה להדפסה תשפ״ז', href: '/printables/calendar-5787' }]} /></div>
  </div>
}

function Converter() {
  const [g, setG] = useState(israelToday())
  const now = new HDate(new Date())
  const [hy, setHy] = useState(now.getFullYear())
  const [hm, setHm] = useState(now.getMonth())
  const [hd, setHd] = useState(now.getDate())
  const gd = /^\d{4}-\d{2}-\d{2}$/.test(g) ? new Date(...g.split('-').map((v, i) => Number(v) - (i === 1 ? 1 : 0))) : null
  const months = monthsOf(hy)
  const month = months.includes(hm) ? hm : (hm === 13 ? 12 : months[0])
  const day = Math.min(hd, HDate.daysInMonth(month, hy))
  let back = null
  try { back = new HDate(day, month, hy).greg() } catch { back = null }
  return <section className="mt-10 grid gap-4 sm:grid-cols-2 print:hidden">
    <div className="rounded-2xl border-2 border-slate-300 bg-white p-4">
      <h2 className="mb-2 text-xl font-black">ממיר תאריך לועזי לעברי</h2>
      <input type="date" value={g} onChange={e => setG(e.target.value)} aria-label="תאריך לועזי" className="min-h-11 w-full rounded-xl border-2 border-slate-300 px-3 text-lg" />
      {gd && !Number.isNaN(gd.getTime()) && <p className="mt-3 text-2xl font-black text-violet-800">{hebLabel(gd)}</p>}
      <p className="text-sm text-slate-500">אם נולדתם או שהאירוע היה אחרי השקיעה — התאריך העברי הוא של היום הבא.</p>
    </div>
    <div className="rounded-2xl border-2 border-slate-300 bg-white p-4">
      <h2 className="mb-2 text-xl font-black">ממיר תאריך עברי ללועזי</h2>
      <div className="flex gap-1">
        <select value={day} onChange={e => setHd(Number(e.target.value))} aria-label="יום עברי" className="min-h-11 rounded-xl border-2 border-slate-300 bg-white px-2">{Array.from({ length: HDate.daysInMonth(month, hy) }, (_, i) => <option key={i} value={i + 1}>{gematria(i + 1)}</option>)}</select>
        <select value={month} onChange={e => setHm(Number(e.target.value))} aria-label="חודש עברי" className="min-h-11 flex-1 rounded-xl border-2 border-slate-300 bg-white px-2">{months.map(mm => <option key={mm} value={mm}>{monthName(mm, hy)}</option>)}</select>
        <select value={hy} onChange={e => setHy(Number(e.target.value))} aria-label="שנה עברית" className="min-h-11 rounded-xl border-2 border-slate-300 bg-white px-2">{Array.from({ length: 141 }, (_, i) => 5700 + i).map(v => <option key={v} value={v}>{gematria(v)}</option>)}</select>
      </div>
      {back && <p className="mt-3 text-2xl font-black text-violet-800">{gregLabel(back)}</p>}
    </div>
  </section>
}

const FAQ = [
  { q: 'מה התאריך העברי היום?', a: 'התאריך העברי של היום מופיע בראש העמוד, יחד עם החג או המועד אם יש כזה. שימו לב שהתאריך העברי מתחלף בשקיעה ולא בחצות.' },
  { q: 'איך ממירים תאריך לועזי לתאריך עברי?', a: 'בוחרים תאריך בממיר ״לועזי לעברי״ והתאריך העברי מופיע מיד. לאירוע שקרה אחרי השקיעה (למשל לידה בערב), התאריך העברי הוא של היום שאחרי.' },
  { q: 'למה החגים נופלים כל שנה בתאריך לועזי אחר?', a: 'כי הלוח העברי הולך לפי הירח, ושנה עברית רגילה קצרה בכ־11 ימים משנה לועזית. כדי לאזן, בשבע מתוך כל 19 שנים מוסיפים חודש — אדר א׳ — ולכן החגים ״קופצים״ בין התאריכים אבל נשארים באותה עונה.' },
  { q: 'הלוח מתאים לישראל או לחוץ לארץ?', a: 'לישראל: יום טוב אחד בחגים, שמחת תורה בשמיני עצרת, וימי הזיכרון והעצמאות כפי שהם נקבעים בארץ.' },
  { q: 'אפשר להדפיס את הלוח?', a: 'כן — בוחרים חודש ולוחצים ״הדפסת החודש״. ללוח שנת לימודים שלם להדפסה יש באתר לוח שנה תשפ״ז להדפסה.' },
]
