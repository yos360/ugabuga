// Successful PDF exports only. Never mix print-dialog opens or inferred button clicks into this.
const URL = import.meta.env?.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co'
const KEY = import.meta.env?.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'
const STORE = 'buga-download-counts-v1'
const TOTAL_STORE = 'buga-printed-sheets-total-v1'
const TTL = 5 * 60000
export const SHOW_FROM = 20 // below this a number looks empty rather than popular

export const countPath = p => (String(p || '').toLowerCase().split(/[?#]/)[0].replace(/\/+$/, '') || '/')

const ROOTS = /^(printables|recipes|cakes|food|shabbat-activities|shabbat-times|parasha|tools|learn|math|hebrew|english|classroom|family|holidays|games|discover|en|invitation|greeting|roots-project|birthday-newspaper)$/
export function publicDownloadPath(path) {
  const p = countPath(path)
  return p.length <= 120 && /^\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)*$/.test(p) && ROOTS.test(p.split('/')[1]) ? p : null
}
export const printablePath = p => /^\/(printables\/|cakes\/|recipes\/shabbat\/|food\/kids-recipes\/|shabbat-activities(?:\/|$)|shabbat-times(?:\/|$)|parasha(?:\/|$))/.test(countPath(p))
const validCount = n => Number.isSafeInteger(n) && n >= 0
const validTotal = value => {
  const n = Number(value)
  return validCount(n) ? n : 0
}
export function normalizeCounts(data) {
  const pages = {}
  for (const [path, n] of Object.entries(data?.pages || {})) if (publicDownloadPath(path) && validCount(n) && n >= SHOW_FROM) pages[countPath(path)] = n
  return { total: validCount(data?.total) ? data.total : 0, pages }
}
let pending = null, expires = 0
export function loadPrintCounts() {
  if (pending && Date.now() < expires) return pending
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE) || 'null')
    if (saved && Date.now() - saved.at < TTL) { expires = saved.at + TTL; return (pending = Promise.resolve(normalizeCounts(saved.data))) }
  } catch { /* ignore */ }
  expires = Date.now() + TTL
  pending = fetch(`${URL}/rest/v1/rpc/public_download_counts`, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: '{}' })
    .then(r => { if (!r.ok) throw new Error('counts_unavailable'); return r.json() })
    .then(normalizeCounts)
    .then(data => { try { sessionStorage.setItem(STORE, JSON.stringify({ at: Date.now(), data })) } catch { /* ignore */ } return data || {} })
    .catch(() => { expires = Date.now() + 30000; return { total: 0, pages: {} } })
  return pending
}

// One public aggregate for the home page. It includes actual print-dialog sheets and successful
// PDF exports, while exposing no paths, users or raw analytics rows.
let totalPending = null, totalExpires = 0
export function loadTotalPrintedSheets() {
  if (totalPending && Date.now() < totalExpires) return totalPending
  try {
    const saved = JSON.parse(sessionStorage.getItem(TOTAL_STORE) || 'null')
    if (saved && Date.now() - saved.at < TTL) {
      totalExpires = saved.at + TTL
      return (totalPending = Promise.resolve(validTotal(saved.total)))
    }
  } catch { /* ignore */ }
  totalExpires = Date.now() + TTL
  totalPending = fetch(`${URL}/rest/v1/rpc/public_total_printed_sheets`, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: '{}' })
    .then(r => { if (!r.ok) throw new Error('total_unavailable'); return r.json() })
    .then(validTotal)
    .then(total => { try { sessionStorage.setItem(TOTAL_STORE, JSON.stringify({ at: Date.now(), total })) } catch { /* ignore */ } return total })
    // Until the database update is live, keep the existing real-PDF count visible.
    .catch(() => loadPrintCounts().then(data => data.total || 0).catch(() => 0))
  return totalPending
}

export function invalidatePrintCounts() {
  pending = null; expires = 0
  totalPending = null; totalExpires = 0
  try { sessionStorage.removeItem(STORE); sessionStorage.removeItem(TOTAL_STORE) } catch { /* ignore */ }
  window.dispatchEvent(new Event('buga:downloads-changed'))
}
export function printLabel(n) { return validCount(n) && n >= SHOW_FROM ? `הורד כ־PDF ${n.toLocaleString('he-IL')} פעמים` : '' }
