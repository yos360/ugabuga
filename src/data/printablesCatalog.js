// Printables catalog and "what else to print" recommendations. Pure data and functions (no React):
// recommendPrintables() returns Printable objects, so the same list can later feed a print basket.
//
// A Printable: { id, path, title, emoji, desc, type, category, topics: [], grades: [], pop }
//   path      the page's canonical address (recommendations never invent new URLs)
//   type      worksheet | reading | puzzle | coloring | craft | game | organizer | trivia
//   category  learning | creative | party | holiday | home
//   topics    math, letters, reading, english, thinking, motor, coloring, birthday, party, school,
//             home, nature, general, holidays, shabbat, parasha, hanukkah, purim, …
//   grades    0 = kindergarten, 1–6 = school grade; empty = any age
//   pop       0–10, a small nudge towards sheets people print most
import { categories, printableHref } from './printableCategories.js'
import { HOLIDAY_SHEETS, TOPICS } from './printableTopics.js'

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
const GRADE_NAMES = ['גן', 'א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳']
export const gradeName = g => GRADE_NAMES[g] || ''

// /printables sheets: topics come from the /printables topic chips; type, category and grades are added here.
const SHEET_EXTRA = {
  'math-worksheets': { type: 'worksheet', grades: range(0, 3), pop: 10 },
  'clock-worksheets': { type: 'worksheet', grades: range(1, 3), pop: 6 },
  'fractions-worksheets': { type: 'worksheet', grades: range(2, 5), pop: 6 },
  'count-and-write': { type: 'worksheet', grades: range(0, 1), pop: 5 },
  numbers: { type: 'worksheet', grades: range(0, 1), pop: 6 },
  sudoku: { type: 'puzzle', topics: ['thinking'], grades: range(1, 6), pop: 6 },
  letters: { type: 'worksheet', grades: range(0, 1), pop: 8 },
  'hebrew-letters': { type: 'worksheet', grades: range(0, 1), pop: 8 },
  'letter-strip': { type: 'organizer', grades: range(0, 1), pop: 4 },
  'multiplication-strips': { type: 'organizer', grades: range(2, 4), pop: 5 },
  'number-strip': { type: 'organizer', grades: range(0, 2), pop: 5 },
  'letter-flashcards': { type: 'worksheet', grades: range(0, 1), pop: 6 },
  'sensory-communication-cards': { type: 'organizer', grades: range(0, 2), pop: 5 },
  'word-tracing': { type: 'worksheet', grades: range(0, 1), pop: 5 },
  'match-word': { type: 'worksheet', grades: range(0, 2), pop: 4 },
  opposites: { type: 'worksheet', grades: range(1, 3), pop: 4 },
  synonyms: { type: 'worksheet', grades: range(2, 4), pop: 4 },
  'abc-letters': { type: 'worksheet', topics: ['english'], grades: range(1, 3), pop: 5 },
  'fine-motor': { type: 'worksheet', grades: [0], pop: 7 },
  mazes: { type: 'puzzle', topics: ['thinking'], grades: range(0, 3), pop: 9 },
  'find-differences': { type: 'puzzle', topics: ['thinking'], grades: range(0, 3), pop: 7 },
  'complete-pattern': { type: 'puzzle', topics: ['thinking'], grades: range(0, 2), pop: 4 },
  'silhouette-match': { type: 'puzzle', grades: [0, 1], pop: 3 },
  'cut-and-order': { type: 'craft', grades: [0, 1], pop: 3 },
  'hidden-object': { type: 'puzzle', grades: range(0, 2), pop: 4 },
  'missing-picture': { type: 'puzzle', grades: [0, 1], pop: 3 },
  'mixed-activities': { type: 'worksheet', grades: range(0, 2), pop: 4 },
  'dot-to-dot': { type: 'coloring', grades: range(0, 2), pop: 7 },
  coloring: { type: 'coloring', category: 'creative', pop: 10 },
  mandalas: { type: 'coloring', category: 'creative', grades: range(2, 6), pop: 7 },
  symmetry: { type: 'coloring', grades: range(1, 4), pop: 4 },
  'color-by-number': { type: 'coloring', grades: range(0, 3), pop: 7 },
  'color-by-answer': { type: 'coloring', grades: range(1, 4), pop: 6 },
  'color-by-letter': { type: 'coloring', grades: range(0, 1), pop: 5 },
  'roots-project': { type: 'organizer', grades: [6], pop: 3 },
  'class-schedule': { type: 'organizer' }, 'calendar-2027': { type: 'organizer' }, 'calendar-5787': { type: 'organizer' }, 'lined-paper': { type: 'organizer' },
  'class-newspaper': { type: 'craft', grades: range(2, 6) },
  'memory-game': { type: 'game', grades: range(0, 3), pop: 5 }, 'tic-tac-toe': { type: 'game', pop: 4 }, dominoes: { type: 'game', grades: range(0, 2), pop: 4 },
  'board-game': { type: 'game', pop: 4 }, 'fortune-teller': { type: 'craft', grades: range(1, 5), pop: 5 }, 'gift-box': { type: 'craft', pop: 3 },
  'birthday-crown': { type: 'craft', grades: range(0, 2), pop: 6 }, 'purim-masks': { type: 'craft', topics: ['purim'], pop: 6 },
}
// A sheet's category follows its most specific chip (a coloring page that is also under "birthday" is creative).
const CATEGORY_ORDER = [['math', 'learning'], ['letters', 'learning'], ['holidays', 'holiday'], ['birthday', 'party'], ['home', 'home'], ['motor', 'creative'], ['coloring', 'creative'], ['crafts', 'creative'], ['school', 'learning']]

