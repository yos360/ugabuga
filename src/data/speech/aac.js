// Data for /speech/aac — Hebrew AAC (תקשורת תומכת וחליפית) boards: a core-vocabulary board,
// topic boards and the symbols they share. Every picture is an emoji or one of our own simple
// drawings ("svg:<name>", drawn in src/pages/speech/aacPictograms.jsx) — no PCS/Boardmaker/ARASAAC.
//
// Item: { id, w, e, c, say? }
//   w    the word, plain (no niqqud). Gendered words: { m, f, b } — b is the shared form ("צריך/ה").
//   e    emoji or 'svg:<name>'
//   c    category id (CATEGORIES) — the colour of the cell
//   say  what the device voice should read when the plain word is ambiguous (niqqud), optional.
//        For gendered words it may be { m, f }.

// Colour coding: a modified Fitzgerald key — a common convention on AAC boards, not a standard.
// [stroke, fill]
export const CATEGORIES = [
  { id: 'people', label: 'אנשים', desc: 'אני, אתה, את, אנחנו, שלי', color: ['#a16207', '#fef3c7'], name: 'צהוב' },
  { id: 'verbs', label: 'פעולות', desc: 'רוצה, ללכת, לאכול, לפתוח', color: ['#15803d', '#dcfce7'], name: 'ירוק' },
  { id: 'desc', label: 'תיאורים', desc: 'עוד, טוב, גדול, חם', color: ['#1d4ed8', '#dbeafe'], name: 'כחול' },
  { id: 'nouns', label: 'דברים ומקומות', desc: 'לחם, כדור, מיטה', color: ['#c2410c', '#ffedd5'], name: 'כתום' },
  { id: 'social', label: 'מילים חברתיות', desc: 'כן, לא, די, עזרה, תודה', color: ['#be185d', '#fce7f3'], name: 'ורוד' },
  { id: 'questions', label: 'שאלות', desc: 'מה, איפה, מי, מתי', color: ['#7e22ce', '#f3e8ff'], name: 'סגול' },
  { id: 'place', label: 'מקום וזמן', desc: 'פה, שם, עכשיו, אחר כך', color: ['#475569', '#f1f5f9'], name: 'אפור' },
]
export const categoryById = Object.fromEntries(CATEGORIES.map(c => [c.id, c]))

const G = (m, f, b) => ({ m, f, b })

