import { createClient } from '@supabase/supabase-js'
import { ownerSupabase } from './ownerAuth'

const URL = import.meta.env.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co'
const KEY = import.meta.env.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'
const client = createClient(URL, KEY, { auth: { storageKey: 'ugabuga-site-chat', persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })

// PostgREST answers PGRST202 when the RPC does not exist yet (migration not run)
export const isMissingFunctionError = error => error?.code === 'PGRST202' || /Could not find the function/i.test(error?.message || '')

const run = ({ data, error }) => {
  if (!error) return data
  if (isMissingFunctionError(error)) throw Object.assign(new Error('chat_unavailable'), { code: 'chat_unavailable' })
  const known = /chat_not_found|chat_closed|message_required|rate_limited|not_owner/.exec(error.message || '')?.[0]
  throw Object.assign(new Error(known || 'network'), { code: known || 'network' })
}
const rpc = (fn, args) => client.rpc(fn, args).then(run)
const ownerRpc = (fn, args) => ownerSupabase.rpc(fn, args).then(run)

export const newSiteChatToken = () => crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`

export const siteChatDb = {
  start: ({ token, name, contact, topic, body }) => rpc('site_chat_start', { p_token: token, p_name: name || null, p_contact: contact || null, p_topic: topic, p_body: body }),
  get: token => rpc('site_chat_get', { p_token: token }),
  send: (token, body) => rpc('site_chat_send', { p_token: token, p_body: body }),
  ownerList: limit => ownerRpc('site_chat_owner_list', { p_limit: limit || 200 }),
  ownerReply: (threadId, body) => ownerRpc('site_chat_owner_reply', { p_thread_id: threadId, p_body: body }),
  ownerStatus: (threadId, status) => ownerRpc('site_chat_owner_status', { p_thread_id: threadId, p_status: status }),
}

export const siteChatErrorText = code => ({
  chat_not_found: 'השיחה לא נמצאה בדפדפן הזה. אפשר לפתוח שיחה חדשה.',
  chat_closed: 'השיחה נסגרה. אפשר לפתוח שיחה חדשה.',
  message_required: 'כתבו הודעה קצרה לפני השליחה.',
  rate_limited: 'נשלחו הרבה הודעות בזמן קצר. חכו כמה דקות ונסו שוב.',
  not_owner: 'אין הרשאה לצפות בפניות.',
  chat_unavailable: 'הצ\'אט עוד לא הופעל. נחזור לכאן בקרוב 💜',
}[code] || 'לא הצלחנו לשלוח כרגע. נסו שוב בעוד רגע.')
