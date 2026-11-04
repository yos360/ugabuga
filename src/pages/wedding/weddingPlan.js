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