function sheetPrintables() {
  return categories.map(c => {
    const chips = TOPICS.filter(t => t.slugs?.includes(c.slug)).map(t => t.id)
    const extra = SHEET_EXTRA[c.slug] || {}
    const topics = [...new Set([...chips.map(id => id === 'crafts' ? 'craft' : id), ...(extra.topics || [])])]
    const type = extra.type || (chips.includes('home') ? 'organizer' : chips.includes('birthday') ? 'craft' : 'worksheet')
    const category = extra.category || CATEGORY_ORDER.find(([id]) => chips.includes(id))?.[1] || 'creative'
    return { id: c.slug, path: printableHref(c), title: c.title, emoji: c.emoji, desc: c.desc, type, category, topics, grades: extra.grades || [], pop: extra.pop ?? 2 }
  })
}

const HOLIDAY_TOPIC = { 'rosh-hashana': 'rosh-hashana', sukkot: 'sukkot', hanukkah: 'hanukkah', 'tu-bishvat': 'tu-bishvat', pesach: 'pesach', 'yom-haatzmaut': 'yom-haatzmaut', 'lag-baomer': 'lag-baomer', shavuot: 'shavuot', purim: 'purim' }
function holidayPrintables() {
  return HOLIDAY_SHEETS.map(h => {
    const holiday = Object.keys(HOLIDAY_TOPIC).find(key => h.href.includes(`/${key}/`) || h.href.includes(`${key}-`)) || ''
    return { id: h.slug, path: h.href, title: h.title, emoji: h.emoji, desc: h.desc, type: h.href.endsWith('/worksheets') ? 'worksheet' : h.href.includes('masks') ? 'craft' : 'coloring', category: 'holiday', topics: ['holidays', HOLIDAY_TOPIC[holiday]].filter(Boolean), grades: range(0, 3), pop: 5 }
  }).filter(p => !categories.some(c => c.href === p.path))
}

