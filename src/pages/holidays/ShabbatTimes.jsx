import ShabbatActivityLink from '../../components/printables/ShabbatActivityLink'
import MailSignup from '../../components/mail/MailSignup'
import { ShabbatRecipeLinks } from '../../components/recipes/ShabbatRecipeLinks'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import ParashaQuiz from '../../components/parasha/ParashaQuiz'
import ShabbatCalendar from '../../components/printables/ShabbatCalendar'
import NotFound from '../NotFound'
import { SHABBAT_PLACES, shabbatCity } from '../../data/shabbatCities'
import { israelToday, readingForDate } from '../../utils/parashaCalendar'
import { addDays, formatTime, holidayCandles, SHABBAT_NOTICE, shabbatForDate, shabbatSeries } from '../../utils/shabbatTimes'
import { cityDescription, cityFacts, cityFaq, cityParagraphs, durationText } from '../../utils/shabbatCityFacts'
import { SHABBAT_NEARBY } from '../../data/shabbatNearby'

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

function ShabbatNextStrip() {
  const chip = 'rounded-full border-2 border-[var(--border)] bg-[var(--card)] px-4 py-2 font-bold min-h-[44px] inline-flex items-center'
  return <nav className="mt-4 rounded-2xl border border-[var(--border)] p-4 text-center" aria-label="עוד לשבת הזו">
    <h2 className="text-lg font-bold">🕯️ עוד לשבת הזו</h2>
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      <Link to="/parasha" className={chip}>📖 פרשת השבוע לילדים</Link>
      <Link to="/holidays/blessings/shabbat" className={chip}>🕯️ ברכת הדלקת נרות</Link>
      <Link to="/shabbat-activities" className={chip}>🎲 פעילויות לשולחן השבת</Link>
      <Link to="/shabbat-activities/pack" className={chip}>🖨️ חוברת שבת להדפסה</Link>
    </div>
  </nav>
}

function Clock({ value }) {
  return <time dateTime={value.toISOString()} dir="ltr" className="font-bold tabular-nums whitespace-nowrap">{formatTime(value)}</time>
}

const METHOD = 'החישוב משתמש בשקיעה בגובה פני הים, ללא תיקון לגובה השכונה או להסתרת האופק על ידי הרים. הדלקת נרות מעוגלת כלפי מטה; צאת שבת בשיטת 8.5 מעלות מעוגלת כלפי מעלה. המספרים עשויים להיות שונים מלוח שמשתמש בשיטה אחרת.'
function Intro({ facts }) {
  const related = [{ href: '/holidays/blessings/shabbat', label: 'ברכת הדלקת נרות וברכות לשבת' }, { href: '/parasha', label: 'פרשת השבוע לילדים' }]
  return <><ShabbatRecipeLinks /><ShabbatActivityLink />{facts
    ? <><h2 className="text-2xl mb-3">על זמני השבת ב{facts.city.name}</h2><SeoBody paragraphs={[...cityParagraphs(facts), METHOD]} faq={cityFaq(facts)} related={related} /></>
    : <SeoBody paragraphs={[
      'בחרו עיר כדי לראות מתי מדליקים נרות ומתי יוצאת השבת. בעמוד העיר תמצאו גם את שמונה השבתות הבאות, הדלקת נרות לחגים שבטווח ולוח חודשי ושנתי עם תמונה להדפסה למקרר.',
      METHOD,
      'במהלך שבת נשארים זמני אותה שבת על המסך, ובחצות לפי שעון ישראל עוברים לשבוע הבא. בתאריך שבו חג מתחיל במוצאי שבת מופיעה הערה שאיסור המלאכה נמשך. הדלקת נרות בלילה השני של חג מסומנת בנפרד כהדלקה מאש קיימת לאחר צאת הכוכבים.',
    ]} faq={FAQ} related={related} />}</>
}


