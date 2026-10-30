// Unseen reading tests (אנסין): levels, question skills and the shape of a test.
// Texts and questions are original (Bagrut texts are copyrighted) — written "in the style of" each level.
//
// A test: { slug, lang: 'en'|'he', level, title, genre, topic, summary (Hebrew, one sentence),
//   texts: [{ title?, paragraphs: [string], table?: { caption, head: [..], rows: [[..]] } }],
//   glossary?: [[word, Hebrew]] (English only), writing?: { prompt, words: [min, max] },
//   questions: [{ type: 'mc'|'open', skill, q, options?: [4], answer: index | model answer,
//     explain (Hebrew), evidence (exact words from the text, highlighted after answering), text?: index }] }
export const SKILLS = {
  detail: 'איתור מידע',
  inference: 'הסקת מסקנות',
  vocab: 'משמעות מילה',
  reference: 'הפניה (למה המילה מתייחסת)',
  'main-idea': 'רעיון מרכזי',
  purpose: 'מטרה ומבנה',
  opinion: 'עובדה, דעה ועמדה',
  compare: 'השוואה בין טקסטים',
  table: 'קריאת טבלה ותרשים',
}

export const UNSEEN_LEVELS = [
  { id: 'g3', lang: 'en', path: 'grade-3', name: 'כיתה ג׳', short: 'ג׳', words: [25, 60], questions: [4, 6], minutes: 15,
    about: 'הקריאה הראשונה באנגלית: כמה משפטים קצרים על נושא מוכר (משפחה, חיות, צבעים), מילון מילים מלא, שאלות התאמה ובחירה ושאלת העתקה של מילה אחת.' },
  { id: 'g4', lang: 'en', path: 'grade-4', name: 'כיתה ד׳', short: 'ד׳', words: [45, 85], questions: [5, 7], minutes: 15,
    about: 'טקסט קצר בזמן הווה — כרטיס היכרות, הזמנה או תיאור — עם מילון מילים, שאלות אמריקאיות ושאלת העתקה קצרה.' },
  { id: 'g5', lang: 'en', path: 'grade-5', name: 'כיתה ה׳', short: 'ה׳', words: [70, 120], questions: [6, 8], minutes: 20,
    about: 'האנסין הראשון: טקסט קצרצר במשפטים פשוטים בזמן הווה, עם מילון מילים, שאלות אמריקאיות ושאלת העתקה אחת.' },
  { id: 'g6', lang: 'en', path: 'grade-6', name: 'כיתה ו׳', short: 'ו׳', words: [100, 150], questions: [6, 8], minutes: 20,
    about: 'טקסט קצר — סיפור, מכתב, מודעה או טקסט מידע — עם שאלות אמריקאיות, איתור מידע ושאלה פתוחה קצרה, כמו לקראת המיצ״ב.' },
  { id: 'g7', lang: 'en', path: 'grade-7', name: 'כיתה ז׳', short: 'ז׳', words: [120, 190], questions: [7, 9], minutes: 25,
    about: 'טקסט קצר בשפה פשוטה — סיפור אישי או טקסט מידע — עם שאלות אמריקאיות ושאלות העתקה קצרות.' },
  { id: 'g8', lang: 'en', path: 'grade-8', name: 'כיתה ח׳', short: 'ח׳', words: [180, 250], questions: [8, 10], minutes: 30,
    about: 'טקסט באורך בינוני, אוצר מילים של Band I ותחילת Band II, שאלות אמריקאיות, השלמת משפטים ושאלות "למה המילה מתייחסת".' },
  { id: 'g9', lang: 'en', path: 'grade-9', name: 'כיתה ט׳', short: 'ט׳', words: [220, 310], questions: [9, 11], minutes: 35,
    about: 'ברמת מבחן סוף חטיבת הביניים (A2): שאלות סגורות ופתוחות בערך חצי־חצי, איתור מידע, הסקה ומשמעות מילה בהקשר.' },
  { id: 'mod-a', lang: 'en', path: 'module-a', name: '3 יחידות (Module A)', short: '3 יח״ל', words: [170, 215], texts: 2, questions: [13, 16], minutes: 75,
    about: 'שני טקסטים קצרים, כמו בשאלון של 3 יחידות לימוד, עם שאלות ישירות על כל אחד מהם.' },
  { id: 'mod-c', lang: 'en', path: 'module-c', name: '4 יחידות (Module C)', short: 'Module C', words: [250, 320], questions: [8, 10], minutes: 60,
    about: 'טקסט אחד עד כ־300 מילים — סיפור אישי, כתבה או טקסט מידע — עם 8–10 שאלות ומטלת כתיבה קצרה.' },
  { id: 'mod-e', lang: 'en', path: 'module-e', name: '4–5 יחידות (Module E)', short: 'Module E', words: [330, 420], questions: [9, 11], minutes: 70,
    about: 'טקסט עד כ־400 מילים עם רשימת מילים מוסברות (Glossary), שאלות הבנה ושאלות אוצר מילים בהקשר.' },
  { id: 'mod-g', lang: 'en', path: 'module-g', name: '5 יחידות (Module G)', short: 'Module G', words: [420, 530], questions: [8, 10], minutes: 75,
    about: 'הטקסט הארוך והמורכב ביותר: מאמר, כתבה עיונית או טקסט טיעון, עם שאלות היסק, עמדת הכותב ומטרת פסקאות, ומטלת חיבור.' },
  { id: 'g7', lang: 'he', path: 'grade-7', name: 'כיתה ז׳', short: 'ז׳', words: [300, 520], texts: 2, questions: [8, 11], minutes: 45,
    about: 'טקסט מידע וטקסט בלתי רציף (טבלה או תרשים) עם שאלות סגורות ופתוחות — איתור מידע, משמעות מילה, הסקה והשוואה.' },
  { id: 'g8', lang: 'he', path: 'grade-8', name: 'כיתה ח׳', short: 'ח׳', words: [380, 650], texts: [2, 3], questions: [9, 12], minutes: 50,
    about: 'טקסט עיוני או טיעוני וטקסט בלתי רציף — זיהוי עמדה וטיעונים, מטרת פסקה, הסקה ושאלת השוואה בין הטקסטים.' },
  { id: 'g9', lang: 'he', path: 'grade-9', name: 'כיתה ט׳', short: 'ט׳', words: [450, 800], texts: [2, 3], questions: [10, 14], minutes: 60,
    about: 'שניים־שלושה טקסטים — עיוני, טיעוני וטקסט בלתי רציף (טבלה) — עם שאלות סגורות ופתוחות, כמו במבחנים של סוף כיתה ט׳.' },
  { id: 'bagrut', lang: 'he', path: 'bagrut', name: 'בגרות בלשון', short: 'בגרות', words: [900, 1400], texts: 3, questions: [9, 13], minutes: 90,
    about: 'כמו בפרק ההבנה של בגרות בלשון: מאמר עיוני, מאמר טיעון וטקסט בלתי רציף, שאלות הבנה ופרשנות, ומטלת כתיבה ממזגת.' },
]
export const levelOf = (lang, id) => UNSEEN_LEVELS.find(l => l.lang === lang && l.id === id)
