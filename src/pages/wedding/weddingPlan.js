// Wedding to-do list by time left until the day. `from` = days before the wedding the stage starts.
export const STAGES = [
  { id: 'year', title: 'שנה עד תשעה חודשים לפני', from: 365 },
  { id: 'm9', title: 'תשעה עד שישה חודשים לפני', from: 270 },
  { id: 'm6', title: 'שישה עד שלושה חודשים לפני', from: 180 },
  { id: 'm3', title: 'שלושה חודשים עד חודש לפני', from: 90 },
  { id: 'm1', title: 'החודש האחרון', from: 30 },
  { id: 'week', title: 'השבוע של החתונה', from: 7 },
  { id: 'day', title: 'יום החתונה', from: 0 },
]

export const WEDDING_TASKS = [
  { id: 'budget', stage: 'year', text: 'לקבוע תקציב כולל ומי משתתף בו' },
  { id: 'guests-draft', stage: 'year', text: 'רשימת מוזמנים ראשונה — כמה אורחים בערך' },
  { id: 'date', stage: 'year', text: 'לבחור תאריך (ולבדוק חגים וימי זיכרון)' },
  { id: 'venue', stage: 'year', text: 'לסגור אולם או גן אירועים' },
  { id: 'rabbi', stage: 'year', text: 'לפתוח תיק נישואין ברבנות או לבחור עורך טקס' },
  { id: 'photo', stage: 'm9', text: 'לסגור צלם וצלם וידאו' },
  { id: 'dj', stage: 'm9', text: 'לסגור תקליטן או להקה' },
  { id: 'dress', stage: 'm9', text: 'להתחיל לחפש שמלה וחליפה' },
  { id: 'design', stage: 'm6', text: 'עיצוב ופרחים: לבחור סגנון וצבעים' },
  { id: 'hair', stage: 'm6', text: 'לסגור איפור ושיער' },
  { id: 'rings', stage: 'm6', text: 'לקנות טבעות' },
  { id: 'guests-final', stage: 'm3', text: 'לסגור רשימת מוזמנים עם טלפונים' },
  { id: 'invite', stage: 'm3', text: 'לעצב הזמנה', to: '/invitation/wedding', link: 'לעיצוב' },
  { id: 'rsvp', stage: 'm3', text: 'לפתוח אישורי הגעה', to: '/rsvp/wedding', link: 'לפתיחה' },
  { id: 'send', stage: 'm1', text: 'לשלוח הזמנות בוואטסאפ (4–6 שבועות לפני)' },
  { id: 'reminder', stage: 'm1', text: 'תזכורת רק למי שעוד לא אישר' },
  { id: 'seating', stage: 'm1', text: 'סידור הושבה לשולחנות', to: '/rsvp/wedding', link: 'להושבה' },
  { id: 'menu', stage: 'm1', text: 'למסור לאולם מספר מנות ורגישויות במזון' },
  { id: 'schedule', stage: 'week', text: 'לוח זמנים לערב ולשלוח לספקים' },
  { id: 'list', stage: 'week', text: 'להדפיס רשימת הושבה לעמדת הכניסה' },
  { id: 'payments', stage: 'week', text: 'להכין תשלומים לספקים במעטפות' },
  { id: 'bag', stage: 'week', text: 'תיק חירום: מחטים, פלסטרים, מטען, מים' },
  { id: 'eat', stage: 'day', text: 'לאכול ארוחת בוקר טובה ולשתות מים' },
  { id: 'enjoy', stage: 'day', text: 'להעביר את הטלפון למישהו אחר וליהנות' },
]

// "How many will really come?" Rough Israeli arrival rates per guest group (an estimate, not a promise).
export const GUEST_GROUPS = [
  { id: 'close', label: 'משפחה קרובה', rate: 0.95 },
  { id: 'far', label: 'משפחה רחוקה', rate: 0.75 },
  { id: 'friends', label: 'חברים', rate: 0.85 },
  { id: 'work', label: 'עבודה ומכרים', rate: 0.65 },
  { id: 'abroad', label: 'מחו״ל או רחוק מאוד', rate: 0.35 },
]
export const DAY_FACTORS = { weekday: 1, friday: 0.95, holiday: 0.9 }