// ── Every locality + "my location" ─────────────────────────────
// public/data/israel-localities.json: ~1,050 localities (CBS list, coordinates checked against
// GeoNames; see docs/shabbat-times-sources.md). Loaded only on this page.
const OFFSETS = [18, 20, 22, 30, 40]
const clean = text => text.replace(/[׳״'"\s()-]/g, '')
const km = (a, b) => Math.hypot((a.latitude - b.latitude) * 111, (a.longitude - b.longitude) * 94)
let localitiesPromise = null
const loadLocalities = () => (localitiesPromise ||= fetch('/data/israel-localities.json').then(r => r.ok ? r.json() : []).then(list => list.map(p => ({ name: p.n, latitude: p.a, longitude: p.o }))).catch(() => { localitiesPromise = null; return [] }))
// A locality that is one of the 30 cities keeps that city's custom; any other place starts at 20 minutes.
const placeFor = (spot, extra = {}) => {
  const city = SHABBAT_PLACES.find(c => clean(c.name.replace('קריית', 'קרית')) === clean(spot.name.replace('קריית', 'קרית'))) || (extra.gps && SHABBAT_PLACES.find(c => km(c, spot) < 3))
  return { ...spot, offset: city ? city.offset : 20, offsetLabel: city ? `כמנהג ${city.name}` : 'מנהג רווח', city, ...extra }
}

function PlacePanel({ place, today, onClose }) {
  const [offset, setOffset] = useState(place.offset)
  const spot = useMemo(() => ({ ...place, offset }), [place, offset])
  const rows = useMemo(() => shabbatSeries(spot, today, 5), [spot, today]), current = rows[0]
  return <section id="place" className="mt-6 rounded-3xl bg-[var(--postit)] p-5 sm:p-8 text-center" aria-label={`זמני השבת ב${place.name}`}>
    <h2 className="text-2xl">{place.gps ? `📍 ${place.name}` : `כניסת שבת ${place.name}`}</h2>
    <p className="mt-1">שבת {dateLabel(current.saturday)} · {current.reading.name}</p>
    <div className="grid grid-cols-2 gap-3 mt-4"><div className="bg-[var(--card)] rounded-xl p-3"><h3>הדלקת נרות</h3><p className="text-4xl my-2"><Clock value={current.candles} /></p><p className="text-sm">שישי {dateLabel(current.friday)}</p></div><div className="bg-[var(--card)] rounded-xl p-3"><h3>צאת השבת</h3><p className="text-4xl my-2"><Clock value={current.end} /></p><p className="text-sm">שבת {dateLabel(current.saturday)} · 8.5°</p></div></div>
    {current.candleNote && <p className="mt-3 font-bold">{current.candleNote}</p>}{current.endNote && <p className="mt-3 font-bold">{current.endNote}</p>}
    <label className="block mt-4 font-bold">הדלקה לפני השקיעה{' '}
      <select value={offset} onChange={e => setOffset(Number(e.target.value))} className="min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-[var(--card)] px-2">
        {OFFSETS.map(m => <option key={m} value={m}>{m} דקות{m === place.offset ? ` (${place.offsetLabel})` : ''}</option>)}
      </select>
    </label>
    <p className="text-sm mt-2">{place.city ? <>לעמוד המלא: <Link className="underline font-bold" to={cityHref(place.city)}>זמני שבת {place.city.name}</Link> · </> : ''}בחרו את מספר הדקות לפי מנהג המקום.</p>
    <div className="mt-4 text-start"><h3 className="text-xl text-center mb-2">ארבע השבתות הבאות</h3><ShabbatTable rows={rows.slice(1)} /></div>
    <ShabbatCalendar city={spot} />
    <button type="button" className={`${button} mt-4`} onClick={onClose}>סגירה</button>
  </section>
}

function Reading({ reading }) {
  return <p className="mt-2"><Link className="underline font-bold" to="/parasha">{reading.holiday ? 'קריאת השבת לחג' : 'פרשת השבוע'}: {reading.name}</Link> · {reading.hebrewDate}</p>
}

export function ShabbatTimesHub() {
  const today = useToday(), [query, setQuery] = useState('')
  const [params, setParams] = useSearchParams()
  const [localities, setLocalities] = useState([])
  const [gpsPlace, setGpsPlace] = useState(null), [gpsState, setGpsState] = useState('')
  useEffect(() => { let live = true; loadLocalities().then(list => { if (live) setLocalities(list) }); return () => { live = false } }, [])
  const placeName = params.get('place')
  const chosen = useMemo(() => { const spot = placeName && localities.find(p => p.name === placeName); return spot ? placeFor(spot) : null }, [placeName, localities])
  const place = gpsPlace || chosen
  // A chosen locality (/shabbat-times?place=…) is what Google shows for "צאת שבת" near it, so it gets its own
  // title with the place's name and this week's times; a place that has a city page points there.
  const placeWeek = useMemo(() => chosen ? shabbatSeries(chosen, today, 1)[0] : null, [chosen, today])
  const placeSeo = placeWeek && {
    title: `צאת שבת ב${chosen.name} השבוע — כניסת שבת והדלקת נרות`,
    description: `צאת שבת ב${chosen.name} בשבת ${dateLabel(placeWeek.saturday)}: ${formatTime(placeWeek.end)}. הדלקת נרות ביום שישי: ${formatTime(placeWeek.candles)} (${chosen.offset} דקות לפני השקיעה). ארבע השבתות הבאות ולוח להדפסה.`,
    path: chosen.city ? cityHref(chosen.city) : `/shabbat-times?place=${encodeURIComponent(chosen.name)}`,
  }
  const choose = name => { setGpsPlace(null); setParams({ place: name }); setTimeout(() => document.getElementById('place')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50) }
  const closePlace = () => { setGpsPlace(null); setParams({}) }
  const locate = () => {
    if (!navigator.geolocation) { setGpsState('הדפדפן לא תומך באיתור מיקום. חפשו את היישוב לפי שם.'); return }
    setGpsState('מאתרים מיקום…')
    navigator.geolocation.getCurrentPosition(async pos => {
      const spot = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
      if (spot.latitude < 29.3 || spot.latitude > 33.5 || spot.longitude < 34.1 || spot.longitude > 36) { setGpsState('נראה שאתם מחוץ לישראל. הזמנים כאן מחושבים לשעון ישראל — חפשו יישוב בארץ לפי שם.'); return }
      const list = await loadLocalities(), near = list.reduce((best, p) => !best || km(p, spot) < km(best, spot) ? p : best, null)
      setParams({}); setGpsState('')
      setGpsPlace(placeFor({ ...spot, name: near && km(near, spot) < 8 ? `המיקום שלכם (ליד ${near.name})` : 'המיקום שלכם' }, { gps: true }))
      setTimeout(() => document.getElementById('place')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }, () => setGpsState('לא קיבלנו אישור למיקום. אפשר לאשר בהגדרות הדפדפן, או לחפש את היישוב לפי שם.'), { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 })
  }
  const reading = useMemo(() => readingForDate(today), [today])
  const all = useMemo(() => SHABBAT_PLACES.map(city => ({ city, times: shabbatForDate(city, today) })), [today])
  const normalized = query.replace(/[׳״'"\s-]/g, '')
  const rows = all.filter(({ city }) => city.name.replace(/[׳״'"\s-]/g, '').includes(normalized) || city.slug.includes(query.trim().toLowerCase()))
  const cityNames = useMemo(() => new Set(SHABBAT_PLACES.map(c => clean(c.name.replace('קריית', 'קרית')))), [])
  const more = normalized.length < 2 ? [] : localities.filter(p => clean(p.name).includes(clean(query)) && !cityNames.has(clean(p.name.replace('קריית', 'קרית')))).sort((a, b) => clean(a.name).indexOf(clean(query)) - clean(b.name).indexOf(clean(query)) || a.name.length - b.name.length).slice(0, 24)
  return <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">
    {placeSeo ? <SEO {...placeSeo} /> : <SEO title="כניסת שבת וצאת השבת — זמני שבת לפי עיר" description="זמני כניסת שבת וצאת השבת ב־170 ערים ולכל יישוב בישראל — מושבים, קיבוצים וכפרים — או לפי המיקום שלכם. לוח חודשי ושנתי עם תמונה להדפסה." path="/shabbat-times" structuredData={faqSchema(FAQ)} />}
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'שבתות וחגים', href: '/holidays' }, { label: 'זמני שבת' }]} />
    <h1 className="text-center text-3xl sm:text-4xl mb-5">כניסת שבת וצאת השבת לפי עיר</h1>
    <section className="rounded-3xl bg-[var(--postit)] p-5 text-center" aria-label="השבת המוצגת">
      <h2 className="text-2xl">שבת {dateLabel(reading.date)}</h2>
      <p className="mt-2">הדלקת נרות ביום שישי {dateLabel(addDays(reading.date, -1))} · כל השעות לפי שעון ישראל</p>
      <Reading reading={reading} />
      {all[0].times.endNote && <p className="font-bold mt-3">{all[0].times.endNote}</p>}
      {all[0].times.candleNote && <p className="font-bold mt-3">{all[0].times.candleNote}</p>}
    </section>
    <Notice />
    <ShabbatNextStrip />
    <div className="my-4 text-center"><a href="#calendar" className={button}>לוח חודשי ושנתי עם תמונה ↓</a> <a href="#weekly-quiz" className={button}>חידון הפרשה להדפסה ↓</a></div>
    <div className="mt-6 text-center"><button type="button" className={`${button} bg-[var(--postit)]`} onClick={locate}>📍 זמני שבת לפי המיקום שלי</button>{gpsState && <p className="mt-2 text-sm" aria-live="polite">{gpsState}</p>}<p className="text-xs mt-1">המיקום משמש רק לחישוב בדפדפן ואינו נשלח לשום מקום.</p></div>
    {place && <PlacePanel key={`${place.name}-${place.latitude}`} place={place} today={today} onClose={closePlace} />}
    <label className="block mt-6 font-bold">חיפוש עיר, מושב, קיבוץ או כפר<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="למשל ירושלים, נהלל או עין גדי" className="block mt-2 w-full min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-[var(--card)] p-3" /></label>
    <p aria-live="polite" className="text-sm mt-2">{rows.length} ערים ומועצות{more.length ? ` · ${more.length}${more.length === 24 ? '+' : ''} יישובים נוספים` : ''}</p>
    {more.length > 0 && <div className="mt-3"><h2 className="text-lg font-bold">יישובים נוספים</h2><div className="flex flex-wrap gap-2 mt-2">{more.map(p => <button key={p.name} type="button" className={button} onClick={() => choose(p.name)}>{p.name}</button>)}</div></div>}
    <table className="w-full mt-4 text-right text-sm sm:text-base"><caption className="sr-only">זמני השבת בתאריך {dateLabel(reading.date)}</caption><thead><tr className="border-b-2 border-[var(--border)]"><th scope="col" className="py-3">עיר ומנהג</th><th scope="col" className="px-2">הדלקת נרות</th><th scope="col">צאת שבת</th></tr></thead><tbody>{rows.map(({ city, times }) => <tr key={city.slug} className="border-b border-[var(--border)]"><th scope="row" className="py-3 font-normal"><Link className="underline font-bold inline-flex min-h-[44px] items-center" to={cityHref(city)}>{city.name}</Link><span className="block text-xs">{city.offset} דק׳ לפני השקיעה</span></th><td className="px-2"><Clock value={times.candles} /></td><td><Clock value={times.end} /></td></tr>)}</tbody></table>
    {!rows.length && !more.length && <p className="my-6">לא מצאנו יישוב בשם הזה. נסו לכתוב בלי קיצורים, או השתמשו בכפתור "לפי המיקום שלי".</p>}
    <ShabbatCalendar />
    <div id="weekly-quiz"><ParashaQuiz reading={reading} compact /></div>
    <div className="mt-8"><Intro /></div>
  </div>
}

function ShabbatTable({ rows }) {
  return <table className="w-full text-right text-sm sm:text-base"><thead><tr className="border-b-2 border-[var(--border)]"><th scope="col" className="py-3">שבת / הדלקה בשישי</th><th scope="col" className="px-2">הדלקה</th><th scope="col">צאת שבת</th></tr></thead><tbody>{rows.map(s => <tr key={s.saturday} className="border-b border-[var(--border)]"><th scope="row" className="py-3 font-normal"><span className="font-bold">{dateLabel(s.saturday)}</span><span className="block text-xs">שישי {dateLabel(s.friday)}</span><span className="block text-xs">{s.reading.name}</span>{s.candleNote && <span className="block text-xs max-w-xs">{s.candleNote}</span>}{s.endNote && <span className="block text-xs max-w-xs">{s.endNote}</span>}</th><td className="px-2 align-top pt-3"><Clock value={s.candles} /></td><td className="align-top pt-3"><Clock value={s.end} /></td></tr>)}</tbody></table>
}

function HolidayList({ rows }) {
  return rows.length ? <ul className="space-y-3 mt-3">{rows.map(h => <li key={h.date} className="border-b border-[var(--border)] pb-3"><b>{dateLabel(h.date)} · הדלקה ל{h.holiday}</b><p><Clock value={h.time} /> — {h.instruction}</p></li>)}</ul> : <p className="mt-3">אין הדלקת נרות לחג בטווח הזה.</p>
}

const signed = n => n === 0 ? 'אותה דקה' : `${Math.abs(n)} דק׳ ${n < 0 ? 'מוקדם' : 'מאוחר'}`
// Nearby cities (own pages, with this week's difference) and the smaller localities around this one
// (static list, so it is in the prerendered HTML; each opens on the hub).
function Nearby({ facts }) {
  const { city, neighbours } = facts, around = SHABBAT_NEARBY[city.slug] || []
  return <section className="mt-8"><h2 className="text-2xl">זמני שבת בסביבת {city.name}</h2>
    <table className="w-full mt-3 text-right text-sm sm:text-base"><caption className="text-start text-sm mb-1">הערים הקרובות ל{city.name} — הדלקת הנרות השבת לעומת {city.name}</caption>
      <thead><tr className="border-b-2 border-[var(--border)]"><th scope="col" className="py-2">עיר</th><th scope="col" className="px-2">מרחק וכיוון</th><th scope="col" className="px-2">מנהג</th><th scope="col">הדלקה</th></tr></thead>
      <tbody>{neighbours.map(n => <tr key={n.city.slug} className="border-b border-[var(--border)]"><th scope="row" className="py-2 font-normal"><Link className="underline font-bold inline-flex min-h-[44px] items-center" to={cityHref(n.city)}>{n.city.name}</Link></th><td className="px-2">{n.km} ק״מ, {n.dir}</td><td className="px-2">{n.offset} דק׳</td><td>{signed(n.candles)}</td></tr>)}</tbody>
    </table>
    {around.length > 0 && <><p className="mt-4">יישובים סמוכים בלי עמוד נפרד — מושבים, קיבוצים וכפרים עד 12 ק״מ מ{city.name}:</p><div className="flex flex-wrap gap-2 mt-2">{around.map(([name, d]) => <Link key={name} className={button} to={`/shabbat-times?place=${encodeURIComponent(name)}`}>{name} <span className="text-xs font-normal ms-1">{d} ק״מ</span></Link>)}</div></>}
  </section>
}

// This week against the reference cities, and the coming year's extremes, as a quick table.
function CityNumbers({ facts }) {
  const { city, compare } = facts
  const rows = [
    ['הדלקה מוקדמת ביותר בשנה', `${formatTime(facts.earliest.candles)} · שישי ${dateLabel(facts.earliest.friday)}`],
    ['הדלקה מאוחרת ביותר בשנה', `${formatTime(facts.latest.candles)} · שישי ${dateLabel(facts.latest.friday)}`],
    ['צאת שבת מוקדמת ביותר', `${formatTime(facts.earliestEnd.end)} · ${dateLabel(facts.earliestEnd.saturday)}`],
    ['צאת שבת מאוחרת ביותר', `${formatTime(facts.latestEnd.end)} · ${dateLabel(facts.latestEnd.saturday)}`],
    ['משך השבת הזו', durationText(facts.weekLength)],
    ...compare.map(c => [`השבת לעומת ${c.ref.name} (${c.km} ק״מ)`, `הדלקה: ${signed(c.candles)} · צאת שבת: ${signed(c.end)}`]),
  ]
  return <section className="mt-8"><h2 className="text-2xl">{city.name} במספרים — השנה הקרובה</h2>
    <table className="w-full mt-3 text-right text-sm sm:text-base"><tbody>{rows.map(([k, v]) => <tr key={k} className="border-b border-[var(--border)]"><th scope="row" className="py-2 font-normal">{k}</th><td className="font-bold">{v}</td></tr>)}</tbody></table>
  </section>
}

function CityPage({ city }) {
  const today = useToday()
  const rows = useMemo(() => shabbatSeries(city, today), [city, today]), current = rows[0]
  const holidays = useMemo(() => holidayCandles(city, today, rows.at(-1).saturday), [city, today, rows])
  const facts = useMemo(() => cityFacts(city, today), [city, today])
  return <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">
    <SEO title={`כניסת שבת ${city.name} וצאת השבת — זמנים ולוח להדפסה`} description={cityDescription(facts)} path={cityHref(city)} structuredData={faqSchema(cityFaq(facts))} />
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
    <ShabbatNextStrip />
    <MailSignup city={city} allowShabbat />
    <section className="mt-8"><h2 className="text-2xl">שמונה השבתות הבאות ב{city.name}</h2><ShabbatTable rows={rows.slice(1)} /></section>
    <section className="mt-8"><h2 className="text-2xl">הדלקת נרות לחגים בטווח הקרוב</h2><p className="text-sm mt-2">מ־{dateLabel(today)} עד {dateLabel(rows.at(-1).saturday)} · לפי לוח ארץ ישראל</p><HolidayList rows={holidays} /></section>
    <CityNumbers facts={facts} />
    <ShabbatCalendar city={city} />
    <ParashaQuiz reading={current.reading} compact />
    <Nearby facts={facts} />
    <div className="mt-8"><Intro facts={facts} /></div><Link className={`${button} mt-5`} to="/shabbat-times">לזמני שבת בכל הערים</Link>
  </div>
}

export function ShabbatCityPage() {
  const { city: slug } = useParams(), city = shabbatCity(slug)
  return city ? <CityPage key={city.slug} city={city} /> : <NotFound />
}
