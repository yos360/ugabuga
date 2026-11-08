import { SHABBAT_CITIES } from '../../data/shabbatCities'

// Shared by /weather (the full page) and the compact forecast on /winter. Forecast data: Open-Meteo
// (free, no key, CC BY 4.0). Only the city's coordinates are sent; the chosen city is kept on this device.
export const WEATHER_KEY = 'buga-weather-city'
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

export const dayName = iso => new Date(`${iso}T12:00:00`).toLocaleDateString('he-IL', { weekday: 'long' })
export const dayShort = iso => new Date(`${iso}T12:00:00`).toLocaleDateString('he-IL', { weekday: 'short' })
export const WEATHER_CITIES = [...SHABBAT_CITIES].sort((a, b) => a.name.localeCompare(b.name, 'he'))
export const storedCity = () => { try { return localStorage.getItem(WEATHER_KEY) } catch { return null } }
export const findCity = slug => WEATHER_CITIES.find(c => c.slug === slug) || WEATHER_CITIES.find(c => c.slug === 'tel-aviv') || WEATHER_CITIES[0]

// One request for both pages: current, hourly and 7 days.
export function fetchForecast(city, signal) {
  const qs = new URLSearchParams({ latitude: city.latitude, longitude: city.longitude, timezone: 'Asia/Jerusalem', forecast_days: '7', wind_speed_unit: 'kmh',
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    hourly: 'precipitation_probability,temperature_2m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,uv_index_max,sunrise,sunset' })
  return fetch(`${API}?${qs}`, { signal }).then(r => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
}
