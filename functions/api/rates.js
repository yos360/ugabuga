// GET /api/rates — exchange rates for /tools/currency, as { base: 'ILS', date, rates: { USD: 0.31, … } }
// where 1 ₪ = rates[X] X. Free, key-less upstreams (open.er-api.com, then the fawazahmed0 currency-api
// on jsDelivr as a backup). The browser only ever talks to us; nothing about the visitor is forwarded.
// Cached at the edge for 6 hours, so upstream sees a handful of requests a day.
import { parseUpstream } from '../../src/office/money/moneyLogic.js'

const SOURCES = [
  'https://open.er-api.com/v6/latest/ILS',
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/ils.json',
]
const EDGE_TTL = 6 * 3600
const fail = (status, error) => Response.json({ error }, { status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })

export async function fetchRates(fetcher = fetch) {
  for (const url of SOURCES) {
    try {
      const res = await fetcher(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000), cf: { cacheTtl: EDGE_TTL, cacheEverything: true } })
      if (!res.ok) continue
      const data = parseUpstream(await res.json())
      if (data) return data
    } catch { /* try the next source */ }
  }
  return null
}

export async function onRequest({ request, waitUntil }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return fail(405, 'method')
  const key = new Request(new URL('/api/rates', request.url).toString(), { method: 'GET' }) // one entry, query ignored
  let cache = null
  try { cache = globalThis.caches?.default || null } catch { cache = null }
  if (cache) {
    try { const hit = await cache.match(key); if (hit) return hit } catch { /* cache unavailable */ }
  }
  const data = await fetchRates()
  if (!data) return fail(502, 'upstream')
  const res = Response.json(data, { headers: {
    'Cache-Control': `public, max-age=3600, s-maxage=${EDGE_TTL}`,
    'X-Robots-Tag': 'noindex',
  } })
  if (cache) {
    try { const put = cache.put(key, res.clone()); if (waitUntil) waitUntil(put); else await put } catch { /* not fatal */ }
  }
  return res
}