export function expectedGuests(counts = {}, day = 'weekday') {
  const invited = GUEST_GROUPS.reduce((s, g) => s + Math.max(0, Number(counts[g.id]) || 0), 0)
  const raw = GUEST_GROUPS.reduce((s, g) => s + Math.max(0, Number(counts[g.id]) || 0) * g.rate, 0) * (DAY_FACTORS[day] || 1)
  const expected = Math.round(raw)
  // Commit the venue to the low end: paying for empty seats costs more than adding a few plates.
  return { invited, expected, low: Math.floor(raw * 0.93), high: Math.ceil(raw * 1.05), rate: invited ? Math.round(raw / invited * 100) : 0 }
}

// "How much will the wedding cost?" Supplier lines with a typical Israeli starting point (₪, editable).
export const BUDGET_ITEMS = [
  { id: 'photo', label: 'צילום ווידאו', typical: 12000 },
  { id: 'music', label: 'תקליטן או להקה', typical: 7000 },
  { id: 'design', label: 'עיצוב ופרחים', typical: 8000 },
  { id: 'dress', label: 'שמלה וחליפה', typical: 9000 },
  { id: 'hair', label: 'איפור ושיער', typical: 3000 },
  { id: 'rings', label: 'טבעות', typical: 5000 },
  { id: 'ceremony', label: 'רב או עורך טקס', typical: 2500 },
  { id: 'bar', label: 'בר ואלכוהול', typical: 0 },
  { id: 'other', label: 'שונות (הסעות, מתנות לאורחים)', typical: 3000 },
]

const num = v => Math.max(0, Number(v) || 0)

// items: { [id]: { cost, paid } }; empty cost falls back to the typical price.
export function weddingBudget({ guests = 0, perPlate = 0, gift = 0, items = {} } = {}) {
  const g = Math.round(num(guests))
  const food = g * num(perPlate)
  const lines = BUDGET_ITEMS.map(b => {
    const it = items[b.id] || {}
    const cost = it.cost === undefined || it.cost === '' ? b.typical : num(it.cost)
    return { ...b, cost, paid: Math.min(cost, num(it.paid)) }
  })
  const suppliers = lines.reduce((s, l) => s + l.cost, 0)
  const total = food + suppliers
  const gifts = g * num(gift)
  const paid = lines.reduce((s, l) => s + l.paid, 0)
  return { lines, food, suppliers, total, perGuest: g ? Math.round(total / g) : 0, gifts, balance: gifts - total, paid, left: total - paid }
}

// The whole plan in a link, to open it on another phone or send it to the partner. No server involved.
export function planToLink(plan, origin = '') {
  return `${origin}/wedding#plan=${encodeURIComponent(JSON.stringify(plan))}`
}
export function planFromHash(hash) {
  const m = /[#&]plan=([^&]*)/.exec(hash || '')
  if (!m) return null
  try { const p = JSON.parse(decodeURIComponent(m[1])); return p && typeof p === 'object' && !Array.isArray(p) ? p : null } catch { return null }
}

export function daysUntil(date, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return null
  const [y, m, d] = date.split('-').map(Number)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((new Date(y, m - 1, d) - today) / 86400000)
}

// Stages with their tasks; with a date, the current stage is `now` and earlier ones are `late`.
export function tasksByStage(date, now = new Date()) {
  const days = daysUntil(date, now)
  return STAGES.map((s, i) => {
    const next = STAGES[i + 1]
    // More than a year to go still counts as the first stage.
    const current = days !== null && (i === 0 || days <= s.from) && (!next || days > next.from)
    const late = days !== null && !!next && days <= next.from
    return { ...s, now: current, late, tasks: WEDDING_TASKS.filter(t => t.stage === s.id) }
  })
}