export const ITEMS = [
  // people (yellow)
  { id: 'i', w: 'אני', e: '🙋', c: 'people' },
  { id: 'you-m', w: 'אתה', e: 'svg:youM', c: 'people' },
  { id: 'you-f', w: 'את', e: 'svg:youF', c: 'people', say: 'אַתְּ' },
  { id: 'we', w: 'אנחנו', e: '🧑‍🤝‍🧑', c: 'people' },
  { id: 'mine', w: 'שלי', e: 'svg:mine', c: 'people' },
  { id: 'this', w: 'זה', e: '👉', c: 'people' },
  { id: 'mom', w: 'אמא', e: '👩', c: 'people' },
  { id: 'dad', w: 'אבא', e: '👨', c: 'people' },
  { id: 'brother', w: 'אח', e: '👦', c: 'people' },
  { id: 'sister', w: 'אחות', e: '👧', c: 'people' },
  { id: 'grandma', w: 'סבתא', e: '👵', c: 'people' },
  { id: 'grandpa', w: 'סבא', e: '👴', c: 'people' },
  { id: 'teacher', w: 'גננת', e: '🧑‍🏫', c: 'people' },
  { id: 'friends', w: 'חברים', e: '👫', c: 'people' },

  // verbs (green)
  { id: 'want', w: 'רוצה', e: '🤲', c: 'verbs' },
  { id: 'need', w: G('צריך', 'צריכה', 'צריך/ה'), e: '❗', c: 'verbs' },
  { id: 'like', w: G('אוהב', 'אוהבת', 'אוהב/ת'), e: '❤️', c: 'verbs' },
  { id: 'feel', w: G('מרגיש', 'מרגישה', 'מרגיש/ה'), e: '💭', c: 'verbs' },
  { id: 'go', w: 'ללכת', e: '🚶', c: 'verbs' },
  { id: 'play', w: 'לשחק', e: '🎲', c: 'verbs' },
  { id: 'eat', w: 'לאכול', e: '🍽️', c: 'verbs' },
  { id: 'drink', w: 'לשתות', e: '🥤', c: 'verbs' },
  { id: 'out', w: 'לצאת', e: '🚪', c: 'verbs' },
  { id: 'open', w: 'לפתוח', e: 'svg:open', c: 'verbs' },
  { id: 'close', w: 'לסגור', e: 'svg:close', c: 'verbs' },
  { id: 'put', w: 'לשים', e: 'svg:put', c: 'verbs' },
  { id: 'give', w: 'לתת', e: 'svg:give', c: 'verbs' },
  { id: 'look', w: 'להסתכל', e: '👀', c: 'verbs' },
  { id: 'sit', w: 'לשבת', e: '🪑', c: 'verbs' },
  { id: 'listen', w: 'לשמוע', e: '👂', c: 'verbs' },
  { id: 'sleep', w: 'לישון', e: '🛌', c: 'verbs' },
  { id: 'draw', w: 'לצייר', e: '🎨', c: 'verbs' },
  { id: 'sing', w: 'לשיר', e: '🎵', c: 'verbs' },
  { id: 'cut', w: 'לגזור', e: '✂️', c: 'verbs' },
  { id: 'wait', w: 'לחכות', e: '⏳', c: 'verbs' },
  { id: 'wash', w: 'לשטוף ידיים', e: '🧼', c: 'verbs' },
  { id: 'brush', w: 'לצחצח שיניים', e: '🪥', c: 'verbs' },
  { id: 'dress', w: 'להתלבש', e: '👕', c: 'verbs' },

  // descriptors (blue)
  { id: 'more', w: 'עוד', e: '➕', c: 'desc' },
  { id: 'good', w: 'טוב', e: '👍', c: 'desc' },
  { id: 'bad', w: 'לא טוב', e: '👎', c: 'desc' },
  { id: 'big', w: 'גדול', e: 'svg:big', c: 'desc' },
  { id: 'small', w: 'קטן', e: 'svg:small', c: 'desc' },
  { id: 'hot', w: 'חם', e: '🔥', c: 'desc' },
  { id: 'cold', w: 'קר', e: '❄️', c: 'desc' },
  { id: 'tired', w: G('עייף', 'עייפה', 'עייף/ה'), e: '🥱', c: 'desc' },
  { id: 'tasty', w: 'טעים', e: '😋', c: 'desc' },
  { id: 'happy', w: G('שמח', 'שמחה', 'שמח/ה'), e: '😀', c: 'desc' },
  { id: 'sad', w: G('עצוב', 'עצובה', 'עצוב/ה'), e: '😢', c: 'desc' },
  { id: 'angry', w: G('כועס', 'כועסת', 'כועס/ת'), e: '😠', c: 'desc' },
  { id: 'scared', w: G('מפחד', 'מפחדת', 'מפחד/ת'), e: '😨', c: 'desc' },
  { id: 'calm', w: G('רגוע', 'רגועה', 'רגוע/ה'), e: '😌', c: 'desc' },
  { id: 'surprised', w: G('מופתע', 'מופתעת', 'מופתע/ת'), e: '😮', c: 'desc' },
  { id: 'hurts', w: 'כואב לי', e: '🤕', c: 'desc' },
  { id: 'too-hot', w: 'חם לי', e: '🥵', c: 'desc' },
  { id: 'too-cold', w: 'קר לי', e: '🥶', c: 'desc' },

  // nouns (orange)
  { id: 'bread', w: 'לחם', e: '🍞', c: 'nouns' },
  { id: 'water', w: 'מים', e: '💧', c: 'nouns' },
  { id: 'milk', w: 'חלב', e: '🥛', c: 'nouns' },
  { id: 'apple', w: 'תפוח', e: '🍎', c: 'nouns' },
  { id: 'banana', w: 'בננה', e: '🍌', c: 'nouns' },
  { id: 'egg', w: 'ביצה', e: '🥚', c: 'nouns' },
  { id: 'pasta', w: 'פסטה', e: '🍝', c: 'nouns' },
  { id: 'cheese', w: 'גבינה', e: '🧀', c: 'nouns' },
  { id: 'cookie', w: 'עוגייה', e: '🍪', c: 'nouns' },
  { id: 'ball', w: 'כדור', e: '⚽', c: 'nouns' },
  { id: 'blocks', w: 'קוביות', e: '🧱', c: 'nouns' },
  { id: 'teddy', w: 'דובי', e: '🧸', c: 'nouns' },
  { id: 'car', w: 'מכונית', e: '🚗', c: 'nouns' },
  { id: 'puzzle', w: 'פאזל', e: '🧩', c: 'nouns' },
  { id: 'bubbles', w: 'בועות', e: 'svg:bubbles', c: 'nouns' },
  { id: 'book', w: 'ספר', e: '📖', c: 'nouns' },
  { id: 'crayons', w: 'צבעים', e: '🖍️', c: 'nouns' },
  { id: 'yard', w: 'חצר', e: '🌳', c: 'nouns' },
  { id: 'bag', w: 'תיק', e: '🎒', c: 'nouns' },
  { id: 'circle', w: 'מפגש', e: 'svg:circle', c: 'nouns' },
  { id: 'snack', w: 'ארוחת עשר', e: '🥪', c: 'nouns' },
  { id: 'toilet', w: 'שירותים', e: '🚽', c: 'nouns' },
  { id: 'bed', w: 'מיטה', e: '🛏️', c: 'nouns' },
  { id: 'sofa', w: 'ספה', e: '🛋️', c: 'nouns' },
  { id: 'tv', w: 'טלוויזיה', e: '📺', c: 'nouns' },
  { id: 'phone', w: 'טלפון', e: '📱', c: 'nouns' },
  { id: 'home', w: 'הביתה', e: '🏠', c: 'nouns' },
  { id: 'bath', w: 'אמבטיה', e: '🛁', c: 'nouns' },
  { id: 'shower', w: 'מקלחת', e: '🚿', c: 'nouns' },
  { id: 'towel', w: 'מגבת', e: 'svg:towel', c: 'nouns' },
  { id: 'soap', w: 'סבון', e: '🧴', c: 'nouns' },
  { id: 'duck', w: 'ברווז', e: '🦆', c: 'nouns' },
  { id: 'clothes', w: 'בגדים', e: '👚', c: 'nouns' },
  { id: 'hug', w: 'חיבוק', e: '🤗', c: 'nouns' },

  // social (pink)
  { id: 'yes', w: 'כן', e: '✅', c: 'social' },
  { id: 'no', w: 'לא', e: '❌', c: 'social' },
  { id: 'stop', w: 'די', e: '✋', c: 'social', say: 'דַּי' },
  { id: 'help', w: 'עזרה', e: '🤝', c: 'social' },
  { id: 'done', w: 'סיימתי', e: '🏁', c: 'social' },
  { id: 'hello', w: 'שלום', e: '👋', c: 'social' },
  { id: 'thanks', w: 'תודה', e: '😊', c: 'social' },
  { id: 'please', w: 'בבקשה', e: '🙏', c: 'social' },
  { id: 'my-turn', w: 'תורי', e: 'svg:myTurn', c: 'social' },
  { id: 'your-turn', w: 'תורך', e: 'svg:yourTurn', c: 'social' },
  { id: 'again', w: 'עוד פעם', e: '🔁', c: 'social' },
  { id: 'break', w: 'הפסקה', e: '⏸️', c: 'social' },

  // questions (purple)
  { id: 'what', w: 'מה', e: '❓', c: 'questions' },
  { id: 'where', w: 'איפה', e: '🔍', c: 'questions' },
  { id: 'who', w: 'מי', e: '👤', c: 'questions' },
  { id: 'when', w: 'מתי', e: '🕒', c: 'questions' },

  // place and time (grey)
  { id: 'here', w: 'פה', e: '👇', c: 'place' },
  { id: 'there', w: 'שם', e: 'svg:there', c: 'place', say: 'שָׁם' },
  { id: 'now', w: 'עכשיו', e: 'svg:now', c: 'place' },
  { id: 'later', w: 'אחר כך', e: 'svg:later', c: 'place' },
]
export const itemById = Object.fromEntries(ITEMS.map(i => [i.id, i]))

