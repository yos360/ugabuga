import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../NotFound'
import { SHABBAT_CITIES, shabbatCity } from '../../data/shabbatCities'
import { israelToday, readingForDate } from '../../utils/parashaCalendar'
import { addDays, formatTime, holidayCandles, monthlySheet, SHABBAT_NOTICE, shabbatForDate, shabbatSeries } from '../../utils/shabbatTimes'

const dateLabel = iso => iso.split('-').reverse().join('.')
const cityHref = city => `/shabbat-times/${city.slug}`
const button = 'inline-flex items-center justify-center min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-[var(--card)] px-4 py-2 font-bold'
const FAQ = [
  { q: 'למה שעת כניסת השבת שונה בין ערים?', a: 'השקיעה משתנה לפי המיקום הגאוגרפי, וגם מנהג ההקדמה משתנה: ירושלים 40 דקות, חיפה ופתח תקווה 30 דקות. לכל עיר מוצג מספר הדקות שבו השתמשנו.' },
  { q: 'איך מחשבים כאן את צאת השבת?', a: 'כשהשמש נמצאת 8.5 מעלות מתחת לאופק. הזמן מעוגל כלפי מעלה לדקה שלמה. זה אינו זמן רבנו תם, ויש קהילות הנוהגות אחרת.' },
  { q: 'האם הזמנים כוללים שעון קיץ?', a: 'כן. כל הזמנים מוצגים לפי שעון ישראל, Asia/Jerusalem, כולל המעבר בין שעון חורף לשעון קיץ. התאריך הנוכחי נקבע לפי ישראל גם כשהמכשיר נמצא בחו״ל.' },
]

function useToday() {
  const [today, setToday] = useState(israelToday)
  useEffect(() => {
    const update = () => setToday(israelToday())
    const timer = setInterval(update, 30000)
    window.addEventListener('focus', update)
    window.addEventListener('pageshow', update)
    document.addEventListener('visibilitychange', update)
    return () => { clearInterval(timer); window.removeEventListener('focus', update); window.removeEventListener('pageshow', update); document.removeEventListener('visibilitychange', update) }
  }, [])
  return today
}

function Notice() {
  return <p className="mt-4 rounded-xl border border-[var(--border)] p-3 text-sm">{SHABBAT_NOTICE}</p>
}

function Clock({ value }) {
  return <time dateTime={value.toISOString()} dir="ltr" className="font-bold tabular-nums whitespace-nowrap">{formatTime(value)}</time>
}

function Intro({ city }) {
  return <SeoBody paragraphs={[
    city ? `זמני השבת ב${city.name} מחושבים לפי נקודת היישוב וכניסת שבת ${city.offset} דקות לפני השקיעה. המנהג המוצג הוא ${city.offsetLabel}; בחירת עיר אחרת עשויה לשנות את הזמנים גם אם היא קרובה.` : 'בחרו עיר כדי לראות מתי מדליקים נרות ומתי יוצאת השבת. בעמוד העיר תמצאו גם את שמונה השבתות הבאות, הדלקת נרות לחגים שבטווח ולוח חודשי להדפסה למקרר.',
    'החישוב משתמש בשקיעה בגובה פני הים, ללא תיקון לגובה השכונה או להסתרת האופק על ידי הרים. הדלקת נרות מעוגלת כלפי מטה; צאת שבת בשיטת 8.5 מעלות מעוגלת כלפי מעלה. המספרים עשויים להיות שונים מלוח שמשתמש בשיטה אחרת.',
    'במהלך שבת נשארים זמני אותה שבת על המסך, ובחצות לפי שעון ישראל עוברים לשבוע הבא. בתאריך שבו חג מתחיל במוצאי שבת מופיעה הערה שאיסור המלאכה נמשך. הדלקת נרות בלילה השני של חג מסומנת בנפרד כהדלקה מאש קיימת לאחר צאת הכוכבים.',
  ]} faq={FAQ} related={[{ href: '/holidays/blessings/shabbat', label: 'ברכת הדלקת נרות וברכות לשבת' }, { href: '/parasha', label: 'פרשת השבוע לילדים' }]} />
}

function Reading({ reading }) {
  return <p className="mt-2"><Link className="underline font-bold" to="/parasha">{reading.holiday ? 'קריאת השבת לחג' : 'פרשת השבוע'}: {reading.name}</Link> · {reading.hebrewDate}</p>
}

