import { createClient } from '@supabase/supabase-js'

// The owner's address is not in the code: the page compares a SHA-256 of the signed-in address.
// This only decides what the page shows — the data itself is protected by owner-only RLS in Supabase.
export const OWNER = { sha256: 'd42cc7d2d976d54fa6d766d61033e18a27177a09e690039e1439dee73b0a47d6' } // an object so tests can swap it
export async function isOwnerEmail(email) {
  if (!email || !crypto?.subtle) return false
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email.trim().toLowerCase()))
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('') === OWNER.sha256
}
// remembered on the owner's own browser after a successful sign-in, to fill the field next time
const EMAIL_KEY = 'buga-owner-email'
export const rememberedOwnerEmail = () => { try { return localStorage.getItem(EMAIL_KEY) || '' } catch { return '' } }
export const rememberOwnerEmail = email => { try { localStorage.setItem(EMAIL_KEY, email) } catch { /* ignore */ } }
export const OWNER_AUTH_URL = 'https://efhgyispuwxcplvzipcy.supabase.co'
const PUBLIC_KEY = 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'

// Separate owner sessions from the content database and public presence.
// This is a public browser key. Owner-only RLS protects the private report.
export const ownerSupabase = createClient(OWNER_AUTH_URL, PUBLIC_KEY, {
  global: {
    fetch(input, init) {
      const headers = new Headers(init?.headers)
      if (headers.get('Authorization') === `Bearer ${PUBLIC_KEY}`) headers.delete('Authorization')
      headers.set('apikey', PUBLIC_KEY)
      return fetch(input, { ...init, headers })
    },
  },
  auth: {
    storageKey: 'ugabuga-owner-auth',
    // Implicit flow so the magic link works from any browser or device,
    // not only the one that requested it (PKCE needs the same browser).
    flowType: 'implicit',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Password sign-in: no email round-trip, no expiring links and no mail-sending rate limits.
export async function signInOwnerWithPassword(email, password) {
  const { error } = await ownerSupabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error) {
    if (/rate|limit|too many/i.test(error.message)) {
      throw new Error('היו יותר מדי ניסיונות. חכו כמה דקות ונסו שוב.')
    }
    if (/invalid|credentials/i.test(error.message)) {
      throw new Error('הסיסמה שגויה. נסו שוב.')
    }
    if (/confirm/i.test(error.message)) {
      throw new Error('החשבון עוד לא אושר. סמנו "Auto Confirm User" כשיוצרים אותו ב-Supabase.')
    }
    throw new Error('לא הצלחנו להתחבר כרגע. נסו שוב בעוד רגע.')
  }
}

// Magic link, only to the owner's address (checked by hash) and never creating a new account.
export async function startOwnerEmailLogin(email) {
  if (!(await isOwnerEmail(email))) throw new Error('זו לא כתובת המייל של בעל האתר.')
  const { error } = await ownerSupabase.auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: `${window.location.origin}/admin/activity`, shouldCreateUser: false },
  })
  if (error) {
    if (/rate|limit|too many/i.test(error.message)) {
      throw new Error('נשלחו כבר כמה קישורים לאחרונה. בדקו את תיבת המייל או נסו שוב בעוד כמה דקות.')
    }
    throw new Error('לא הצלחנו לשלוח את קישור הכניסה. נסו שוב בעוד רגע.')
  }
}