const p = (id, path, title, emoji, desc, type, category, topics, grades = [], pop = 3) => ({ id, path, title, emoji, desc, type, category, topics, grades, pop })
// The crossword / word-search studio opens on a word pack chosen by ?pack= (and ?type=search for word search).
const PUZZLE_PACKS = [['nature', 'טבע ובעלי חיים', ['nature', 'general']], ['birthday', 'יום הולדת', ['birthday', 'party']], ['classroom', 'בית הספר', ['school']], ['general', 'ידע כללי', ['general', 'trivia']]]
const EXTRA = [
  ...range(1, 6).map(n => p(`math-grade-${n}`, `/math/grade-${n}`, `דפי עבודה בחשבון לכיתה ${gradeName(n)}`, '🔢', `תרגילים לפי נושאי הלימוד של כיתה ${gradeName(n)}, עם פתרונות.`, 'worksheet', 'learning', ['math'], [n], 7)),
  ...range(2, 6).map(n => p(`reading-grade-${n}`, `/learn/reading/grade-${n}`, `הבנת הנקרא לכיתה ${gradeName(n)}`, '📖', 'קטעי קריאה עם שאלות — להדפסה או לקריאה עם הקראה בקול.', 'reading', 'learning', ['reading'], [n], 6)),
  ...PUZZLE_PACKS.flatMap(([pack, name, topics]) => [
    p(`crossword-${pack}`, `/tools/crossword-maker?pack=${pack}`, `תשבץ בנושא ${name}`, '🧩', 'תשבץ מוכן להדפסה, עם דף פתרונות.', 'puzzle', 'learning', [...topics, 'thinking'], range(2, 6), 5),
    p(`word-search-${pack}`, `/tools/crossword-maker?type=search&pack=${pack}`, `תפזורת בנושא ${name}`, '🔎', 'מחפשים מילים בטבלה — דף מוכן להדפסה.', 'puzzle', 'learning', [...topics, 'letters'], range(1, 6), 5),
  ]),
  p('trivia-with-answers', '/trivia/with-answers', 'שאלות טריוויה עם תשובות', '❓', 'מאות שאלות לפי נושאים — להדפסה למסיבה, לכיתה או לטיול.', 'trivia', 'party', ['trivia', 'general', 'party', 'birthday', 'school'], range(2, 6), 6),
  p('bingo-maker', '/tools/bingo-maker', 'בינגו להדפסה', '🎱', 'כרטיסי בינגו עם מילים, מספרים או תמונות — למסיבה ולכיתה.', 'game', 'party', ['birthday', 'party', 'school'], range(0, 6), 6),
  p('treasure-hunt', '/treasure-hunt/ready', 'חפש את המטמון מוכן', '🗺️', 'רמזים מוכנים להדפסה — מסתירים ומתחילים לחפש.', 'game', 'party', ['birthday', 'party'], range(1, 6), 7),
  p('scavenger-hunt', '/tools/scavenger-hunt-maker', 'משחק משימות למסיבה', '🔍', 'רשימת משימות וחיפושים לקבוצה — בבית, בגן או בטיול.', 'game', 'party', ['birthday', 'party'], range(0, 4), 4),
  p('escape-rooms', '/tools/escape-rooms', 'חדר בריחה להדפסה', '🔐', 'חידות ומנעולים מוכנים — משחק קבוצתי למסיבה או לכיתה.', 'game', 'party', ['birthday', 'party', 'school', 'thinking'], range(2, 6), 5),
  p('logic-puzzles', '/logic-puzzles/kids', 'חידות היגיון לילדים', '🧠', 'חידות חשיבה מוכנות להדפסה, עם פתרונות.', 'puzzle', 'learning', ['thinking'], range(2, 6), 4),
  p('sudoku-kids', '/sudoku/kids', 'סודוקו לילדים', '🔢', 'סודוקו קטן וקל להדפסה — מתחילים מ־4×4.', 'puzzle', 'learning', ['thinking', 'math'], range(1, 4), 4),
  p('first-grade', '/classroom/first-grade', 'הכנה לכיתה א׳', '🎒', 'אותיות, מספרים וחשיבה — חוברת להדפסה לפני כיתה א׳.', 'worksheet', 'learning', ['letters', 'math', 'school'], [0, 1], 6),
  p('letters-hub', '/letters', 'לומדים אותיות', '🔤', 'דפי אותיות, ניקוד ומילים ראשונות להדפסה.', 'worksheet', 'learning', ['letters'], [0, 1], 6),
  p('toddlers', '/toddlers', 'פעילויות לפעוטות', '🧸', 'דפים פשוטים לגיל הרך: צבעים, צורות ומוטוריקה.', 'worksheet', 'creative', ['motor', 'coloring'], [0], 3),
  p('shabbat-activities', '/shabbat-activities', 'פעילויות לשבת', '🕯️', 'דפי פעילות, צביעה וחידות לקראת שבת.', 'worksheet', 'holiday', ['shabbat'], range(0, 4), 6),
  p('shabbat-parents', '/holidays/shabbat-parents', 'אבא ואמא של שבת', '👨‍👩‍👧', 'דפים ותעודות לאבא ולאמא של שבת בגן.', 'craft', 'holiday', ['shabbat'], [0, 1], 6),
  p('parasha', '/parasha', 'פרשת השבוע לילדים', '📜', 'סיכום הפרשה, שאלות וחידון — להדפסה לשולחן השבת.', 'reading', 'holiday', ['shabbat', 'parasha'], range(1, 6), 5),
  p('shabbat-games', '/games/shabbat', 'משחקים לשבת', '🎲', 'משחקים בלי מסכים לשולחן השבת.', 'game', 'holiday', ['shabbat'], range(1, 6), 4),
]

