// How many different visitors opened each page in the last 30 days, from public_page_popularity()
// (supabase/migrations/202610120003_public_page_popularity.sql). Used to put the most visited pages
// first in search suggestions. One request per visit, kept in sessionStorage for 30 minutes.
// Until the migration runs the call fails and search keeps its plain relevance order.
import { countPath } from './printCounts.js'

const URL = import.meta.env?.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co'
const KEY = import.meta.env?.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'
const STORE = 'buga-page-popularity'

// { path: visitors } → Map keyed the way search items link (lowercase, no query/hash/trailing slash)
export const popularityMap = data => new Map(Object.entries(data || {}).map(([p, n]) => [countPath(p), Number(n) || 0]))

let pending = null
export function loadPagePopularity() {
  if (pending) return pending
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE) || 'null')
    if (saved && Date.now() - saved.at < 30 * 60000) return (pending = Promise.resolve(popularityMap(saved.data)))
  } catch { /* ignore */ }
  pending = fetch(`${URL}/rest/v1/rpc/public_page_popularity`, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: '{}' })
    .then(r => (r.ok ? r.json() : {}))
    .then(data => { try { sessionStorage.setItem(STORE, JSON.stringify({ at: Date.now(), data })) } catch { /* ignore */ } return popularityMap(data) })
    .catch(() => new Map())
  return pending
}
