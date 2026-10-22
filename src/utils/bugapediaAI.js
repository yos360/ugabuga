// Asks the bugapedia-answer Edge Function for a written answer (Claude, grounded in encyclopedia excerpts).
// Resolves to { answer, confident, sources } or null when there is nothing to show; the page then falls
// back to the encyclopedia results alone, so a missing function or key never breaks BugaPedia.
const URL = import.meta.env?.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co'
const KEY = import.meta.env?.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'

export async function askBugaPediaAI(question, subject, signal, level) {
  const timeout = AbortSignal.timeout(30000)
  const response = await fetch(`${URL}/functions/v1/bugapedia-answer`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, subject: subject || null, ...(level ? { level } : {}) }),
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  })
  if (!response.ok) return null
  const data = await response.json()
  if (!data || data.skip || typeof data.answer !== 'string' || data.answer.length < 10) return null
  return {
    answer: data.answer,
    confident: data.confident !== false,
    sources: (Array.isArray(data.sources) ? data.sources : []).filter(source => /^https:\/\//.test(source?.url || '')).slice(0, 4),
  }
}