export const PRINTABLES = [...sheetPrintables(), ...holidayPrintables(), ...EXTRA]

const basePath = path => String(path || '').split(/[?#]/)[0].replace(/\/+$/, '') || '/'

// What the page being printed is about. Catalog pages match by address; other printing pages by pattern.
const COLORING_TOPICS = { animals: ['nature'], dinosaurs: ['nature'], nature: ['nature'], space: ['nature', 'general'], sea: ['nature'], birthday: ['birthday', 'party'], vehicles: ['general'], unicorn: ['coloring'] }
const THEME_TOPICS = { animals: ['nature'], space: ['nature', 'general'], birthday: ['birthday', 'party'], vehicles: ['general'], football: ['general'], unicorn: ['coloring'] }
export function printableContext(pathname, search = '') {
  const path = basePath(pathname)
  if (path === '/en' || path.startsWith('/en/')) return null
  const params = new URLSearchParams(search)
  let m
  if ((m = path.match(/^\/printables\/coloring\/([a-z-]+)/))) return { path, id: 'coloring', type: 'coloring', category: 'creative', topics: ['coloring', ...(COLORING_TOPICS[m[1]] || [])], grades: range(0, 3) }
  const exact = PRINTABLES.filter(item => {
    const target = basePath(item.path)
    if (path !== target && !path.startsWith(`${target}/`)) return false
    const query = item.path.split('?')[1]
    return !query || [...new URLSearchParams(query)].every(([k, v]) => params.get(k) === v)
  }).sort((a, b) => b.path.length - a.path.length)[0]
  if (exact) return { path, id: exact.id, type: exact.type, category: exact.category, topics: exact.topics, grades: exact.grades }
  if ((m = path.match(/^\/math\/(?:tests\/)?grade-(\d{1,2})/))) return { path, type: 'worksheet', category: 'learning', topics: ['math'], grades: [Number(m[1])] }
  if ((m = path.match(/^\/learn\/reading\/grade-(\d)/))) return { path, type: 'reading', category: 'learning', topics: ['reading'], grades: [Number(m[1])] }
  if (path.startsWith('/learn/reading')) return { path, type: 'reading', category: 'learning', topics: ['reading'], grades: range(2, 6) }
  if ((m = path.match(/^\/printables\/activity\/([a-z-]+)(?:\/([a-z-]+))?/))) return { path, type: 'puzzle', category: 'creative', topics: ['motor', 'thinking', ...(THEME_TOPICS[m[2]] || [])], grades: range(0, 2) }
  if ((m = path.match(/^\/holidays\/([a-z-]+)/))) return { path, type: 'coloring', category: 'holiday', topics: m[1].startsWith('shabbat') ? ['shabbat'] : ['holidays', HOLIDAY_TOPIC[m[1]]].filter(Boolean), grades: range(0, 3) }
  if (/^\/(shabbat-activities|parasha|games\/shabbat|recipes\/shabbat|shabbat-times)(\/|$)/.test(path)) return { path, type: 'worksheet', category: 'holiday', topics: ['shabbat', ...(path.startsWith('/parasha') ? ['parasha'] : [])], grades: range(0, 6) }
  if (/^\/(letters|hebrew)(\/|$)/.test(path)) return { path, type: 'worksheet', category: 'learning', topics: ['letters'], grades: [0, 1] }
  if (/^\/(birthday|bar-mitzvah|bat-mitzvah|invitation|tools\/(bingo|treasure|scavenger|escape))/.test(path)) return { path, type: 'game', category: 'party', topics: ['birthday', 'party'], grades: [] }
  if (/^\/(learn|math|english|classroom|school)/.test(path)) return { path, type: 'worksheet', category: 'learning', topics: ['school'], grades: [] }
  return { path, type: 'other', category: '', topics: [], grades: [] }
}

const overlap = (a = [], b = []) => a.some(x => b.includes(x))
// A small stable spread, so different pages don't all suggest the same top sheets.
const spread = (a, b) => { let h = 0; for (const ch of a + b) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h % 7 }

// Priority: same topic + same grade > same grade, other type > same topic > same category > popular.
export function scorePrintable(item, ctx) {
  // 'school' and 'holidays' are too broad to count as the same topic (Hanukkah ≠ Lag BaOmer).
  const topic = overlap(item.topics, ctx.topics.filter(t => t !== 'school' && t !== 'holidays'))
  const grade = ctx.grades.length > 0 && overlap(item.grades, ctx.grades)
  let score = 0
  if (topic && grade) score += 400
  else if (grade && item.type !== ctx.type) score += 300
  else if (topic) score += 200
  else if (ctx.category && item.category === ctx.category) score += 100
  // A sheet for another age is a poor fit even when the topic matches.
  if (ctx.grades.length && item.grades.length && !grade) score -= 150
  // For schoolwork, a sheet made for exactly this grade beats one that spans many grades.
  if (grade && ctx.category === 'learning') score += Math.max(0, 40 - 8 * (item.grades.length - 1))
  // Same category helps, except across holidays (Hanukkah coloring is not a reason to suggest Shabbat).
  if (ctx.category && item.category === ctx.category && (ctx.category !== 'holiday' || topic)) score += 50
  return score + item.pop * 3 + spread(ctx.path, item.id)
}

const isSamePage = (item, ctx) => {
  const target = basePath(item.path)
  return item.id === ctx.id || target === ctx.path || ctx.path.startsWith(`${target}/`)
}

export function recommendPrintables(pathname, { search = '', limit = 3, exclude = [] } = {}) {
  const ctx = printableContext(pathname, search)
  if (!ctx) return []
  const ranked = PRINTABLES
    .filter(item => !isSamePage(item, ctx) && !exclude.includes(item.id) && !exclude.includes(basePath(item.path)))
    .map(item => ({ item, score: scorePrintable(item, ctx) }))
    .sort((a, b) => b.score - a.score)
  // Mix types and families: a crossword and a maze help more than two crosswords or two maths sheets.
  // Same family = the same page for another grade or word pack (math-grade-3 / math-grade-4, crossword-nature / crossword-birthday).
  const family = item => item.id.replace(/-(?:grade-)?\d+$|-(?:nature|birthday|classroom|general)$/, '')
  const pool = ranked.slice(0, limit * 6)
  const out = []
  while (out.length < limit && pool.length) {
    const adjusted = x => x.score - out.filter(o => o.type === x.item.type).length * 80 - out.filter(o => o.topics[0] && o.topics[0] === x.item.topics[0]).length * 60 - (out.some(o => family(o) === family(x.item)) ? 300 : 0)
    pool.sort((a, b) => adjusted(b) - adjusted(a))
    out.push(pool.shift().item)
  }
  return out
}
