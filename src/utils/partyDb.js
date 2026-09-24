import { createClient } from '@supabase/supabase-js'

// Party lists live in the site's own Supabase project (same one used for live
// presence and owner auth), NOT the legacy Lovable content project.
const URL = import.meta.env.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co'
const KEY = import.meta.env.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'

const client = createClient(URL, KEY, {
  auth: { storageKey: 'ugabuga-party-lists', persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})

const one = ({ data, error }) => {
  if (error) {
    const code = /item_already_taken|not_your_claim|not_owner|list_not_found|item_not_found|name_required/.exec(error.message || '')?.[0]
    throw Object.assign(new Error(code || error.message || 'error'), { code: code || 'network' })
  }
  const row = Array.isArray(data) ? data[0] : data
  if (!row) throw Object.assign(new Error('list_not_found'), { code: 'list_not_found' })
  return row
}

// Items carry { id, text, cat?, qty?, takenBy, arrived?, claims?: [{ id, name, count }] }. List details carry
// { date?, time?, place?, note? }. Claims (claim/unclaim) return the list
// without details, so callers merge them into the list they already have.
const clean = items => items.map(({ id, text, cat, qty, takenBy, arrived }) => ({ id, text, cat, qty, takenBy, arrived }))
// Prefer the v4 owner save (keeps any split claims); fall back to v3 if v4 isn't installed.
const missingFn = e => /PGRST202|Could not find the function|does not exist/i.test(`${e?.code} ${e?.message}`)
const rpc = (fn, args) => client.rpc(fn, args).then(res => { if (res.error && missingFn(res.error)) throw Object.assign(new Error('missing_fn'), { missing: true }); return one(res) })
const withFallback = (primary, fallback) => primary().catch(e => { if (e.missing) return fallback(); throw e })
export const partyDb = {
  create: (ownerToken, title, items, details = {}) => client.rpc('create_party_list3', { p_owner_token: ownerToken, p_title: title, p_items: clean(items), p_details: details }).then(one),
  get: code => client.rpc('get_party_list3', { p_share_code: code }).then(one),
  update: (code, ownerToken, title, items, release = [], details = null) => {
    const args = { p_share_code: code, p_owner_token: ownerToken, p_title: title, p_items: clean(items), p_release: release, p_details: details }
    return withFallback(() => rpc('update_party_list4', args), () => client.rpc('update_party_list3', args).then(one))
  },
  claim: (code, itemId, name, claimToken) => client.rpc('claim_party_item2', { p_share_code: code, p_item_id: itemId, p_name: name, p_claim_token: claimToken }).then(one),
  unclaim: (code, itemId, claimToken) => client.rpc('unclaim_party_item', { p_share_code: code, p_item_id: itemId, p_claim_token: claimToken }).then(one),
  remove: (code, ownerToken) => client.rpc('delete_party_list', { p_share_code: code, p_owner_token: ownerToken }).then(one),
}

// Per-device memory, all best-effort (private mode / blocked storage must not break the page).
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ } }

export const partyMemory = {
  // Lists this device created: [{ code, ownerToken, title, at }]
  myLists: () => read('ugabuga-party-owned', []),
  ownerToken: code => read('ugabuga-party-owned', []).find(l => l.code === code)?.ownerToken || null,
  rememberOwned: (code, ownerToken, title) => {
    const rest = read('ugabuga-party-owned', []).filter(l => l.code !== code)
    write('ugabuga-party-owned', [{ code, ownerToken, title, at: Date.now() }, ...rest].slice(0, 20))
  },
  forgetOwned: code => write('ugabuga-party-owned', read('ugabuga-party-owned', []).filter(l => l.code !== code)),
  guestName: () => read('ugabuga-guest-name', ''),
  setGuestName: name => write('ugabuga-guest-name', name),
  // Claims this device made: { [code]: { [itemId]: token } }
  claims: code => read('ugabuga-party-claims', {})[code] || {},
  setClaim: (code, itemId, token) => {
    const all = read('ugabuga-party-claims', {})
    const mine = { ...(all[code] || {}) }
    if (token) mine[itemId] = token; else delete mine[itemId]
    write('ugabuga-party-claims', { ...all, [code]: mine })
  },
}

export const shortLink = code => `${location.origin}/l/${code}`
export const newId = () => (crypto.randomUUID?.() || String(Math.random())).replace(/-/g, '').slice(0, 12)
