import { createClient } from '@supabase/supabase-js'

// "רשימת קניות משותפת": one list per link, edited by everyone who has it (the functions live in
// supabase/migrations/20261102170000_shopping_lists.sql). After each change this device sends a
// Realtime broadcast ping on the list's channel; the other phones reload on that ping, and also poll
// every few seconds in case broadcasts are blocked.
const URL = import.meta.env.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co'
const KEY = import.meta.env.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'

let client
const db = () => (client ||= createClient(URL, KEY, {
  auth: { storageKey: 'ugabuga-shopping', persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
}))

const ERRORS = /list_not_found|list_full|text_required|no_links|bad_op/
const call = (fn, args) => db().rpc(fn, args).then(({ data, error }) => {
  if (error) throw Object.assign(new Error(ERRORS.exec(error.message || '')?.[0] || 'network'))
  return data
})

export const shoppingDb = {
  create: title => call('shop_create', { p_title: title }),
  get: code => call('shop_get', { p_code: code }),
  change: (code, op, { id = null, text = null } = {}) => call('shop_change', { p_code: code, p_op: op, p_id: id, p_text: text }),
}

// Live pings between the phones on one list. Returns { ping, close }.
export function shoppingChannel(code, onPing) {
  const ch = db().channel(`shop:${code}`, { config: { broadcast: { self: false } } })
  ch.on('broadcast', { event: 'changed' }, () => onPing()).subscribe()
  return {
    ping: version => { ch.send({ type: 'broadcast', event: 'changed', payload: { version } }).catch(() => {}) },
    close: () => { db().removeChannel(ch) },
  }
}

export const SHOPPING_PATH = '/tools/shopping-list'
export const shoppingLink = code => `https://ugabuga.co.il${SHOPPING_PATH}/${code}`
export const newItemId = () => (crypto.randomUUID?.() || `${Date.now()}${Math.random()}`).replace(/[^a-z0-9]/gi, '').slice(0, 12)
