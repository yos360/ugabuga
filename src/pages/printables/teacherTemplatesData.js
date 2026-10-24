// Teacher / coordinator / kindergarten templates — the list shared by the hub page, the template
// pages and the site search. Kept apart from the (large) page module so other pages can import it.

export const TT_BASE = '/printables/teacher-templates'

// [slug, emoji, title, short description, group]
export const TEACHER_TEMPLATES = [
  ['student-list', '📋', 'רשימת תלמידים עם עמודות לסימון', 'רשימה שמית עם עמודות ריקות או עם כותרות משלכם — לאישורים, תשלומים, החזרת ספרים ובדיקת שיעורי בית', 'class'],
  ['attendance', '✅', 'יומן נוכחות חודשי', 'כל ימי הלימודים בחודש, חגים מסומנים, עמודת סיכום — לכל חודש בשנת תשפ״ז', 'class'],
  ['skills-tracker', '📈', 'מעקב התקדמות לפי מיומנויות', 'טבלת תלמיד × מיומנות עם סולם סימון — לגן, לחינוך המיוחד ולכיתה', 'class'],
  ['duty-roster', '🧹', 'לוח תורנויות', 'תורנים לכל יום או לכל שבוע, עם שיבוץ אוטומטי מרשימת השמות', 'class'],
  ['birthdays', '🎂', 'לוח ימי הולדת', 'שנים־עשר חודשים מספטמבר עד אוגוסט, עם השמות והתאריכים של כל הילדים', 'class'],
  ['weekly-plan', '🗒️', 'תכנון שבועי', 'יום אחר יום: נושא, פעילויות, חומרים והערות — ומקום למטרות השבוע', 'plan'],
  ['yearly-plan', '🗓️', 'תכנון שנתי תשפ״ז', 'חודש אחר חודש עם החגים והמועדים כבר בפנים, ומקום לנושאים ולאירועים', 'plan'],
  ['coordinator-tasks', '📌', 'רשימת משימות לרכזת', 'משימה, מול מי, עד מתי ועדיפות — לרכזת שכבה, רכזת חברתית או פדגוגית', 'staff'],
  ['staff-meeting', '👥', 'פרוטוקול ישיבת צוות', 'משתתפים, סדר יום, עיקרי הדיון וטבלת החלטות עם אחראי ותאריך יעד', 'staff'],
  ['parent-meeting', '🤝', 'תיעוד שיחה עם הורים', 'מטרת השיחה, חוזקות, נושאים שעלו, סיכומים והמשך — דף אחד מסודר', 'staff'],
  ['trip-permission', '🚌', 'מכתב יציאה לטיול ואישור הורים', 'פרטי הפעילות להורים וספח אישור לגזירה — תבנית כללית למילוי', 'events'],
  ['equipment-list', '🎒', 'רשימת ציוד', 'ציוד לטיול, לכיתה או לאירוע — עם כמות, מי מביא ותיבת סימון', 'events'],
  ['appreciation', '🏅', 'תעודת הצטיינות ומכתב הוקרה', 'תעודה לכל תלמיד מרשימת השמות, או מכתב הוקרה להורים ולצוות', 'events'],
  ['daily-routine', '🌞', 'סדר יום בגן', 'סדר היום עם שעות וסמלים גדולים — לתלייה בגן ובכיתה', 'gan'],
]

export const TEACHER_GROUPS = [
  ['class', '🏫 ניהול כיתה וגן'],
  ['plan', '🧭 תכנון'],
  ['staff', '👩‍💼 לרכזות ולצוות'],
  ['events', '🎉 טיולים, אירועים והוקרה'],
  ['gan', '🧸 לגן'],
]

export const teacherTemplate = slug => TEACHER_TEMPLATES.find(t => t[0] === slug)

const lines = text => String(text || '').split('\n').map(s => s.trim()).filter(Boolean)

// "נועה 12/3" / "אורי - 4.11" → { name, day, month }
export function parseBirthdays(text) {
  const out = [], missing = []
  for (const row of lines(text)) {
    const m = row.match(/^(.+?)[\s,:\-–]+(\d{1,2})[./](\d{1,2})(?:[./]\d{2,4})?$/)
    const day = m ? Number(m[2]) : 0, month = m ? Number(m[3]) : 0
    if (m && day >= 1 && day <= 31 && month >= 1 && month <= 12) out.push({ name: m[1].trim().replace(/[\s,:\-–]+$/, ''), day, month })
    else missing.push(row.replace(/[\s,:\-–]+$/, ''))
  }
  return { list: out, missing }
}
export function parseRoutine(text) {
  return lines(text).slice(0, 12).map(row => {
    const m = row.match(/^(\d{1,2}[:.]\d{2})\s*[|\-–]?\s*(.+)$/)
    return m ? { time: m[1].replace('.', ':'), what: m[2].trim() } : { time: '', what: row }
  })
}
