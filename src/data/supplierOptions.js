export const SUPPLIER_CATEGORIES = [
  ['entertainers', '🤹 מפעילים והפעלות'],
  ['magic', '🎩 קוסמים ומופעים'],
  ['cakes', '🎂 עוגות וקינוחים'],
  ['photo', '📸 צילום ווידאו'],
  ['balloons', '🎈 בלונים ועיצוב'],
  ['inflatables', '🏰 מתנפחים ומתקנים'],
  ['music', '🎧 DJ ומוזיקה'],
  ['venues', '🏡 מקומות לאירוע'],
  ['catering', '🍕 אוכל וקייטרינג'],
  ['crafts', '✂️ סדנאות ויצירה'],
  ['design', '💌 הזמנות ומיתוג'],
  ['costumes', '👑 תחפושות ואביזרים'],
  ['other', '✨ עוד'],
]
export const SUPPLIER_AREAS = ['כל הארץ', 'צפון', 'חיפה והקריות', 'שרון', 'מרכז', 'תל אביב והסביבה', 'ירושלים והסביבה', 'שפלה', 'דרום']
export const categoryLabel = id => SUPPLIER_CATEGORIES.find(c => c[0] === id)?.[1] || ''

export const TEMPLATES = [
  { id: 1, name: 'קלאסי', hint: 'תמונה גדולה בראש הדף, הכל מסודר', swatch: 'linear-gradient(135deg,#14162d,#3b3f6b)' },
  { id: 2, name: 'פתק צהוב', hint: 'בסגנון המחברת של עוגה בוגה', swatch: '#fff4bb' },
  { id: 3, name: 'גלריה קודם', hint: 'התמונות שלכם במרכז הבמה', swatch: 'repeating-linear-gradient(90deg,#d6e8ff 0 12px,#ffd6e0 12px 24px)' },
  { id: 4, name: 'נקי', hint: 'לבן, אוורירי ואלגנטי', swatch: '#ffffff' },
  { id: 5, name: 'חגיגי', hint: 'צבעוני ושמח עם קונפטי', swatch: 'linear-gradient(135deg,#e43f67,#7c3aed)' },
]