export function ShabbatTimesHub() {
  const today = useToday(), [query, setQuery] = useState('')
  const reading = useMemo(() => readingForDate(today), [today])
  const all = useMemo(() => SHABBAT_CITIES.map(city => ({ city, times: shabbatForDate(city, today) })), [today])
  const normalized = query.replace(/[׳״'"\s-]/g, '')
  const rows = all.filter(({ city }) => city.name.replace(/[׳״'"\s-]/g, '').includes(normalized) || city.slug.includes(query.trim().toLowerCase()))
  return <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">
    <SEO title="כניסת שבת וצאת השבת — זמני שבת לפי עיר" description="זמני כניסת שבת וצאת השבת ב־30 ערים, לפי שעון ישראל ומנהג העיר. חיפוש עיר, פרשת השבוע, שמונה שבתות קדימה ולוח חודשי להדפסה." path="/shabbat-times" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חגים', href: '/holidays' }, { label: 'זמני שבת' }]} />
    <h1 className="text-center text-3xl sm:text-4xl mb-5">כניסת שבת וצאת השבת לפי עיר</h1>
    <section className="rounded-3xl bg-[var(--postit)] p-5 text-center" aria-label="השבת המוצגת">
      <h2 className="text-2xl">שבת {dateLabel(reading.date)}</h2>
      <p className="mt-2">הדלקת נרות ביום שישי {dateLabel(addDays(reading.date, -1))} · כל השעות לפי שעון ישראל</p>
      <Reading reading={reading} />
      {all[0].times.endNote && <p className="font-bold mt-3">{all[0].times.endNote}</p>}
      {all[0].times.candleNote && <p className="font-bold mt-3">{all[0].times.candleNote}</p>}
    </section>
    <Notice />
    <label className="block mt-6 font-bold">חיפוש עיר<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="למשל ירושלים או תל אביב" className="block mt-2 w-full min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-[var(--card)] p-3" /></label>
    <p aria-live="polite" className="text-sm mt-2">{rows.length} ערים</p>
    <table className="w-full mt-4 text-right text-sm sm:text-base"><caption className="sr-only">זמני השבת בתאריך {dateLabel(reading.date)}</caption><thead><tr className="border-b-2 border-[var(--border)]"><th scope="col" className="py-3">עיר ומנהג</th><th scope="col" className="px-2">הדלקת נרות</th><th scope="col">צאת שבת</th></tr></thead><tbody>{rows.map(({ city, times }) => <tr key={city.slug} className="border-b border-[var(--border)]"><th scope="row" className="py-3 font-normal"><Link className="underline font-bold inline-flex min-h-[44px] items-center" to={cityHref(city)}>{city.name}</Link><span className="block text-xs">{city.offset} דק׳ לפני השקיעה</span></th><td className="px-2"><Clock value={times.candles} /></td><td><Clock value={times.end} /></td></tr>)}</tbody></table>
    {!rows.length && <p className="my-6">לא נמצאה עיר ברשימה. נסו לכתוב את השם בלי קיצורים.</p>}
    <div className="mt-8"><Intro /></div>
  </div>
}

function ShabbatTable({ rows }) {
  return <table className="w-full text-right text-sm sm:text-base"><thead><tr className="border-b-2 border-[var(--border)]"><th scope="col" className="py-3">שבת / הדלקה בשישי</th><th scope="col" className="px-2">הדלקה</th><th scope="col">צאת שבת</th></tr></thead><tbody>{rows.map(s => <tr key={s.saturday} className="border-b border-[var(--border)]"><th scope="row" className="py-3 font-normal"><span className="font-bold">{dateLabel(s.saturday)}</span><span className="block text-xs">שישי {dateLabel(s.friday)}</span><span className="block text-xs">{s.reading.name}</span>{s.candleNote && <span className="block text-xs max-w-xs">{s.candleNote}</span>}{s.endNote && <span className="block text-xs max-w-xs">{s.endNote}</span>}</th><td className="px-2 align-top pt-3"><Clock value={s.candles} /></td><td className="align-top pt-3"><Clock value={s.end} /></td></tr>)}</tbody></table>
}

function HolidayList({ rows }) {
  return rows.length ? <ul className="space-y-3 mt-3">{rows.map(h => <li key={h.date} className="border-b border-[var(--border)] pb-3"><b>{dateLabel(h.date)} · הדלקה ל{h.holiday}</b><p><Clock value={h.time} /> — {h.instruction}</p></li>)}</ul> : <p className="mt-3">אין הדלקת נרות לחג בטווח הזה.</p>
}

function CityPage({ city }) {
  const today = useToday(), [selectedMonth, setSelectedMonth] = useState(null), [printing, setPrinting] = useState(false)
  const month = selectedMonth ?? today.slice(0, 7)
  const rows = useMemo(() => shabbatSeries(city, today), [city, today]), current = rows[0]
  const holidays = useMemo(() => holidayCandles(city, today, rows.at(-1).saturday), [city, today, rows])
  const sheet = useMemo(() => monthlySheet(city, month), [city, month])
  const monthLabel = sheet ? new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${sheet.start}T12:00:00Z`)) : ''
  return <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">
    <SEO title={`כניסת שבת ${city.name} וצאת השבת — זמנים ולוח להדפסה`} description={`זמני שבת ב${city.name}: הדלקת נרות ${city.offset} דקות לפני השקיעה, צאת שבת בשיטת 8.5°, פרשת השבוע, שמונה שבתות קדימה וחגים. לוח חודשי להדפסה.`} path={cityHref(city)} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'זמני שבת', href: '/shabbat-times' }, { label: city.name }]} />
    <h1 className="text-center text-3xl sm:text-4xl mb-5">כניסת שבת {city.name} וצאת השבת</h1>
    <section className="rounded-3xl bg-[var(--postit)] p-5 sm:p-8 text-center" aria-label="זמני השבת בעיר">
      <h2 className="text-2xl">שבת {dateLabel(current.saturday)}</h2><Reading reading={current.reading} />
      <div className="grid grid-cols-2 gap-3 mt-5"><div className="bg-[var(--card)] rounded-xl p-3"><h3>הדלקת נרות</h3><p className="text-4xl my-2"><Clock value={current.candles} /></p><p className="text-sm">שישי {dateLabel(current.friday)}</p></div><div className="bg-[var(--card)] rounded-xl p-3"><h3>צאת השבת</h3><p className="text-4xl my-2"><Clock value={current.end} /></p><p className="text-sm">שבת {dateLabel(current.saturday)} · 8.5°</p></div></div>
      <p className="mt-4">{city.offset} דקות לפני השקיעה · {city.offsetLabel} · שעון ישראל</p>
      {current.candleNote && <p className="mt-3 font-bold">{current.candleNote}</p>}{current.endNote && <p className="mt-3 font-bold">{current.endNote}</p>}
      <Link to="/holidays/blessings/shabbat" className={`${button} mt-4`}>לברכת הדלקת נרות</Link>
    </section>
    <Notice />
    <section className="mt-8"><h2 className="text-2xl">שמונה השבתות הבאות ב{city.name}</h2><ShabbatTable rows={rows.slice(1)} /></section>
    <section className="mt-8"><h2 className="text-2xl">הדלקת נרות לחגים בטווח הקרוב</h2><p className="text-sm mt-2">מ־{dateLabel(today)} עד {dateLabel(rows.at(-1).saturday)} · לפי לוח ארץ ישראל</p><HolidayList rows={holidays} /></section>
    <section className="mt-8 rounded-2xl border-2 border-[var(--border)] p-4"><h2 className="text-2xl">לוח חודשי למקרר</h2><p className="my-3">בחרו חודש לועזי לקבלת זמני כל השבתות והדלקת נרות לחגים שבו.</p><div className="flex flex-wrap items-end gap-3"><label className="font-bold">חודש להדפסה<input type="month" min="2000-01" max="2099-12" value={month} onChange={e => setSelectedMonth(e.target.value)} className="block mt-2 min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-[var(--card)] p-2" /></label><button disabled={!sheet} className={`${button} disabled:opacity-50`} onClick={() => setPrinting(true)}>תצוגה והדפסת הלוח</button></div>{!sheet && <p className="mt-3">בחרו חודש תקין.</p>}{sheet && <p className="text-sm mt-3">{monthLabel}: {sheet.shabbatot.length} שבתות ו־{sheet.holidays.length} מועדי הדלקה לחגים.</p>}</section>
    {printing && sheet && <PrintPreview title={`זמני שבת ${city.name} — ${monthLabel}`} onClose={() => setPrinting(false)}><article className="buga-flow" dir="rtl"><h2 className="text-2xl font-bold">זמני שבת ב{city.name} · {monthLabel}</h2><p>שעון ישראל · {city.offset} דקות לפני השקיעה · צאת שבת 8.5°</p><ShabbatTable rows={sheet.shabbatot} />{sheet.holidays.length > 0 && <><h3 className="text-xl font-bold mt-4">הדלקת נרות לחגים</h3><HolidayList rows={sheet.holidays} /></>}<p className="text-sm mt-4">שקיעה בגובה פני הים. הדלקה מעוגלת מטה, צאת שבת מעלה. תאריך ההדלקה מופיע לצד כל שבת.</p><p className="text-sm">{SHABBAT_NOTICE}</p></article></PrintPreview>}
    <div className="mt-8"><Intro city={city} /></div><Link className={`${button} mt-5`} to="/shabbat-times">לזמני שבת בכל הערים</Link>
  </div>
}

export function ShabbatCityPage() {
  const { city: slug } = useParams(), city = shabbatCity(slug)
  return city ? <CityPage key={city.slug} city={city} /> : <NotFound />
}
