import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { SHABBAT_CITIES } from '../../data/shabbatCities'
import PuddleJump from './PuddleJump'

// /weather — "מזג האוויר היום: צריך מטרייה?" for a chosen city: today's forecast, an umbrella verdict a child
// can read, rain chance by hour and the next 7 days. Forecast data: Open-Meteo (free, no key, CC BY 4.0 —
// attribution shown on the page). Fetched in the browser; nothing about the visitor is sent but the city's
// coordinates. The chosen city is remembered on this device.
const KEY = 'buga-weather-city'
const API = 'https://api.open-meteo.com/v1/forecast'

// WMO weather codes → Hebrew + emoji.
export function describe(code) {
  if (code === 0) return ['בהיר', '☀️']
  if (code <= 2) return ['מעונן חלקית', '🌤️']
  if (code === 3) return ['מעונן', '☁️']
  if (code === 45 || code === 48) return ['ערפל', '🌫️']
  if (code >= 51 && code <= 57) return ['טפטוף', '🌦️']
  if (code >= 61 && code <= 67) return ['גשם', '🌧️']
  if (code >= 71 && code <= 77) return ['שלג', '🌨️']
  if (code >= 80 && code <= 82) return ['ממטרים', '🌦️']
  if (code >= 85 && code <= 86) return ['ממטרי שלג', '🌨️']
  if (code >= 95) return ['סופת רעמים', '⛈️']
  return ['', '🌡️']
}

// The umbrella verdict from the day's highest rain chance (%) and expected rain (mm).
export function umbrella(chance, mm) {
  if (chance >= 60 || mm >= 2) return { level: 'yes', emoji: '☂️', title: 'קחו מטרייה!', line: 'צפוי גשם היום. מטרייה, מעיל ונעליים שלא נרטבות.' }
  if (chance >= 30 || mm >= 0.5) return { level: 'maybe', emoji: '🌂', title: 'כדאי מטרייה קטנה בתיק', line: 'ייתכן גשם קל. לא חייבים — אבל לא יזיק.' }
  return { level: 'no', emoji: '😎', title: 'לא צריך מטרייה', line: 'לא צפוי גשם היום.' }
}

const dayName = iso => new Date(`${iso}T12:00:00`).toLocaleDateString('he-IL', { weekday: 'long' })
const cities = [...SHABBAT_CITIES].sort((a, b) => a.name.localeCompare(b.name, 'he'))
const stored = () => { try { return localStorage.getItem(KEY) } catch { return null } }

const FAQ = [
  { q: 'מאיפה מגיעה התחזית?', a: 'מ־Open-Meteo, שירות פתוח שמחשב תחזיות ממודלים של שירותים מטאורולוגיים לאומיים. זו תחזית ממוחשבת לנקודה של העיר, ולכן היא יכולה להיות שונה מעט ממה שיקרה בשכונה שלכם. בימים של סערה כדאי לבדוק גם את השירות המטאורולוגי הישראלי.' },
  { q: 'איך מחליטים אם צריך מטרייה?', a: 'לפי הסיכוי הגבוה ביותר לגשם במהלך היום ולפי כמות הגשם הצפויה: מ־60% או 2 מ״מ — לקחת מטרייה; מ־30% או חצי מילימטר — כדאי מטרייה קטנה בתיק; פחות מזה — לא צריך.' },
  { q: 'מה זה "סיכוי לגשם"?', a: 'הסיכוי שבשעה מסוימת ירד גשם במקום שבחרתם. 70% פירושו שבימים עם תחזית כזאת יורד גשם ברוב הפעמים — לא שיירד גשם 70% מהזמן.' },
]

