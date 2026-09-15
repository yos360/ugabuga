import { createClient } from '@supabase/supabase-js'

// Same Supabase project as the Lovable version — contains all 100 games + content
const SUPABASE_URL = 'https://judhoitufvlqxjhjgnsm.supabase.co'
const SUPABASE_KEY = 'sb_publishable_4PcGG69NOxDcTf52pnptPg_XROLhWaj'

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
