// Which rotating QR message was printed, and which one was scanned (see src/data/printMessages.js).
// Kept tiny and dependency-free: PrintPreview imports it.
const URL = import.meta.env?.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co'
const KEY = import.meta.env?.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'
export const rpcUrl = fn => `${URL}/rest/v1/rpc/${fn}`
export const rpcInit = (body, keepalive = false) => ({ method: 'POST', keepalive, headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
const cleanPath = p => (/^\/[a-z0-9/_-]{0,119}$/.test(p || '') ? p : null)
// Same rule as liveActivity: the owner's own browser is left out of the stats.
const ownerDevice = () => { try { return localStorage.getItem('buga-owner-device') === '1' && localStorage.getItem('buga-track-self') !== '1' } catch { return false } }

export function recordQrVariant(variant, kind, path) {
  if (!/^[a-z][0-9]{1,2}$/.test(variant || '') || ownerDevice()) return
  void fetch(rpcUrl('record_qr_variant'), rpcInit({ p_variant: variant, p_kind: kind, p_path: cleanPath(path) }, true)).catch(() => {})
}

// The landing's campaign tags: index.html moves them out of the address bar into sessionStorage
// before the app starts, so read both.
export function landingTags(search = location.search) {
  const q = new URLSearchParams(search)
  let source = q.get('utm_source'), content = q.get('utm_content')
  try { source ||= sessionStorage.getItem('buga-landing-utm'); content ||= sessionStorage.getItem('buga-landing-content') } catch { /* storage blocked */ }
  return { source, content }
}

// Once per tab: a visitor who arrived from a printed QR records which message brought them.
export function noteQrScan(search = location.search, path = location.pathname) {
  try {
    const { source, content } = landingTags(search)
    if (source !== 'qr' || sessionStorage.getItem('buga-qr-scan')) return
    sessionStorage.setItem('buga-qr-scan', '1')
    recordQrVariant(content, 'scanned', path)
  } catch { /* storage blocked */ }
}
