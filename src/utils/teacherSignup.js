import { rpcInit, rpcUrl } from './qrVariants.js'

// Teachers' mailing list (/teachers/join) through narrow Supabase RPCs (202611231000_teacher_signups.sql);
// nothing here can read the list back.
export const ROLES = ['מורה', 'גננת', 'הורה', 'אחר']
export const GRADES = ['גן', 'א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳', 'ט׳']
export const SUBJECTS = ['עברית', 'חשבון', 'אנגלית', 'מדעים', 'חגים', 'אחר']
export const CONSENT_TEXT = 'אני מסכימ/ה לקבל מעוגה בוגה עדכונים במייל על חומרים חדשים. אפשר להסיר בכל רגע בקישור שבכל מייל.'

export const isValidEmail = e => { const v = String(e || '').trim(); return v.length <= 120 && /^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(v) }
export const isToken = t => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(t || ''))
const cleanPath = p => (/^\/[a-z0-9/_-]{0,119}$/.test(p || '') ? p : null)
const call = (fn, body) => fetch(rpcUrl(fn), rpcInit(body))

// Resolves true when saved. Consent must be explicitly true.
export async function subscribeTeacher({ email, role, grades, subjects, sourcePath, consent }) {
  if (consent !== true || !isValidEmail(email)) return false
  try {
    const res = await call('subscribe_teacher', { p_email: String(email).trim().toLowerCase(), p_role: ROLES.includes(role) ? role : 'אחר', p_grades: (grades || []).filter(g => GRADES.includes(g)), p_subjects: (subjects || []).filter(s => SUBJECTS.includes(s)), p_source_path: cleanPath(sourcePath), p_consent_text: CONSENT_TEXT, p_consent: true })
    return res.ok && (await res.json()) === true
  } catch { return false }
}

export async function unsubscribeTeacher(token) {
  if (!isToken(token)) return false
  try { const res = await call('unsubscribe_teacher', { p_token: token }); return res.ok && (await res.json()) === true } catch { return false }
}
