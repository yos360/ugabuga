// GET /api/rain — { rain: true|false }: is it raining now in one of Israel's main cities? Drives the
// "בוגה שוקו חם" banner on the home page. The browser only ever talks to us, so nothing about the visitor
// reaches the weather service, and the answer is cached at the edge for 30 minutes. Data: Open-Meteo (CC BY 4.0).
const CITIES = [[32.08, 34.78], [31.77, 35.21], [32.79, 34.99], [31.25, 34.79]] // Tel Aviv, Jerusalem, Haifa, Be'er Sheva
const URL_NOW = `https://api.open-meteo.com/v1/forecast?latitude=${CITIES.map(c => c[0]).join(',')}&longitude=${CITIES.map(c => c[1]).join(',')}&current=precipitation,weather_code&timezone=Asia%2FJerusalem`
const EDGE_TTL = 30 * 60

// WMO codes: 51–67 drizzle and rain, 80–82 showers. A thunderstorm code alone (95) can be dry, so it needs measured rain.
const rainyCode = c => (c >= 51 && c <= 67) || (c >= 80 && c <= 82)
export const isRaining = (data) => [data].flat().some(city => city?.current && (city.current.precipitation > 0 || rainyCode(city.current.weather_code)))

export async function onRequest({ request, waitUntil }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return Response.json({ error: 'method' }, { status: 405 })
  const key = new Request(new URL('/api/rain', request.url).toString(), { method: 'GET' })
  let cache = null
  try { cache = globalThis.caches?.default || null } catch { cache = null }
  if (cache) {
    try { const hit = await cache.match(key); if (hit) return hit } catch { /* cache unavailable */ }
  }
  try {
    const up = await fetch(URL_NOW, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(6000) })
    if (!up.ok) throw new Error('upstream')
    const res = Response.json({ rain: isRaining(await up.json()) }, { headers: { 'Cache-Control': `public, max-age=600, s-maxage=${EDGE_TTL}`, 'X-Robots-Tag': 'noindex' } })
    if (cache) {
      try { const put = cache.put(key, res.clone()); if (waitUntil) waitUntil(put); else await put } catch { /* not fatal */ }
    }
    return res
  } catch {
    // No forecast means no banner, never an error on the home page.
    return Response.json({ rain: false }, { headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })
  }
}
