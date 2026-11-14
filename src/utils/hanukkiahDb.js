import { createClient } from '@supabase/supabase-js'

// "החנוכייה המשותפת" — same Supabase project as the other group tools. Every call is a SECURITY
// DEFINER RPC from supabase/migrations/202611150001_shared_hanukkiah.sql; tables are never read
// directly. The organizer token is made on the organizer's device and never returned by the server.
const URL = import.meta.env.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co'
const KEY = import.meta.env.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'

let client
const db = () => (client ||= createClient(URL, KEY, {
  auth: { storageKey: 'ugabuga-hanukkiah', persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
}))

const CODES = /not_found|not_owner|not_yours|rate_limited|name_required|bad_token|no_links|inappropriate|no_contact|not_tonight|already_lit|hk_full/
const call = (fn, args) => db().rpc(fn, args).then(({ data, error }) => {
  if (error) {
    const text = `${error.code || ''} ${error.message || ''}`
    const code = CODES.exec(error.message || '')?.[0] || (/PGRST202|Could not find the function|does not exist/i.test(text) ? 'not_installed' : 'network')
    throw Object.assign(new Error(code), { code })
  }
  return data
})

export const hanukkiahDb = {
  create: (ownerToken, { title, kind }) => call('hk_create', { p_owner_token: ownerToken, p: { title, kind } }),
  get: (code, deviceToken, night = null) => call('hk_get', { p_code: code, p_device_token: deviceToken || null, p_night: night }),
  owner: (code, ownerToken, deviceToken, night = null) => call('hk_owner', { p_code: code, p_owner_token: ownerToken, p_device_token: deviceToken || null, p_night: night }),
  light: (code, deviceToken, { name, wish }) => call('hk_light', { p_code: code, p_device_token: deviceToken, p_name: name, p_wish: wish || null }),
  unlight: (code, deviceToken, id) => call('hk_unlight', { p_code: code, p_device_token: deviceToken, p_candle_id: id }),
  ownerRemove: (code, ownerToken, id) => call('hk_owner_remove', { p_code: code, p_owner_token: ownerToken, p_candle_id: id }),
  update: (code, ownerToken, patch) => call('hk_update', { p_code: code, p_owner_token: ownerToken, p: patch }),
  remove: (code, ownerToken) => call('hk_delete', { p_code: code, p_owner_token: ownerToken }),
}

export const hanukkiahErrorText = code => ({
  not_installed: 'החנוכייה המשותפת עוד בהקמה אצלנו ותפעל ממש בקרוב. נסו שוב מאוחר יותר 🙏',
  not_found: 'לא מצאנו את החנוכייה. אולי הקישור נחתך, או שהיא נמחקה.',
  not_owner: 'רק מי שפתח/ה את החנוכייה יכול/ה לשנות אותה מהמכשיר הזה.',
  not_yours: 'אפשר להסיר רק נר שהודלק מהמכשיר הזה.',
  rate_limited: 'יותר מדי פעולות בזמן קצר. חכו כמה דקות ונסו שוב.',
  name_required: 'כתבו שם פרטי או כינוי.',
  bad_token: 'משהו השתבש במכשיר. רעננו את הדף ונסו שוב.',
  no_links: 'אי אפשר להוסיף קישורים, כתובות או שמות משתמש ברשתות חברתיות. כתבו טקסט בלבד.',
  inappropriate: 'הטקסט כולל מילים שלא מתאימות לאתר לילדים. נסחו אחרת, בבקשה.',
  no_contact: 'אי אפשר לכתוב מספר טלפון. כתבו טקסט בלבד.',
  not_tonight: 'אפשר להדליק רק בערבי חנוכה — מהנר הראשון (יום שישי 4.12 בערב) ועד הנר השמיני.',
  already_lit: 'מהמכשיר הזה כבר הודלק נר הערב. נתראה מחר בערב! 🕯️',
  hk_full: 'החנוכייה מלאה להערב — כבר הודלקו 300 נרות.',
}[code] || 'משהו השתבש בחיבור. נסו שוב בעוד רגע.')

// Per-device memory, best effort only (private mode / blocked storage must not break anything).
// Same keys pattern as groupMemory in groupDb.js ('ugabuga-hanukkiah-owned', '-device').
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ } }
export const newToken = () => (crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`)
const OWNED = 'ugabuga-hanukkiah-owned'
export const hkMemory = {
  owned: () => read(OWNED, []),
  ownerToken: code => read(OWNED, []).find(x => x.code === code)?.token || null,
  rememberOwned: (code, token, title) => write(OWNED, [{ code, token, title, at: Date.now() }, ...read(OWNED, []).filter(x => x.code !== code)].slice(0, 20)),
  forgetOwned: code => write(OWNED, read(OWNED, []).filter(x => x.code !== code)),
  deviceToken: () => {
    let t = read('ugabuga-hanukkiah-device', '')
    if (!t) { t = newToken(); write('ugabuga-hanukkiah-device', t) }
    return t
  },
  get: (key, fallback) => read(`ugabuga-hanukkiah-${key}`, fallback),
  set: (key, value) => write(`ugabuga-hanukkiah-${key}`, value),
}

// "#k=<token>" on the organizer link restores organizer rights on another phone; removed from the address bar at once.
export function ownerTokenFromHash(code) {
  if (typeof location === 'undefined') return null
  const m = /[#&]k=([\w-]{8,64})/.exec(location.hash)
  if (!m) return null
  hkMemory.rememberOwned(code, m[1], '')
  window.history.replaceState(window.history.state, '', location.pathname + location.search)
  return m[1]
}

export const hkShareUrl = code => `${location.origin}/hanukkiah/${code}`
export const hkOrganizerUrl = (code, token) => `${hkShareUrl(code)}#k=${token}`
