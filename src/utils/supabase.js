import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://efhgyispuwxcplvzipcy.supabase.co'
const SUPABASE_KEY = 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'

// New Supabase API keys (sb_publishable_...) are opaque strings, not JWTs.
// The default Authorization: Bearer <key> header breaks auth for these keys —
// only the `apikey` header should be sent.
function isNewSupabaseApiKey(value) {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_')
}

function createSupabaseFetch(key) {
  return (input, init) => {
    const headers = new Headers(init?.headers)
    if (isNewSupabaseApiKey(key) && headers.get('Authorization') === `Bearer ${key}`) {
      headers.delete('Authorization')
    }
    headers.set('apikey', key)
    return fetch(input, { ...init, headers })
  }
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  global: { fetch: createSupabaseFetch(SUPABASE_KEY) },
  auth: { persistSession: false, autoRefreshToken: false },
})
