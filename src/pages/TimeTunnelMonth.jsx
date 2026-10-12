import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { faqSchema } from '../components/ui/SeoBody'
import NotFound from './NotFound'
import { gematria, hebrewParts, holidayMap, HEB_DAYS } from '../utils/hebrewCalendar'

// /time-tunnel/month/MM — every special day and one event for each date of the month, with the
// Jewish holidays that fall in it this year. Links all ~30 date pages (/time-tunnel/MM-DD).
const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
const MONTH_LEN = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const DAY_FILES = import.meta.glob('../data/today/*.json')
const pad = n => String(n).padStart(2, '0')
const verified = d => d.src === 'yo-yoo' || d.src === 'wikipedia'

export default function TimeTunnelMonth() {
  const { month } = useParams()
  const m = Number(month)
  const [data, setData] = useState(null)
  useEffect(() => {
    let live = true
    const loader = DAY_FILES[`../data/today/${pad(m)}.json`]
    if (loader) loader().then(mod => { if (live) setData(mod.default || mod) })
    return () => { live = false }
  }, [m])
  if (!(m >= 1 && m <= 12) || month !== pad(m)) return <NotFound />
  const name = MONTHS[m - 1]
  // This year's month, or next year's once it has passed.
  const now = new Date(), year = m - 1 < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear()
  const len = m === 2 ? (new Date(year, 1, 29).getMonth() === 1 ? 29 : 28) : MONTH_LEN[m - 1]
  const holidays = holidayMap(new Date(year, m - 1, 1), new Date(year, m - 1, len))
  const hk = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const days = Array.from({ length: len }, (_, i) => {
    const dt = new Date(year, m - 1, i + 1), key = `${pad(m)}-${pad(i + 1)}`, v = data?.[key] || {}, h = hebrewParts(dt)
    return { key, d: i + 1, dow: HEB_DAYS[dt.getDay()], heb: h ? `${gematria(h.day)} ב${h.month}` : '', holiday: holidays.get(hk(dt)),
      special: (v.days || []).filter(verified).map(x => `${x.emoji || ''} ${x.name}`.trim()), event: (v.events || []).find(verified) }
  })
  const holidayList = [...new Set(days.filter(x => x.holiday).map(x => x.holiday.replace(/ [א-ת]׳?$/, '')))]
  const prev = pad(m === 1 ? 12 : m - 1), next = pad(m === 12 ? 1 : m + 1)
  const faq = [
    { q: `אילו ימים מיוחדים יש ב${name}?`, a: `ב${name} מציינים בין השאר את ${days.flatMap(x => x.special).slice(0, 6).map(s => s.replace(/^\P{L}+/u, '')).join(', ')} — הרשימה המלאה לפי תאריך בעמוד הזה.` },
    holidayList.length > 0 && { q: `אילו חגים חלים ב${name} ${year}?`, a: `${holidayList.join(', ')}. התאריכים המדויקים מסומנים ברשימה.` },
  ].filter(x => x && !/את \s*—/.test(x.a))
  return <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <SEO title={`ימים מיוחדים ב${name} ${year} — כל התאריכים, החגים ומה קרה בכל יום`} description={`לוח ${name} ${year}: לכל תאריך — באיזה יום בשבוע הוא חל, התאריך העברי, החגים, ימים מיוחדים ואירוע היסטורי אחד. ${holidayList.length ? 'החגים החודש: ' + holidayList.join(', ') + '.' : ''}`} path={`/time-tunnel/month/${pad(m)}`} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מנהרת הזמן של בוגה', href: '/time-tunnel' }, { label: name }]} />
    <h1 className="mh-page-title">📅 ימים מיוחדים ב{name} {year}</h1>
    <p className="mb-4 text-center text-lg">כל ימי {name}: באיזה יום בשבוע, התאריך העברי, חגים, ימים מיוחדים ומה קרה בכל תאריך. לחצו על תאריך לכל הפרטים.</p>
    {holidayList.length > 0 && <p className="mx-auto mb-5 max-w-2xl rounded-2xl border-2 border-[#222] bg-[#fff6d6] px-4 py-2 text-center"><b>חגים ב{name} {year}:</b> {holidayList.join(' · ')}</p>}
    <ol className="space-y-2">{days.map(x => <li key={x.key}>
      <Link to={`/time-tunnel/${x.key}`} className="block rounded-2xl border-2 border-[var(--border)] bg-white px-4 py-2 hover:bg-[var(--postit)]">
        <b>{x.d} ב{name}</b> <span className="text-[var(--muted-foreground)]">· יום {x.dow} · {x.heb}</span>
        {x.holiday && <span className="mr-2 rounded-lg bg-amber-100 px-2 font-bold">🕎 {x.holiday}</span>}
        {x.special.length > 0 && <span className="block">{x.special.slice(0, 3).join(' · ')}</span>}
        {x.event && <span className="block text-sm text-[var(--muted-foreground)]">ב־{x.event.year}: {x.event.text}</span>}
      </Link>
    </li>)}</ol>
    <nav className="mt-6 flex justify-between text-lg font-bold" aria-label="חודשים">
      <Link to={`/time-tunnel/month/${prev}`} className="underline">→ {MONTHS[Number(prev) - 1]}</Link>
      <Link to={`/time-tunnel/month/${next}`} className="underline">{MONTHS[Number(next) - 1]} ←</Link>
    </nav>
  </div>
}
