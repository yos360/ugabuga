import { createClient } from '@supabase/supabase-js'

export const OWNER_EMAIL = 'yos300@gmail.com'
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

// Magic link to the fixed owner address. No password, no external provider
// setup, and nobody can request a link to any other address from this page.
export async function startOwnerEmailLogin() {
  const { error } = await ownerSupabase.auth.signInWithOtp({
    email: OWNER_EMAIL,
    options: { emailRedirectTo: `${window.location.origin}/admin/activity` },
  })
  if (error) {
    if (/rate|limit|too many/i.test(error.message)) {
      throw new Error('נשלחו כבר כמה קישורים לאחרונה. בדקו את תיבת המייל או נסו שוב בעוד כמה דקות.')
    }
    throw new Error('לא הצלחנו לשלוח את קישור הכניסה. נסו שוב בעוד רגע.')
  }
}
