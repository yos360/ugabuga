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
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export async function startOwnerGoogleLogin() {
  // A disabled provider otherwise sends people to a raw JSON error page.
  const response = await fetch(`${OWNER_AUTH_URL}/auth/v1/settings`, {
    headers: { apikey: PUBLIC_KEY },
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error('לא הצלחנו להתחבר כרגע. נסו שוב בעוד רגע.')
  const settings = await response.json()
  if (!settings.external?.google) {
    throw new Error('חיבור Google עדיין ממתין להשלמת ההגדרה. הדוח נשאר פרטי.')
  }
  const { error } = await ownerSupabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/admin/activity`,
      queryParams: { login_hint: OWNER_EMAIL, prompt: 'select_account' },
    },
  })
  if (error) throw new Error('לא הצלחנו לפתוח את הכניסה עם Google. נסו שוב.')
}
