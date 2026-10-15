export const REMINDER_OPTIONS = [[30, 'חצי שעה לפני'], [60, 'שעה לפני'], [120, 'שעתיים לפני'], [180, 'שלוש שעות לפני']]
export const MAIL_CONSENT_VERSION = '2026-10-15-v1'
export const MAIL_LABELS = { shabbat: 'תזכורת שבת', weekly: 'תוכן שבועי', marketing: 'הצעות ופרסומות' }
export function normalizeMail(input) {
  const email = String(input.email || '').trim().toLowerCase()
  if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new Error('בדקו את כתובת המייל.')
  const preferences = Object.fromEntries(Object.keys(MAIL_LABELS).map(k => [k, input[k] === true]))
  if (!Object.values(preferences).some(Boolean)) throw new Error('בחרו לפחות סוג אחד של מייל.')
  const minutes = Number(input.minutes || 60)
  if (!REMINDER_OPTIONS.some(([n]) => n === minutes)) throw new Error('בחרו מועד תזכורת מהרשימה.')
  return { email, ...preferences, city: String(input.city || ''), minutes, consent_version: MAIL_CONSENT_VERSION }
}
export async function mailApi(action, payload = {}, accessToken) {
  const response = await fetch('/api/mail', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) }, body: JSON.stringify({ action, ...payload }) })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'השירות לא זמין כרגע. נסו שוב מאוחר יותר.')
  return data
}
export function csvCell(value) { const s = String(value ?? ''); return '"' + (/^[=+@\-\t\r]/.test(s) ? "'" : '') + s.replaceAll('"', '""') + '"' }
