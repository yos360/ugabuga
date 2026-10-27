import { redactBugaPediaQuery } from './bugapediaSafety.js'
import { rpcInit, rpcUrl } from './qrVariants.js'

// Page requests (/request), through a narrow Supabase RPC (202610270001_page_requests_and_qr_variants.sql);
// nothing here can read data back.
const call = (fn, body) => fetch(rpcUrl(fn), rpcInit(body))
const cleanPath = p => (/^\/[a-z0-9/_-]{0,119}$/.test(p || '') ? p : null)

// Resolves true when saved. Phone numbers or emails typed into the request text are redacted.
export async function submitPageRequest({ request, audience, email, fromPath, source }) {
  const text = redactBugaPediaQuery(String(request || '')).replace(/\s+/g, ' ').trim().slice(0, 400)
  if (text.length < 3) return false
  try {
    const res = await call('record_page_request', { p_request: text, p_audience: String(audience || '').trim().slice(0, 60) || null, p_email: String(email || '').trim().slice(0, 120) || null, p_from_path: cleanPath(fromPath), p_source: source || 'site' })
    return res.ok && (await res.json()) === true
  } catch { return false }
}
