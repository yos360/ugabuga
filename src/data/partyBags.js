// Birthday party bags (/birthday/party-bags): what goes in a bag by age and budget.
// Prices are rough per-item estimates in shekels (store or home-made), used only to suggest a sample bag.

export const BAG_AGES = [
  { id: 'toddler', label: 'גיל 2–3', emoji: '🧸' },
  { id: 'gan', label: 'גן (4–6)', emoji: '🎈' },
  { id: 'young', label: 'כיתות א–ג', emoji: '✏️' },
  { id: 'older', label: 'כיתות ד–ו', emoji: '🎯' },
]

export const BAG_BUDGETS = [
  { id: 'low', label: 'עד 10 ₪', max: 10 },
  { id: 'mid', label: 'עד 20 ₪', max: 20 },
  { id: 'high', label: 'עד 35 ₪', max: 35 },
]

// smallParts: may contain pieces small enough to choke on — never offered for ages 2–3.
// plastic / sweet: hidden when the "no plastic and no sweets" filter is on.
const item = (id, emoji, name, ages, price, kind, extra = {}) => ({ id, emoji, name, ages, price, kind, plastic: false, sweet: false, smallParts: false, ...extra })

// Listed in order of preference: the sample bag picks from the top down.
export const BAG_ITEMS = [
  item('made-at-party', '🎨', 'היצירה שהילדים הכינו במסיבה', ['toddler', 'gan', 'young', 'older'], 0, 'craft', { note: 'הכי זול והכי אישי: כל ילד לוקח הביתה את מה שהוא עשה.' }),
  item('crown', '👑', 'כתר יום הולדת שגזרו וצבעו', ['toddler', 'gan'], 0, 'craft', { to: '/printables/birthday-crown' }),
  item('coloring', '🖍️', 'חוברת צביעה מודפסת בנושא המסיבה', ['gan', 'young'], 1, 'paper', { to: '/printables/coloring' }),
  item('puzzles', '🧩', 'חוברת מבוכים, תפזורות וחידות מודפסת', ['young', 'older'], 1, 'paper', { to: '/printables' }),
  item('photo', '📸', 'תמונה מהמסיבה במסגרת קרטון', ['toddler', 'gan', 'young', 'older'], 2, 'craft', { note: 'מדפיסים בבית ושולחים למחרת עם הילד לגן או לכיתה.' }),
  item('bookmark', '🔖', 'סימנייה עם השם של הילד', ['young', 'older'], 1, 'paper'),
  item('board-book', '📘', 'ספר קרטון קטן', ['toddler'], 12, 'book'),
  item('thick-crayons', '🖍️', 'צבעי שעווה עבים', ['toddler', 'gan'], 6, 'stationery'),
  item('stickers', '⭐', 'דף מדבקות בנושא המסיבה', ['gan', 'young'], 4, 'stationery', { smallParts: true }),
  item('pencil', '✏️', 'עיפרון מעוצב ומחק', ['young', 'older'], 4, 'stationery'),
  item('notebook', '📒', 'מחברת קטנה לציור או לסודות', ['young', 'older'], 6, 'stationery'),
  item('markers', '🖊️', 'סט טושים קטן', ['gan', 'young'], 8, 'stationery', { plastic: true }),
  item('seeds', '🌱', 'עציץ קטן עם זרעי שעועית לגידול', ['gan', 'young', 'older'], 6, 'nature', { note: 'שעועית נובטת תוך כמה ימים על צמר גפן רטוב — ילדים אוהבים לראות את זה.' }),
  item('chalk', '🖍️', 'גירים עבים לציור על המדרכה', ['gan', 'young'], 6, 'outdoor'),
  item('bubbles', '🫧', 'בקבוקון בועות סבון', ['toddler', 'gan', 'young'], 5, 'outdoor', { plastic: true, note: 'לקטנים — רק בקבוק עם מכסה שנסגר חזק, ומשחקים בהשגחה.' }),
  item('sand-toys', '🪣', 'דלי וכף קטנים לארגז החול', ['toddler'], 7, 'outdoor', { plastic: true }),
  item('soft-ball', '⚽', 'כדור רך וגדול', ['toddler', 'gan'], 8, 'outdoor', { plastic: true }),
  item('magnifier', '🔍', 'זכוכית מגדלת לחוקרים צעירים', ['gan', 'young'], 5, 'nature', { plastic: true }),
  item('play-dough', '🟣', 'בצק משחק ביתי בקופסה קטנה', ['gan', 'young'], 3, 'craft', { note: 'מכינים בבית מקמח, מלח, מים ושמן — בלי לאכול!' }),
  item('finger-puppet', '🐸', 'בובת אצבע', ['gan'], 6, 'game', { smallParts: true }),
  item('jump-rope', '🪢', 'חבל קפיצה', ['young', 'older'], 8, 'outdoor', { plastic: true }),
  item('frisbee', '🥏', 'פריזבי קטן', ['gan', 'young', 'older'], 6, 'outdoor', { plastic: true }),
  item('small-book', '📗', 'ספר קריאה דק', ['young', 'older'], 15, 'book'),
  item('card-game', '🃏', 'חפיסת קלפים או משחק קלפים קטן', ['young', 'older'], 10, 'game'),
  item('beads', '📿', 'ערכת חרוזים להכנת צמיד', ['older'], 8, 'craft', { plastic: true, smallParts: true }),
  item('yoyo', '🪀', 'יו־יו', ['older'], 6, 'game', { plastic: true, smallParts: true }),
  item('cookie', '🍪', 'עוגייה ביתית עטופה', ['gan', 'young', 'older'], 2, 'treat', { sweet: true, note: 'בודקים אלרגיות מראש, ומדביקים פתק עם הרכיבים.' }),
  item('one-treat', '🍫', 'ממתק אחד קטן (לא סוכרייה קשה)', ['gan', 'young', 'older'], 3, 'treat', { sweet: true, smallParts: true }),
]

export const itemsFor = (age, { budgetMax = Infinity, clean = false } = {}) =>
  BAG_ITEMS.filter(i => i.ages.includes(age) && i.price <= budgetMax && !(clean && (i.plastic || i.sweet)) && !(age === 'toddler' && i.smallParts))

// A sample bag: one "main" item (the priciest that takes up to ~60% of the budget), then up to three
// more from the top of the list while the total stays inside the budget. One free keepsake at most.
export function sampleBag(age, budgetMax, clean = false) {
  const options = itemsFor(age, { budgetMax, clean })
  const byPrice = options.filter(i => i.price > 0).sort((a, b) => b.price - a.price)
  const main = byPrice.find(i => i.price <= budgetMax * 0.6) || byPrice[byPrice.length - 1]
  const bag = main ? [main] : []
  let total = main ? main.price : 0, free = 0
  for (const i of options) {
    if (i === main) continue
    if (bag.length === 4) break
    if (i.price === 0 && free === 1) continue
    if (total + i.price > budgetMax) continue
    bag.push(i)
    total += i.price
    if (i.price === 0) free++
  }
  return { items: bag, total }
}
