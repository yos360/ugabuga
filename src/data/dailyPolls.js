// "מה אתם אומרים?" — one light question a day on the home page (components/home/DailyPoll.jsx).
// Questions for parents and teachers about everyday family and kids' life: no right answer, nothing
// personal, nothing a child would have to reveal about themselves. 2–4 short options each.
// A poll with `from`/`to` (YYYY-MM-DD, Israel date, inclusive) wins on those days; otherwise the
// day's poll rotates through the undated list. Ids are permanent: never reuse or rename one.
export const DAILY_POLLS = [
  { id: 'hanukkah-latke-or-sufganiyah', from: '2026-12-05', to: '2026-12-12', q: 'לביבה או סופגנייה?', options: ['🥔 לביבה, ברור', '🍩 סופגנייה!', '😋 שתיהן, בלי לבחור'] },
  { id: 'hanukkah-vacation-plan', from: '2026-11-29', to: '2026-12-04', q: 'מה התוכנית לחופשת חנוכה?', options: ['🏠 בבית, עם יצירות ומשחקים', '🎪 קייטנה', '👵 אצל סבא וסבתא', '🚗 טיולים ויציאות'] },
  { id: 'hanukkah-gift-class', from: '2026-11-24', to: '2026-11-28', q: 'מתנה לגננת או למורה לחנוכה?', options: ['🎁 כן, מהוועד', '💌 רק כרטיס ברכה', '🙅 לא נהוג אצלנו'] },
  { id: 'screen-time-weekday', q: 'כמה זמן מסך יש לילדים ביום חול?', options: ['⏱️ פחות משעה', '🕐 שעה–שעתיים', '📱 יותר משעתיים', '🤷 תלוי ביום'] },
  { id: 'bedtime-story', q: 'מקריאים סיפור לפני השינה?', options: ['📖 כל ערב', '🌙 לפעמים', '🎧 שומעים סיפור מוקלט', '😴 נרדמים מהר מדי'] },
  { id: 'homework-help', q: 'עוזרים לילדים בשיעורי הבית?', options: ['✏️ כל יום', '🙋 רק כשמבקשים', '🧒 הם מסתדרים לבד'] },
  { id: 'friday-activity', q: 'מה עושים ביום שישי בבוקר?', options: ['🌳 יוצאים לגינה', '🥐 ארוחת בוקר משפחתית', '🎨 יצירה בבית', '🛒 קניות לשבת'] },
  { id: 'favorite-season', q: 'איזו עונה הילדים הכי אוהבים?', options: ['☀️ קיץ', '🍂 סתיו', '🌧️ חורף', '🌸 אביב'] },
  { id: 'printing-at-home', q: 'יש לכם מדפסת בבית?', options: ['🖨️ כן, וגם משתמשים', '🙈 יש, אבל בלי דיו', '🏫 מדפיסים בעבודה או בספרייה', '❌ אין'] },
  { id: 'pocket-money-age', q: 'מאיזה גיל דמי כיס?', options: ['👶 מגיל הגן', '🎒 מכיתה א׳', '🧮 מכיתה ד׳', '🙅 לא נותנים'] },
  { id: 'morning-rush', q: 'מה הכי קשה בבוקר?', options: ['😴 לקום', '👕 להתלבש', '🥣 לאכול', '👟 לצאת בזמן'] },
  { id: 'kids-chores', q: 'הילדים עוזרים בבית?', options: ['🧹 יש להם תפקידים קבועים', '🙂 כשמבקשים', '🫣 לא ממש'] },
  { id: 'board-games', q: 'משחקים במשחקי קופסה בבית?', options: ['🎲 כל שבוע', '🃏 בחגים ובחופשות', '📦 הם אוספים אבק'] },
  { id: 'birthday-where', q: 'איפה חוגגים יום הולדת לילדים?', options: ['🏠 בבית', '🎪 במקום עם מפעיל', '🌳 בפארק', '🏫 בגן או בכיתה'] },
  { id: 'reading-language', q: 'באיזו שפה הילדים הכי אוהבים לקרוא?', options: ['🇮🇱 עברית', '🇬🇧 אנגלית', '📚 גם וגם', '🤔 עוד לא קוראים'] },
  { id: 'kids-wake-time', q: 'מתי הילדים מתעוררים בשבת?', options: ['🌅 לפני 7', '☀️ בין 7 ל־8', '😴 אחרי 8', '🎉 מוקדם יותר מבחול!'] },
  { id: 'after-school', q: 'יש לילדים חוג אחרי הצהריים?', options: ['⚽ ספורט', '🎨 אמנות או מוזיקה', '🧩 יותר מחוג אחד', '🏡 אין, נחים בבית'] },
  { id: 'packed-snack', q: 'מה שמים בארוחת עשר?', options: ['🥪 כריך', '🍎 פירות וירקות', '🧀 משהו קטן ומהיר', '🔄 כל יום משהו אחר'] },
  { id: 'rainy-day', q: 'מה עושים ביום גשום בבית?', options: ['🎨 יצירה', '🧩 פאזלים ומשחקים', '🍪 אופים', '📺 סרט ופופקורן'] },
  { id: 'family-dinner', q: 'אוכלים ארוחת ערב משפחתית?', options: ['🍽️ כמעט כל ערב', '🗓️ כמה פעמים בשבוע', '🕯️ בעיקר בשישי'] },
  { id: 'learning-app', q: 'איך הילדים הכי אוהבים לתרגל?', options: ['📄 דף עבודה מודפס', '💻 משחק על המסך', '🗣️ חידון בעל פה', '🎲 משחק עם קוביות'] },
  { id: 'trip-length', q: 'כמה זמן נסיעה הילדים מחזיקים בלי "מתי מגיעים"?', options: ['⏱️ רבע שעה', '🕐 חצי שעה', '🚗 שעה ויותר', '😂 עוד לא יצאנו מהחנייה'] },
  { id: 'teacher-contact', q: 'איך הכי נוח לכם לקבל עדכונים מהגן או מבית הספר?', options: ['💬 וואטסאפ', '📧 מייל', '📱 אפליקציה של בית הספר', '🗣️ בשיחה'] },
  { id: 'kids-music', q: 'איזו מוזיקה מתנגנת אצלכם באוטו?', options: ['🎵 שירי ילדים', '📻 מה שההורים אוהבים', '🎤 מה שהילדים בוחרים', '🔇 שקט, בבקשה'] },
  { id: 'sleep-time-school', q: 'מתי הילדים הולכים לישון בימי לימודים?', options: ['🌙 לפני 20:00', '🕗 בין 20:00 ל־21:00', '🕘 אחרי 21:00'] },
  { id: 'favorite-craft', q: 'איזו יצירה הכי אהובה אצלכם?', options: ['✂️ גזירה והדבקה', '🖍️ צביעה', '🧱 בנייה מקרטון', '🎨 צבעי גואש'] },
  { id: 'holiday-favorite', q: 'איזה חג הילדים הכי מחכים לו?', options: ['🕎 חנוכה', '🎭 פורים', '🍷 פסח', '🍯 ראש השנה'] },
  { id: 'kids-pets', q: 'יש לכם חיית מחמד?', options: ['🐶 כלב', '🐱 חתול', '🐠 דגים או אחר', '🙏 הילדים מבקשים כל יום'] },
  { id: 'weekend-outing', q: 'מה הבילוי הכי אהוב בסוף השבוע?', options: ['🏞️ טבע וטיולים', '🏛️ מוזיאון', '🏖️ ים', '🛋️ להישאר בבית'] },
  { id: 'kids-question', q: 'מה השאלה שהילדים הכי הרבה שואלים?', options: ['❓ "למה?"', '🍫 "אפשר ממתק?"', '📱 "אפשר טלפון?"', '🚗 "מתי מגיעים?"'] },
]

// Israel calendar date "YYYY-MM-DD".
export const israelDate = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(d)

export function pollForDate(date = israelDate()) {
  const dated = DAILY_POLLS.find(p => p.from && p.from <= date && date <= p.to)
  if (dated) return dated
  const plain = DAILY_POLLS.filter(p => !p.from)
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000)
  return plain[((day % plain.length) + plain.length) % plain.length]
}

// Rounded percentages that add up to 100 (largest remainder), for the result bars.
export function percentages(counts, n) {
  const total = counts.reduce((a, b) => a + b, 0)
  if (!total) return Array(n).fill(0)
  const raw = counts.map(c => (c / total) * 100), floor = raw.map(Math.floor)
  let left = 100 - floor.reduce((a, b) => a + b, 0)
  raw.map((r, i) => [r - floor[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { floor[i]++; left-- } })
  return floor
}
