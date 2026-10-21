// A made-up, friendly name for an anonymous visitor code ("3fb4a6" → "🦊 שועל סקרן"), so the owner
// report reads like people, not hex. The same code always gets the same name; the code itself rotates
// daily, so the name names no one.
const ANIMALS = [
  ['🦊', 'שועל'], ['🐻', 'דוב'], ['🦁', 'אריה'], ['🐘', 'פיל'], ['🦉', 'ינשוף'], ['🐢', 'צב'], ['🐬', 'דולפין'], ['🦒', 'ג׳ירף'],
  ['🐒', 'קוף'], ['🐧', 'פינגווין'], ['🦘', 'קנגורו'], ['🐨', 'קואלה'], ['🐯', 'נמר'], ['🐰', 'ארנב'], ['🦔', 'קיפוד'], ['🐿️', 'סנאי'],
  ['🦜', 'תוכי'], ['🐳', 'לווייתן'], ['🐙', 'תמנון'], ['🦋', 'פרפר'], ['🦅', 'נשר'], ['🦄', 'חד־קרן'], ['🐊', 'תנין'], ['🦩', 'פלמינגו'],
  ['🐫', 'גמל'], ['🦌', 'צבי'], ['🐺', 'זאב'], ['🦫', 'בונה'], ['🦕', 'דינוזאור'], ['🦀', 'סרטן'], ['🐌', 'שבלול'], ['🦭', 'כלב ים'],
]
const TRAITS = ['סקרן', 'שמח', 'אמיץ', 'חכם', 'זריז', 'שובב', 'חולמני', 'נלהב', 'רגוע', 'מצחיק', 'נדיב', 'חרוץ',
  'יצירתי', 'מתוק', 'נועז', 'שקט', 'עליז', 'ממושקף', 'ספורטיבי', 'מוזיקלי', 'מסודר', 'פזיז', 'נבון', 'מנומס']

export function visitorName(code) {
  const n = parseInt(String(code || '').slice(0, 6), 16)
  if (!Number.isFinite(n)) return null
  const [emoji, animal] = ANIMALS[n % ANIMALS.length]
  return { emoji, name: `${animal} ${TRAITS[Math.floor(n / ANIMALS.length) % TRAITS.length]}` }
}
