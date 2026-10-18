import { createClient } from '@supabase/supabase-js'

// RSVP, secret-friend draws and thank-you walls — same Supabase project as "מי מביא מה" and the
// quizzes (see supabase/migrations/202610110001_group_tools.sql). Every call is a SECURITY DEFINER
// RPC; tables are never read directly. Organizer tokens are made here and stay on the device
// (plus the private "#k=" organizer link); public functions never return them.
const URL = import.meta.env.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co'
const KEY = import.meta.env.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'
const client = createClient(URL, KEY, { auth: { storageKey: 'ugabuga-group-tools', persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })

const CODES = /not_found|not_owner|not_yours|rate_limited|event_full|name_required|bad_status|bad_number|bad_token|too_few|too_many|duplicate_names|bad_names|draw_impossible|message_required|no_links|wall_full|too_many_notes|no_pin|pin_locked|bad_pin/
const call = (fn, args) => client.rpc(fn, args).then(({ data, error }) => {
  if (error) {
    const text = `${error.code || ''} ${error.message || ''}`
    const code = CODES.exec(error.message || '')?.[0] || (/PGRST202|Could not find the function|does not exist/i.test(text) ? 'not_installed' : 'network')
    throw Object.assign(new Error(code), { code })
  }
  return data
})

const compatibleRsvpCall = (fn, legacy, args) => call(fn, args).catch(e => { if (e.code === 'not_installed') return call(legacy, args); throw e })
export const rsvpDb = {
  version: () => call('rsvp_experience_version', {}).catch(() => 1),
  createV2: (hostToken, event) => call('rsvp_create_v2', { p_host_token: hostToken, p: event }),
  updateV2: (code, hostToken, event) => call('rsvp_update_v2', { p_code: code, p_host_token: hostToken, p: event }),
  create: (hostToken, event) => call('rsvp_create', { p_host_token: hostToken, p: event }),
  get: (code, deviceToken) => compatibleRsvpCall('rsvp_get_v2', 'rsvp_get', { p_code: code, p_device_token: deviceToken || null }),
  answer: (code, deviceToken, answer) => call('rsvp_answer', { p_code: code, p_device_token: deviceToken, p: answer }),
  withdraw: (code, deviceToken) => call('rsvp_withdraw', { p_code: code, p_device_token: deviceToken }),
  host: (code, hostToken) => compatibleRsvpCall('rsvp_host_v2', 'rsvp_host', { p_code: code, p_host_token: hostToken }),
  update: (code, hostToken, event) => call('rsvp_update', { p_code: code, p_host_token: hostToken, p: event }),
  removeResponse: (code, hostToken, id) => call('rsvp_remove_response', { p_code: code, p_host_token: hostToken, p_response_id: id }),
  remove: (code, hostToken) => call('rsvp_delete', { p_code: code, p_host_token: hostToken }),
  // Organizer code (4 digits): manage the event from any phone.
  setPin: (code, hostToken, pin) => call('rsvp_set_pin', { p_code: code, p_host_token: hostToken, p_pin: pin }),
  hasPin: (code, hostToken) => call('rsvp_has_pin', { p_code: code, p_host_token: hostToken }),
  pinLogin: (code, pin) => call('rsvp_pin_login', { p_code: code, p_pin: pin }),
}

export const secretDb = {
  create: (ownerToken, { title, mode, note, budget, names, exclusions }) => call('secret_create', { p_owner_token: ownerToken, p_title: title, p_mode: mode, p_note: note || null, p_budget: budget || null, p_names: names, p_exclusions: exclusions }),
  organizer: (code, ownerToken) => call('secret_organizer', { p_code: code, p_owner_token: ownerToken }),
  whoami: (code, token) => call('secret_whoami', { p_code: code, p_token: token }),
  reveal: (code, token) => call('secret_reveal', { p_code: code, p_token: token }),
  showAll: (code, ownerToken) => call('secret_show_all', { p_code: code, p_owner_token: ownerToken }),
  remove: (code, ownerToken) => call('secret_delete', { p_code: code, p_owner_token: ownerToken }),
}

export const wallDb = {
  create: (ownerToken, board) => call('wall_create', { p_owner_token: ownerToken, p: board }),
  get: (code, deviceToken) => call('wall_get', { p_code: code, p_device_token: deviceToken || null }),
  owner: (code, ownerToken) => call('wall_owner', { p_code: code, p_owner_token: ownerToken }),
  add: (code, deviceToken, { child, message, sticker }) => call('wall_add', { p_code: code, p_device_token: deviceToken, p_child: child, p_message: message, p_sticker: sticker || null }),
  edit: (code, deviceToken, id, { child, message, sticker }) => call('wall_edit', { p_code: code, p_device_token: deviceToken, p_note_id: id, p_child: child, p_message: message, p_sticker: sticker || null }),
  removeMine: (code, deviceToken, id) => call('wall_remove', { p_code: code, p_device_token: deviceToken, p_note_id: id }),
  ownerRemove: (code, ownerToken, id) => call('wall_owner_remove', { p_code: code, p_owner_token: ownerToken, p_note_id: id }),
  update: (code, ownerToken, patch) => call('wall_update', { p_code: code, p_owner_token: ownerToken, p: patch }),
  remove: (code, ownerToken) => call('wall_delete', { p_code: code, p_owner_token: ownerToken }),
}

export const groupErrorText = code => ({
  not_installed: 'הכלי הזה עוד בהקמה אצלנו ויפעל ממש בקרוב. נסו שוב מאוחר יותר 🙏',
  not_found: 'לא מצאנו את הדף. אולי הקישור נחתך, נמחק, או שעבר זמן רב מאז האירוע.',
  not_owner: 'רק מי שיצר/ה את הדף יכול/ה לשנות אותו מהמכשיר הזה.',
  no_pin: 'לאירוע הזה לא הוגדר קוד מארגן. פתחו אותו מהטלפון שבו יצרתם אותו.',
  pin_locked: 'היו יותר מדי ניסיונות. פתחו את האירוע מהטלפון שבו יצרתם אותו והגדירו קוד חדש.',
  bad_pin: 'קוד המארגן הוא 4 ספרות.',
  not_yours: 'אפשר לשנות רק ברכה שכתבתם מהמכשיר הזה.',
  rate_limited: 'יותר מדי פעולות בזמן קצר. חכו כמה דקות ונסו שוב.',
  event_full: 'הגענו למספר התשובות המרבי לאירוע הזה.',
  name_required: 'צריך לכתוב שם.',
  bad_status: 'בחרו: מגיעים, לא מגיעים או אולי.',
  bad_number: 'מספר המשתתפים לא תקין.',
  bad_token: 'משהו השתבש במכשיר. רעננו את הדף ונסו שוב.',
  too_few: 'צריך לפחות 3 משתתפים.',
  too_many: 'אפשר עד 60 משתתפים בהגרלה אחת.',
  duplicate_names: 'יש שם שמופיע פעמיים. הוסיפו אות משם המשפחה.',
  bad_names: 'יש שם לא תקין ברשימה.',
  draw_impossible: 'עם ההחרגות שבחרתם אי אפשר להגריל לכולם. הורידו החרגה אחת או שתיים.',
  message_required: 'כתבו ברכה קצרה.',
  no_links: 'אי אפשר להוסיף קישורים. כתבו טקסט בלבד.',
  wall_full: 'הקיר מלא — אפשר עד 150 ברכות.',
  too_many_notes: 'מהמכשיר הזה כבר נכתבו 6 ברכות לקיר.',
}[code] || 'משהו השתבש בחיבור. נסו שוב בעוד רגע.')

// Per-device memory, best effort only (private mode / blocked storage must not break anything).
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ } }
export const newToken = () => (crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`)

// kind: 'rsvp' | 'secret' | 'wall'
export const groupMemory = {
  owned: kind => read(`ugabuga-${kind}-owned`, []),
  ownerToken: (kind, code) => read(`ugabuga-${kind}-owned`, []).find(x => x.code === code)?.token || null,
  rememberOwned: (kind, code, token, title) => {
    const rest = read(`ugabuga-${kind}-owned`, []).filter(x => x.code !== code)
    write(`ugabuga-${kind}-owned`, [{ code, token, title, at: Date.now() }, ...rest].slice(0, 20))
  },
  forgetOwned: (kind, code) => write(`ugabuga-${kind}-owned`, read(`ugabuga-${kind}-owned`, []).filter(x => x.code !== code)),
  // One device token per tool, used to edit "my answer" / "my blessing" later.
  deviceToken: kind => {
    let t = read(`ugabuga-${kind}-device`, '')
    if (!t) { t = newToken(); write(`ugabuga-${kind}-device`, t) }
    return t
  },
  get: (key, fallback) => read(`ugabuga-${key}`, fallback),
  set: (key, value) => write(`ugabuga-${key}`, value),
}

// "#k=<token>" on an organizer link restores organizer rights on another browser; removed from the address bar at once.
export function tokenFromHash(kind, code, key = 'k') {
  if (typeof location === 'undefined') return null
  const m = new RegExp(`[#&]${key}=([\\w-]{8,64})`).exec(location.hash)
  if (!m) return null
  if (key === 'k') groupMemory.rememberOwned(kind, code, m[1], '')
  window.history.replaceState(window.history.state, '', location.pathname + location.search)
  return m[1]
}

export const SHORT = { rsvp: 'r', secret: 'g', wall: 'w' }
export const shareUrl = (kind, code) => `${location.origin}/${SHORT[kind]}/${code}`
export const organizerUrl = (kind, code, token) => `${shareUrl(kind, code)}#k=${token}`
