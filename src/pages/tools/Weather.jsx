import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PuddleJump from './PuddleJump'
import { WEATHER_KEY, WEATHER_CITIES, describe, umbrella, dayName, storedCity, findCity, fetchForecast } from './weatherCore'

// /weather — "מזג האוויר היום: צריך מטרייה?" for a chosen city: today's forecast, an umbrella verdict a child
// can read, feels-like, wind, humidity, UV and sunrise/sunset, rain chance and temperature by hour, and the
// next 7 days. The compact version lives on /winter and links here. Forecast data: Open-Meteo (CC BY 4.0).

const FAQ = [
  { q: 'מאיפה מגיעה התחזית?', a: 'מ־Open-Meteo, שירות פתוח שמחשב תחזיות ממודלים של שירותים מטאורולוגיים לאומיים. זו תחזית ממוחשבת לנקודה של העיר, ולכן היא יכולה להיות שונה מעט ממה שיקרה בשכונה שלכם. בימים של סערה כדאי לבדוק גם את השירות המטאורולוגי הישראלי.' },
  { q: 'איך מחליטים אם צריך מטרייה?', a: 'לפי הסיכוי הגבוה ביותר לגשם במהלך היום ולפי כמות הגשם הצפויה: מ־60% או 2 מ״מ — לקחת מטרייה; מ־30% או חצי מילימטר — כדאי מטרייה קטנה בתיק; פחות מזה — לא צריך.' },
  { q: 'מה זה "סיכוי לגשם"?', a: 'הסיכוי שבשעה מסוימת ירד גשם במקום שבחרתם. 70% פירושו שבימים עם תחזית כזאת יורד גשם ברוב הפעמים — לא שיירד גשם 70% מהזמן.' },
  { q: 'מה זה "מרגיש כמו"?', a: 'הטמפרטורה שהגוף מרגיש, אחרי שמביאים בחשבון רוח ולחות. ביום קר עם רוח חזקה מרגיש קר יותר ממה שהמדחום מראה.' },
  { q: 'מה אומר מדד ה־UV?', a: 'עוצמת קרינת השמש: 0–2 נמוך, 3–5 בינוני, 6–7 גבוה, 8 ומעלה גבוה מאוד. מ־3 ומעלה כדאי כובע וקרם הגנה, גם בחורף.' },
]

const uvLabel = uv => (uv >= 8 ? 'גבוה מאוד' : uv >= 6 ? 'גבוה' : uv >= 3 ? 'בינוני' : 'נמוך')
const hhmm = iso => (iso ? iso.slice(11, 16) : '')

