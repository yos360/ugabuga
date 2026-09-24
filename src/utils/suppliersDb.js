import { createClient } from '@supabase/supabase-js'
import { ownerSupabase } from './ownerAuth'

// Suppliers live in the site's own Supabase project (same as party lists / owner auth).
const URL = import.meta.env.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co'
const KEY = import.meta.env.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'
// Local test builds only: fake signed-in users (never set in production).
const TEST_SUPPLIER = import.meta.env.VITE_TEST_SUPPLIER_CLAIMS || ''
const TEST_OWNER = import.meta.env.VITE_TEST_OWNER_CLAIMS || ''

const keyOnly = {
  fetch(input, init) {
    const headers = new Headers(init?.headers)
    if (headers.get('Authorization') === `Bearer ${KEY}`) headers.delete('Authorization')
    headers.set('apikey', KEY)
    return fetch(input, { ...init, headers })
  },
}
const publicDb = createClient(URL, KEY, { global: keyOnly, auth: { storageKey: 'ugabuga-suppliers-public', persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })

// A supplier's own sign-in (Google or email link), kept apart from the owner's session.
export const supplierAuth = createClient(URL, KEY, {
  global: TEST_SUPPLIER ? { headers: { 'x-test-claims': TEST_SUPPLIER } } : keyOnly,
  auth: { storageKey: 'ugabuga-supplier-auth', flowType: 'implicit', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
const ownerDb = TEST_OWNER ? createClient(URL, KEY, { global: { headers: { 'x-test-claims': TEST_OWNER } }, auth: { persistSession: false } }) : ownerSupabase

const ERRORS = {
  already_has_card: 'כבר יש לך כרטיס — אפשר לערוך אותו כאן.',
  name_required: 'חסר שם העסק.',
  bad_slug: 'כתובת הדף יכולה להכיל רק אותיות באנגלית, מספרים ומקף (3–40 תווים).',
  slug_taken: 'הכתובת הזו כבר תפוסה. נסו אחרת.',
  not_allowed: 'אין הרשאה לפעולה הזו.',
  not_signed_in: 'צריך להתחבר קודם.',
}
const run = res => {
  if (res.error) {
    const code = Object.keys(ERRORS).find(k => (res.error.message || '').includes(k))
    throw Object.assign(new Error(ERRORS[code] || 'משהו השתבש בחיבור. נסו שוב בעוד רגע.'), { code: code || 'network' })
  }
  return res.data
}

export const suppliersDb = {
  list: () => publicDb.rpc('suppliers_public_list').then(run),
  get: slug => publicDb.rpc('supplier_public_get', { p_slug: slug }).then(run),
  track: (id, kind) => {
    if (isOwnerBrowser()) return
    void visitorId().then(v => publicDb.rpc('supplier_track', { p_id: id, p_kind: kind, p_visitor: v })).catch(() => {})
  },
  // signed-in supplier
  mine: () => supplierAuth.rpc('supplier_mine').then(run),
  save: p => supplierAuth.rpc('supplier_save', { p }).then(run),
  requestPage: id => supplierAuth.rpc('supplier_request_page', { p_id: id }).then(run),
  // owner
  adminList: () => ownerDb.rpc('supplier_admin_list').then(run),
  adminSave: p => ownerDb.rpc('supplier_save', { p }).then(run),
  adminDelete: id => ownerDb.rpc('supplier_admin_delete', { p_id: id }).then(run),
}

export async function currentSupplierUser() {
  if (TEST_SUPPLIER) return JSON.parse(TEST_SUPPLIER)
  const { data } = await supplierAuth.auth.getSession()
  return data.session?.user || null
}
// Is Google sign-in switched on in Supabase? (Hide the button until it is.)
export const googleEnabled = () => fetch(`${URL}/auth/v1/settings`, { headers: { apikey: KEY } }).then(r => r.json()).then(j => Boolean(j?.external?.google)).catch(() => false)
export const signInWithGoogle = () => supplierAuth.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/suppliers/me` } })
export const signInWithEmail = email => supplierAuth.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/suppliers/me` } })
export const signOutSupplier = () => supplierAuth.auth.signOut({ scope: 'local' })

// Images: shrunk in the browser to WebP (max 1600px) before upload.
async function shrink(file, max = 1600) {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height)
  return new Promise((ok, fail) => canvas.toBlob(b => b ? ok(b) : fail(new Error('image')), 'image/webp', 0.85))
}
export async function uploadImage(file, { asOwner = false, max } = {}) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('אפשר להעלות רק תמונות JPG, PNG או WebP.')
  const blob = await shrink(file, max)
  const client = asOwner ? ownerDb : supplierAuth
  let folder = 'owner'
  if (!asOwner) { const user = await currentSupplierUser(); if (!user) throw new Error('צריך להתחבר קודם.'); folder = user.id || user.sub }
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
  const { error } = await client.storage.from('supplier-media').upload(path, blob, { contentType: 'image/webp', upsert: false })
  if (error) throw new Error('ההעלאה נכשלה. נסו תמונה אחרת או נסו שוב.')
  return client.storage.from('supplier-media').getPublicUrl(path).data.publicUrl
}

// Helpers
export const waLink = (number, text = 'היי! הגעתי אליך דרך עוגה בוגה 🎂') => {
  const d = String(number || '').replace(/\D/g, '')
  const intl = d.startsWith('0') ? `972${d.slice(1)}` : d
  return intl ? `https://wa.me/${intl}?text=${encodeURIComponent(text)}` : null
}
export const telLink = number => number ? `tel:${String(number).replace(/[^\d+]/g, '')}` : null
function isOwnerBrowser() { try { return !!localStorage.getItem('ugabuga-owner-auth') } catch { return false } }
function visitorId() {
  try {
    const saved = JSON.parse(localStorage.getItem('buga-live-browser') || 'null')
    if (saved?.id && saved.expires > Date.now()) return Promise.resolve(saved.id)
  } catch { /* ignore */ }
  return Promise.resolve(null)
}
export const OWNER_WHATSAPP = '0507772930'