// The core board: 6 columns × 8 rows, columns listed right to left (Hebrew reading order), so a
// sentence is built from right to left: who → does what → how → question/place → social words.
// Every word keeps its place on screen and on paper (motor planning).
export const CORE_COLUMNS = [
  ['i', 'you-m', 'you-f', 'we', 'mine', 'this', 'mom', 'dad'],
  ['want', 'need', 'like', 'go', 'play', 'eat', 'drink', 'out'],
  ['open', 'close', 'put', 'give', 'look', 'sit', 'listen', 'sleep'],
  ['more', 'good', 'bad', 'big', 'small', 'hot', 'cold', 'tired'],
  ['what', 'where', 'who', 'when', 'here', 'there', 'now', 'later'],
  ['yes', 'no', 'stop', 'help', 'done', 'hello', 'thanks', 'please'],
]
export const CORE_ROWS = 8
// Row-major (right to left, top to bottom) for laying out a grid.
export const CORE_GRID = Array.from({ length: CORE_ROWS }, (_, r) => CORE_COLUMNS.map(col => col[r]))

// Topic boards: 4 × 4 — a top row of core words that stay with the child on every board,
// then 12 words for the activity.
export const TOPICS = [
  { id: 'food', emoji: '🍽️', title: 'אוכל ושתייה', core: ['want', 'more', 'done', 'no'],
    items: ['eat', 'drink', 'tasty', 'bread', 'water', 'milk', 'apple', 'banana', 'egg', 'pasta', 'cheese', 'cookie'] },
  { id: 'play', emoji: '🧸', title: 'משחק', core: ['want', 'more', 'stop', 'no'],
    items: ['play', 'my-turn', 'your-turn', 'again', 'ball', 'blocks', 'teddy', 'car', 'puzzle', 'bubbles', 'book', 'crayons'] },
  { id: 'feelings', emoji: '💗', title: 'רגשות', core: ['i', 'feel', 'no', 'help'],
    items: ['happy', 'sad', 'angry', 'scared', 'tired', 'calm', 'surprised', 'hurts', 'too-hot', 'too-cold', 'hug', 'break'] },
  { id: 'school', emoji: '🏫', title: 'גן וכיתה', core: ['want', 'help', 'done', 'no'],
    items: ['draw', 'sing', 'cut', 'sit', 'wait', 'book', 'yard', 'bag', 'teacher', 'friends', 'circle', 'snack'] },
  { id: 'home', emoji: '🏠', title: 'בית', core: ['want', 'go', 'stop', 'no'],
    items: ['mom', 'dad', 'brother', 'sister', 'grandma', 'grandpa', 'bed', 'sofa', 'tv', 'phone', 'out', 'home'] },
  { id: 'bathroom', emoji: '🛁', title: 'אמבטיה ושירותים', core: ['want', 'help', 'done', 'no'],
    items: ['toilet', 'wash', 'bath', 'shower', 'towel', 'soap', 'brush', 'duck', 'dress', 'clothes', 'too-hot', 'too-cold'] },
]
export const topicById = Object.fromEntries(TOPICS.map(t => [t.id, t]))
export const topicGrid = t => [t.core, ...[0, 1, 2].map(r => t.items.slice(r * 4, r * 4 + 4))]

