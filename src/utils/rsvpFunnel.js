// RSVP funnel steps for the owner report (/admin/activity). Only fixed codes are logged:
// never names, phones, emails or event titles. Pure helpers here; logging is lazy-loaded.
export const RSVP_STEPS = Object.freeze([
  ['visit', 'ביקור בדף היצירה'],
  ['created', 'אירוע נוצר'],
  ['guests', 'נוספו אורחים'],
  ['shared', 'ההזמנה שותפה / נשלחה'],
  ['first_answer', 'תשובת אורח ראשונה'],
  ['panel_shown', 'חבילת אירוע הוצגה'],
  ['upgrade_click', 'לחצו „אני רוצה את החבילה”'],
])
export const GUEST_BUCKETS = Object.freeze(['1_10', '11_50', '51p'])
// Guest-count bucket only, never the exact number. null = no guests added.
export function guestBucket(count) {
  if (!Number.isInteger(count) || count < 1) return null
  return count <= 10 ? '1_10' : count <= 50 ? '11_50' : '51p'
}
// Category string stored by the logger (server limit: 60 chars).
export function stepCategory(step, bucket = null) {
  if (!RSVP_STEPS.some(([id]) => id === step)) return null
  if (step === 'guests') return GUEST_BUCKETS.includes(bucket) ? `rsvp-step:guests_${bucket}` : null
  return `rsvp-step:${step}`
}
// Rows for the owner table: count per step and % of step 1. `counts` = { step: n } from the report.
export function funnelRows(counts) {
  const c = counts || {}
  const first = Number(c.visit) || 0
  return RSVP_STEPS.map(([id, label]) => {
    const n = Number(id === 'guests' ? GUEST_BUCKETS.reduce((s, b) => s + (Number(c[`guests_${b}`]) || 0), 0) : c[id]) || 0
    return { id, label, n, pct: first > 0 ? Math.round((n / first) * 100) : null }
  })
}
export function trackRsvp(step, count) {
  const bucket = step === 'guests' ? guestBucket(count) : null
  if (step === 'guests' && !bucket) return
  void import('./liveActivity.js').then(m => m.logRsvpStep(step, bucket)).catch(() => {})
}
const dismissKey = code => `rsvp-upgrade-dismissed:${String(code || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)}`
export function upgradeDismissed(code) { try { return localStorage.getItem(dismissKey(code)) === '1' } catch { return false } }
export function dismissUpgrade(code) { try { localStorage.setItem(dismissKey(code), '1') } catch { /* ignore */ } }
// True once per event per browser, the first time the organizer sees at least one answer.
export function claimFirstAnswer(code) {
  const key = `rsvp-first-answer:${String(code || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)}`
  try { if (localStorage.getItem(key)) return false; localStorage.setItem(key, '1'); return true } catch { return false }
}
