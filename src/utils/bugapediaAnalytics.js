import { checkBugaPediaQuery, redactBugaPediaQuery } from './bugapediaSafety.js'

const URL = import.meta.env?.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co'
const KEY = import.meta.env?.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'
const recent = new Map()
// `shown` is what the visitor saw: the written answer, or the excerpt of the article that answered.
export function recordBugaPediaQuery({ question, subject, found, resultTitle, shown }) {
  // Blocked and self-harm questions are never stored.
  if (checkBugaPediaQuery(question)) return
  const clean = redactBugaPediaQuery(question).replace(/\s+/g, ' ').trim().slice(0, 180)
  if (clean.length < 2) return
  const signature = `${clean}|${Boolean(found)}|${resultTitle || ''}`
  if (Date.now() - (recent.get(signature) || 0) < 30000) return
  recent.set(signature, Date.now())
  void fetch(`${URL}/rest/v1/rpc/record_bugapedia_query`, { method: 'POST', keepalive: true, headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_question: clean, p_subject: subject || null, p_found: Boolean(found), p_result_title: resultTitle || null, p_shown_text: shown?.text ? String(shown.text).slice(0, 2000) : null, p_shown_url: shown?.url || null, p_shown_written: shown ? Boolean(shown.written) : null }) }).catch(() => {})
}