export default function Weather() {
  const [slug, setSlug] = useState(() => stored() || 'tel-aviv')
  const city = useMemo(() => cities.find(c => c.slug === slug) || cities.find(c => c.slug === 'tel-aviv') || cities[0], [slug])
  const [data, setData] = useState(null), [error, setError] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(KEY, city.slug) } catch { /* private mode */ }
    const ctrl = new AbortController()
    setData(null); setError(false)
    const qs = new URLSearchParams({ latitude: city.latitude, longitude: city.longitude, timezone: 'Asia/Jerusalem', forecast_days: '7',
      current: 'temperature_2m,weather_code', hourly: 'precipitation_probability', daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum' })
    fetch(`${API}?${qs}`, { signal: ctrl.signal }).then(r => (r.ok ? r.json() : Promise.reject(new Error(r.status)))).then(setData).catch(e => { if (e.name !== 'AbortError') setError(true) })
    return () => ctrl.abort()
  }, [city])

  const today = data?.daily && {
    code: data.daily.weather_code[0], max: Math.round(data.daily.temperature_2m_max[0]), min: Math.round(data.daily.temperature_2m_min[0]),
    chance: data.daily.precipitation_probability_max[0] ?? 0, mm: data.daily.precipitation_sum[0] ?? 0,
  }
  const verdict = today && umbrella(today.chance, today.mm)
  const hours = data?.hourly ? data.hourly.time.map((t, i) => ({ h: Number(t.slice(11, 13)), day: t.slice(0, 10), p: data.hourly.precipitation_probability[i] ?? 0 }))
    .filter(x => x.day === data.daily.time[0] && x.h >= 6 && x.h <= 22 && x.h % 2 === 0) : []

  return <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <SEO title="מזג האוויר היום — צריך מטרייה? תחזית לפי עיר" description="מזג האוויר היום בעיר שלכם: האם צריך מטרייה, סיכוי לגשם לפי שעות, טמפרטורה ותחזית לשבוע הקרוב. פשוט וברור — גם לילדים. בחינם." path="/weather" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'מזג האוויר היום' }]} />
    <h1 className="text-center text-4xl font-black sm:text-5xl"><span aria-hidden="true">☂️ </span>מזג האוויר היום — צריך מטרייה?</h1>
    <label className="mx-auto mt-5 block max-w-xs text-center font-bold">העיר שלי
      <select value={city.slug} onChange={e => setSlug(e.target.value)} className="mt-1 w-full rounded-2xl border-2 border-slate-300 bg-white px-3 py-2 text-lg">
        {cities.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
      </select>
    </label>

    {error && <p className="mx-auto mt-8 max-w-md rounded-2xl bg-amber-50 p-4 text-center font-bold" role="alert">לא הצלחנו לטעון את התחזית. נסו לרענן בעוד רגע.</p>}
    {!error && !data && <p className="mt-10 text-center text-xl" role="status">🔎 בודקים את מזג האוויר ב{city.name}…</p>}

    {today && <>
      <section aria-label="היום" className={`mx-auto mt-8 max-w-xl rounded-3xl border-4 p-6 text-center ${verdict.level === 'yes' ? 'border-sky-500 bg-sky-50' : verdict.level === 'maybe' ? 'border-amber-400 bg-amber-50' : 'border-emerald-400 bg-emerald-50'}`}>
        <p className="text-7xl" aria-hidden="true">{verdict.emoji}</p>
        <h2 className="mt-2 text-3xl font-black">{verdict.title}</h2>
        <p className="mt-1 text-lg">{verdict.line}</p>
        <p className="mt-4 text-2xl font-bold"><span aria-hidden="true">{describe(today.code)[1]} </span>{describe(today.code)[0]} · <bdi>{today.min}°–{today.max}°</bdi></p>
        {data.current && <p className="mt-1 text-slate-600">עכשיו: <bdi>{Math.round(data.current.temperature_2m)}°</bdi> · {describe(data.current.weather_code)[0]}</p>}
        <p className="mt-1 text-slate-600">סיכוי לגשם היום: עד <bdi>{today.chance}%</bdi>{today.mm > 0 && <> · כ־<bdi>{today.mm.toFixed(1)}</bdi> מ״מ</>}</p>
      </section>

      {hours.length > 0 && <section aria-label="סיכוי לגשם לפי שעות" className="mx-auto mt-8 max-w-xl">
        <h2 className="text-center text-xl font-black">סיכוי לגשם היום, לפי שעות</h2>
        <div className="mt-3 flex items-end justify-between gap-1" dir="ltr" style={{ height: 150 }}>
          {hours.map(x => <div key={x.h} className="flex flex-1 flex-col items-center justify-end" style={{ height: '100%' }}>
            <span className="text-xs font-bold">{x.p}%</span>
            <div className={`w-full rounded-t-md ${x.p >= 60 ? 'bg-sky-600' : x.p >= 30 ? 'bg-sky-300' : 'bg-slate-200'}`} style={{ height: `${Math.max(4, x.p)}%` }} />
            <span className="mt-1 text-xs">{String(x.h).padStart(2, '0')}:00</span>
          </div>)}
        </div>
      </section>}

      <section aria-label="השבוע" className="mx-auto mt-8 max-w-3xl">
        <h2 className="text-center text-xl font-black">השבוע ב{city.name}</h2>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">{data.daily.time.map((t, i) => { const [label, icon] = describe(data.daily.weather_code[i]), p = data.daily.precipitation_probability_max[i] ?? 0; return <li key={t} className="rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-center">
          <b>{i === 0 ? 'היום' : i === 1 ? 'מחר' : dayName(t)}</b>
          <div className="text-3xl" aria-hidden="true">{icon}</div>
          <div className="text-sm">{label}</div>
          <div className="font-bold"><bdi>{Math.round(data.daily.temperature_2m_min[i])}°–{Math.round(data.daily.temperature_2m_max[i])}°</bdi></div>
          <div className="text-sm text-slate-600">{p >= 30 ? '☂️ ' : ''}<bdi>{p}%</bdi> גשם</div>
        </li> })}</ul>
      </section>
    </>}

    <PuddleJump />
    <p className="mt-6 text-center text-xs text-slate-500">נתוני מזג האוויר: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline">Open-Meteo.com</a> (CC BY 4.0). תחזית ממוחשבת — לאזהרות רשמיות ראו את השירות המטאורולוגי.</p>
    <div className="mt-10"><SeoBody paragraphs={[
      'בבוקר של חורף השאלה הכי חשובה היא פשוטה: לקחת מטרייה או לא? בעמוד הזה בוחרים עיר פעם אחת, והיא נשמרת. מיד רואים תשובה ברורה — קחו מטרייה, כדאי מטרייה קטנה, או לא צריך — וגם את הטמפרטורה, את הסיכוי לגשם בכל שעתיים ואת התחזית לשבוע.',
      'התשובה מחושבת מהסיכוי הגבוה ביותר לגשם במהלך היום ומכמות הגשם הצפויה במילימטרים. כך גם ילד שמתארגן לבד לבית הספר יכול לדעת אם להכניס מטרייה לתיק.',
    ]} faq={FAQ} related={[{ label: 'מה ללבוש היום? בגדים לפי מזג האוויר באנגלית', href: '/english/weather' }, { label: 'כניסת שבת ויציאתה', href: '/shabbat-times' }, { label: 'דפי חורף וגשם', href: '/printables/winter' }]} /></div>
    <p className="mt-6 text-center"><Link to="/tools" className="font-bold underline">לכל הכלים ←</Link></p>
  </div>
}
