import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { describe, umbrella, dayShort, storedCity, findCity, fetchForecast } from './tools/weatherCore'

// The compact forecast on /winter: today (umbrella verdict, min–max, rain chance) and a one-line strip
// of the next days. The whole card is a link to the full page, /weather. Same city as /weather (this device).
export default function WinterWeather() {
  const [city] = useState(() => findCity(storedCity() || 'tel-aviv'))
  const [data, setData] = useState(null), [error, setError] = useState(false)

  useEffect(() => {
    const ctrl = new AbortController()
    fetchForecast(city, ctrl.signal).then(setData).catch(e => { if (e.name !== 'AbortError') setError(true) })
    return () => ctrl.abort()
  }, [city])

  const d = data?.daily
  const verdict = d && umbrella(d.precipitation_probability_max[0] ?? 0, d.precipitation_sum[0] ?? 0)

  return <Link to="/weather" aria-label={`תחזית מזג האוויר ב${city.name} — לדף מזג האוויר המלא`}
    className="card-lift mx-auto mt-5 block max-w-3xl rounded-3xl border-2 border-sky-200 bg-white/90 p-4 text-right hover:border-sky-400">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <b className="text-lg">🌦️ מזג האוויר ב{city.name}</b>
      <span className="text-sm font-bold text-sky-700 underline">לתחזית המלאה ←</span>
    </div>
    {error && <p className="mt-2 text-sm">לא הצלחנו לטעון את התחזית עכשיו. לחצו לדף מזג האוויר.</p>}
    {!error && !d && <p className="mt-2 text-sm text-slate-500" role="status">בודקים את מזג האוויר…</p>}
    {d && <>
      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-3xl" aria-hidden="true">{describe(d.weather_code[0])[1]}</span>
        <span className="text-xl font-black">היום <bdi>{Math.round(d.temperature_2m_min[0])}°–{Math.round(d.temperature_2m_max[0])}°</bdi></span>
        {data.current && <span className="text-slate-600">עכשיו <bdi>{Math.round(data.current.temperature_2m)}°</bdi></span>}
        <span className="font-bold">{verdict.emoji} {verdict.title}</span>
      </p>
      <ul className="mt-3 grid grid-cols-6 gap-1 text-center" aria-label="התחזית לימים הבאים">
        {d.time.slice(1, 7).map((t, k) => { const i = k + 1, p = d.precipitation_probability_max[i] ?? 0; return <li key={t} className="rounded-xl bg-sky-50 px-1 py-1.5">
          <div className="text-xs font-bold">{i === 1 ? 'מחר' : dayShort(t)}</div>
          <div className="text-xl" aria-hidden="true">{describe(d.weather_code[i])[1]}</div>
          <div className="text-xs font-bold"><bdi>{Math.round(d.temperature_2m_max[i])}°</bdi></div>
          <div className="text-[11px] text-slate-600">{p >= 30 ? '☂️' : ''}<bdi>{p}%</bdi></div>
        </li> })}
      </ul>
    </>}
  </Link>
}
