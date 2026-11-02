// Pure helpers for the shared shopping list (src/pages/tools/ShoppingList.jsx), kept here so tests can run them.

// One tap adds these; the first row is what most Israeli families buy every week.
export const QUICK_ITEMS = ['חלב', 'לחם', 'ביצים', 'גבינה לבנה', 'עגבניות', 'מלפפונים', 'בננות', 'תפוחים', 'קוטג׳', 'יוגורט', 'עוף', 'אורז', 'פסטה', 'שמן', 'נייר טואלט', 'מגבונים']

// Aisle groups so the list reads in the order of a walk through the supermarket.
export const AISLES = [
  { key: 'produce', label: 'ירקות ופירות', emoji: '🥬', words: /עגבני|מלפפו|בצל|שום|גזר|תפו״א|תפוחי אדמה|פלפל|חסה|כרוב|קישוא|חציל|ברוקולי|כרובית|לימון|בננ|תפוח|תפוז|אבטיח|מלון|ענב|אגס|אפרסק|תות|אבוקדו|פטרוזיליה|כוסברה|שמיר|נענע|בטטה|דלעת|פירות|ירקות/ },
  { key: 'dairy', label: 'חלב וביצים', emoji: '🥛', words: /חלב|גבינ|קוטג|יוגורט|לבן|שמנת|חמאה|ביצים|ביצה|מעדנ|אשל|לבנה|מילקי/ },
  { key: 'bakery', label: 'לחם ומאפים', emoji: '🍞', words: /לחם|לחמני|פיתות|פיתה|חלה|חלות|באגט|טורטיי|קרואסון|עוגה|עוגיות|קרקר/ },
  { key: 'meat', label: 'בשר, עוף ודגים', emoji: '🍗', words: /עוף|חזה|שניצל|כרעיים|פרגית|בשר|טחון|נקניק|המבורגר|קבב|דג|סלמון|טונה|אמנון|הודו/ },
  { key: 'pantry', label: 'מזווה', emoji: '🥫', words: /אורז|פסטה|ספגטי|קמח|סוכר|מלח|שמן|קטשופ|מיונז|חומוס|טחינה|רסק|שימורי|קפה|תה|דגני|קורנפלקס|ריבה|שוקולד|ממרח|במבה|ביסלי|חטיף|אטריות|קוסקוס|עדשים|שעועית|תבלינ|פפריקה|כמון/ },
  { key: 'frozen', label: 'קפואים', emoji: '🧊', words: /קפוא|גלידה|בורקס|ארטיק|שעועית ירוקה קפואה/ },
  { key: 'drinks', label: 'שתייה', emoji: '🧃', words: /מים|סודה|מיץ|קולה|שתייה|בירה|יין|פטל/ },
  { key: 'home', label: 'ניקיון ובית', emoji: '🧻', words: /נייר|טואלט|מגבונ|סבון|שמפו|מרכך|אקונומיקה|נוזל|כביסה|כלים|ספוג|שקיות|אלומיניום|ניילון|משחת שיניים|מברשת|טיטולים|חיתולים|דאודורנט/ },
]
export const OTHER_AISLE = { key: 'other', label: 'עוד', emoji: '🛒' }

export const aisleOf = text => AISLES.find(a => a.words.test(text)) || OTHER_AISLE

// Open items grouped by aisle (in walk order, empty aisles dropped), then everything already bought.
export function arrangeItems(items) {
  const open = items.filter(i => !i.done), done = items.filter(i => i.done)
  const groups = [...AISLES, OTHER_AISLE].map(a => ({ ...a, items: open.filter(i => aisleOf(i.text).key === a.key) })).filter(g => g.items.length)
  return { groups, done, openCount: open.length }
}

// The same change the server makes, applied at once on this phone so a tap feels instant.
export function applyChange(list, op, { id, text } = {}) {
  const items = list.items || []
  if (op === 'add') return { ...list, items: [...items, { id, text, done: false }] }
  if (op === 'done' || op === 'undone') return { ...list, items: items.map(i => (i.id === id ? { ...i, done: op === 'done' } : i)) }
  if (op === 'remove') return { ...list, items: items.filter(i => i.id !== id) }
  if (op === 'clear_done') return { ...list, items: items.filter(i => !i.done) }
  if (op === 'rename') return { ...list, title: text }
  return list
}

// "חלב, לחם, ביצים" or one item per line → separate items ("ו" is not split: "מיץ ענבים ותפוזים" is one item).
export const splitItems = text => String(text || '').split(/\s*[\n,،;]\s*/).map(s => s.trim()).filter(Boolean).slice(0, 30)

export const shareText = (title, link) => `🛒 ${title} — הרשימה שלנו לסופר. כל אחד מוסיף ומסמן, והיא מתעדכנת אצל כולם בלייב:\n${link}`