export default function Weather() {
  const [slug, setSlug] = useState(() => storedCity() || 'tel-aviv')
  const city = useMemo(() => findCity(slug), [slug])
  const [data, setData] = useState(null), [error, setError] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(WEATHER_KEY, city.slug) } catch { /* private mode */ }
    const ctrl = new AbortController()
    setData(null); setError(false)
    fetchForecast(city, ctrl.signal).then(setData).catch(e => { if (e.name !== 'AbortError') setError(true) })
    return () => ctrl.abort()
  }, [city])

  const d = data?.daily
  const today = d && {
    code: d.weather_code[0], max: Math.round(d.temperature_2m_max[0]), min: Math.round(d.temperature_2m_min[0]),
    chance: d.precipitation_probability_max[0] ?? 0, mm: d.precipitation_sum[0] ?? 0,
  }
  const verdict = today && umbrella(today.chance, today.mm)
  const hours = data?.hourly ? data.hourly.time.map((t, i) => ({ h: Number(t.slice(11, 13)), day: t.slice(0, 10), p: data.hourly.precipitation_probability[i] ?? 0, temp: data.hourly.temperature_2m?.[i] }))
    .filter(x => x.day === d.time[0] && x.h >= 6 && x.h <= 22 && x.h % 2 === 0) : []
  const cur = data?.current
  const facts = d && [
    cur?.apparent_temperature != null && ['🌡️', 'מרגיש כמו', `${Math.round(cur.apparent_temperature)}°`],
    cur?.wind_speed_10m != null && ['💨', 'רוח עכשיו', `${Math.round(cur.wind_speed_10m)} קמ״ש`],
    cur?.relative_humidity_2m != null && ['💧', 'לחות', `${cur.relative_humidity_2m}%`],
    d.uv_index_max?.[0] != null && ['🧴', 'UV', `${Math.round(d.uv_index_max[0])} · ${uvLabel(d.uv_index_max[0])}`],
    d.sunrise?.[0] && ['🌅', 'זריחה', hhmm(d.sunrise[0])],
    d.sunset?.[0] && ['🌇', 'שקיעה', hhmm(d.sunset[0])],
  ].filter(Boolean)

  return <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <SEO title="מזג האוויר היום — צריך מטרייה? תחזית לפי עיר" description="מזג האוויר היום בעיר שלכם: האם צריך מטרייה, סיכוי לגשם לפי שעות, טמפרטורה ותחזית לשבוע הקרוב. פשוט וברור — גם לילדים. בחינם." path="/weather" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'מזג האוויר היום' }]} />
    <h1 className="text-center text-4xl font-black sm:text-5xl"><span aria-hidden="true">☂️ </span>מזג האוויר היום — צריך מטרייה?</h1>
    <label className="mx-auto mt-5 block max-w-xs text-center font-bold">העיר שלי
      <select value={city.slug} onChange={e => setSlug(e.target.value)} className="mt-1 w-full rounded-2xl border-2 border-slate-300 bg-white px-3 py-2 text-lg">
        {WEATHER_CITIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
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
        {cur && <p className="mt-1 text-slate-600">עכשיו: <bdi>{Math.round(cur.temperature_2m)}°</bdi> · {describe(cur.weather_code)[0]}</p>}
        <p className="mt-1 text-slate-600">סיכוי לגשם היום: עד <bdi>{today.chance}%</bdi>{today.mm > 0 && <> · כ־<bdi>{today.mm.toFixed(1)}</bdi> מ״מ</>}</p>
      </section>

      {facts.length > 0 && <ul aria-label="פרטים נוספים להיום" className="mx-auto mt-4 grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-3">
        {facts.map(([icon, label, value]) => <li key={label} className="rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-center">
          <div className="text-2xl" aria-hidden="true">{icon}</div>
          <div className="text-sm text-slate-600">{label}</div>
          <div className="text-lg font-black"><bdi>{value}</bdi></div>
        </li>)}
      </ul>}

      {hours.length > 0 && <section aria-label="סיכוי לגשם לפי שעות" className="mx-auto mt-8 max-w-xl">
        <h2 className="text-center text-xl font-black">היום לפי שעות: גשם וטמפרטורה</h2>
        <div className="mt-3 flex items-end justify-between gap-1" dir="ltr" style={{ height: 170 }}>
          {hours.map(x => <div key={x.h} className="flex flex-1 flex-col items-center justify-end" style={{ height: '100%' }}>
            {x.temp != null && <span className="text-xs font-black text-orange-700">{Math.round(x.temp)}°</span>}
            <span className="text-xs font-bold">{x.p}%</span>
            <div className={`w-full rounded-t-md ${x.p >= 60 ? 'bg-sky-600' : x.p >= 30 ? 'bg-sky-300' : 'bg-slate-200'}`} style={{ height: `${Math.max(4, x.p)}%` }} />
            <span className="mt-1 text-xs">{String(x.h).padStart(2, '0')}:00</span>
          </div>)}
        </div>
      </section>}

      <section aria-label="השבוע" className="mx-auto mt-8 max-w-3xl">
        <h2 className="text-center text-xl font-black">השבוע ב{city.name}</h2>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">{d.time.map((t, i) => { const [label, icon] = describe(d.weather_code[i]), p = d.precipitation_probability_max[i] ?? 0, mm = d.precipitation_sum[i] ?? 0, wind = d.wind_speed_10m_max?.[i]; return <li key={t} className="rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-center">
          <b>{i === 0 ? 'היום' : i === 1 ? 'מחר' : dayName(t)}</b>
          <div className="text-3xl" aria-hidden="true">{icon}</div>
          <div className="text-sm">{label}</div>
          <div className="font-bold"><bdi>{Math.round(d.temperature_2m_min[i])}°–{Math.round(d.temperature_2m_max[i])}°</bdi></div>
          <div className="text-sm text-slate-600">{p >= 30 ? '☂️ ' : ''}<bdi>{p}%</bdi> גשם{mm >= 0.5 && <> · <bdi>{mm.toFixed(1)}</bdi> מ״מ</>}</div>
          {wind != null && <div className="text-xs text-slate-500">💨 עד <bdi>{Math.round(wind)}</bdi> קמ״ש</div>}
        </li> })}</ul>
      </section>
    </>}

    <PuddleJump />
    <p className="mt-6 text-center text-xs text-slate-500">נתוני מזג האוויר: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline">Open-Meteo.com</a> (CC BY 4.0). תחזית ממוחשבת — לאזהרות רשמיות ראו את השירות המטאורולוגי.</p>
    <div className="mt-10"><SeoBody paragraphs={[
      'בבוקר של חורף השאלה הכי חשובה היא פשוטה: לקחת מטרייה או לא? בעמוד הזה בוחרים עיר פעם אחת, והיא נשמרת. מיד רואים תשובה ברורה — קחו מטרייה, כדאי מטרייה קטנה, או לא צריך — וגם את הטמפרטורה, את הסיכוי לגשם בכל שעתיים ואת התחזית לשבוע.',
      'התשובה מחושבת מהסיכוי הגבוה ביותר לגשם במהלך היום ומכמות הגשם הצפויה במילימטרים. כך גם ילד שמתארגן לבד לבית הספר יכול לדעת אם להכניס מטרייה לתיק.',
      'מתחת לתשובה יש את כל הפרטים: כמה קר מרגיש בחוץ, כמה חזקה הרוח, הלחות, מדד הקרינה ושעות הזריחה והשקיעה. בתחזית לשבוע רואים לכל יום טמפרטורה, סיכוי לגשם, כמות גשם ורוח.',
    ]} faq={FAQ} related={[{ label: 'בוגה שוקו חם — אזור החורף', href: '/winter' }, { label: 'מה ללבוש היום? בגדים לפי מזג האוויר באנגלית', href: '/english/weather' }, { label: 'כניסת שבת ויציאתה', href: '/shabbat-times' }, { label: 'דפי חורף וגשם', href: '/printables/winter' }]} /></div>
    <p className="mt-6 text-center"><Link to="/tools" className="font-bold underline">לכל הכלים ←</Link></p>
  </div>
}
