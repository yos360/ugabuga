// "הודפס X פעמים": per-page print + PDF totals from public_print_counts()
// (supabase/migrations/202610120001_public_print_counts.sql). One request per visit, kept in
// sessionStorage for 30 minutes. Until the migration runs the call fails and nothing is shown.
const URL = import.meta.env?.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co'
const KEY = import.meta.env?.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'
const STORE = 'buga-print-counts'
export const SHOW_FROM = 20 // below this a number looks empty rather than popular

export const countPath = p => (String(p || '').toLowerCase().split(/[?#]/)[0].replace(/\/+$/, '') || '/')

let pending = null
export function loadPrintCounts() {
  if (pending) return pending
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE) || 'null')
    if (saved && Date.now() - saved.at < 30 * 60000) return (pending = Promise.resolve(saved.data))
  } catch { /* ignore */ }
  pending = fetch(`${URL}/rest/v1/rpc/public_print_counts`, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: '{}' })
    .then(r => (r.ok ? r.json() : {}))
    .then(data => { try { sessionStorage.setItem(STORE, JSON.stringify({ at: Date.now(), data })) } catch { /* ignore */ } return data || {} })
    .catch(() => ({}))
  return pending
}

export function printLabel(n) {
  if (!(n >= SHOW_FROM)) return ''
  return `הודפס ${Number(n).toLocaleString('he-IL')} פעמים`
}