// The word as shown for a gender setting: 'm' (ילד), 'f' (ילדה) or 'b' (כללי, "צריך/ה").
export const wordOf = (item, gender = 'b') => typeof item.w === 'string' ? item.w : item.w[gender] || item.w.b
// What the device voice reads. The shared form "צריך/ה" can't be read aloud, so it reads the
// grammatical default (the masculine form), as Hebrew does for a general address.
export function spokenOf(item, gender = 'b') {
  const g = gender === 'f' ? 'f' : 'm'
  if (item.say) return typeof item.say === 'string' ? item.say : item.say[g]
  return typeof item.w === 'string' ? item.w : item.w[g]
}

// The question on a printed choice board, by who it is for.
export const CHOICE_QUESTION = { m: 'מה אתה רוצה?', f: 'מה את רוצה?', b: 'מה בא לך?' }

export const SOURCES = [
  { title: 'ASHA — Augmentative and Alternative Communication (Practice Portal)', url: 'https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/' },
  { title: 'Romski, M. & Sevcik, R. A. (2005). Augmentative communication and early intervention: Myths and realities. Infants & Young Children, 18(3), 174–185' },
  { title: 'Millar, D. C., Light, J. C. & Schlosser, R. W. (2006). The impact of augmentative and alternative communication intervention on the speech production of individuals with developmental disabilities: A research review. JSLHR, 49(2), 248–264' },
  { title: 'ISAAC ישראל — מהי תת״ח', url: 'https://isaac.org.il/%D7%AA%D7%A7%D7%A9%D7%95%D7%A8%D7%AA-%D7%AA%D7%95%D7%9E%D7%9B%D7%AA-%D7%95%D7%97%D7%9C%D7%99%D7%A4%D7%99%D7%AA-%D7%AA%D7%AA%D7%97/%D7%9E%D7%94%D7%99-%D7%AA%D7%AA%D7%97/' },
  { title: 'כל זכות — תקשורת תומכת וחלופית (AAC)', url: 'https://www.kolzchut.org.il/he/%D7%AA%D7%A7%D7%A9%D7%95%D7%A8%D7%AA_%D7%AA%D7%95%D7%9E%D7%9B%D7%AA_%D7%95%D7%97%D7%9C%D7%95%D7%A4%D7%99%D7%AA_(AAC)' },
]
