// Site-wide search: one list of everything a visitor can open (pages, tools, printables, ideas,
// guides, game categories). Games themselves come from the games database at search time.
import { MENU_GROUPS } from './siteMenu'
import { CATEGORIES, CLASS_PAGES } from './gameCategories'
import { IDEA_ARTICLES, PARTY_KITS } from './ideaArticlesExpanded'
import { GUIDES } from './guides'
import { GIFT_AGES } from './gifts'
import { categories as PRINTABLES } from '../pages/printables/PrintablesIndex'
import { printableHref } from '../components/ui/PrintableCard'

export const KINDS = {
  game: { label: 'משחקים', order: 1 },
  tool: { label: 'כלים ומחוללים', order: 2 },
  printable: { label: 'דפים להדפסה', order: 3 },
  page: { label: 'אזורים ועמודים', order: 4 },
  idea: { label: 'רעיונות, מדריכים ומתנות', order: 5 },
}

// Hubs and pages that are not in the tools menu, with the words people search for.
const PAGES = [
  { to: '/', title: 'דף הבית', emoji: '🏠', kind: 'page', keys: 'ראשי בית' },
  { to: '/games', title: 'כל המשחקים', emoji: '🎮', kind: 'page', desc: 'יותר מ-100 משחקים לילדים לפי גיל, זמן ומקום.', keys: 'משחק משחקים חיפוש' },
  { to: '/birthday', title: 'יום הולדת', emoji: '🎂', kind: 'page', desc: 'כל מה שצריך ליום הולדת: משחקים, הזמנות, מחשבון וספקים.', keys: 'מסיבה יומולדת' },
  { to: '/classroom', title: 'לכיתה ולגן', emoji: '🏫', kind: 'page', desc: 'פעילויות, משחקים ודפי עבודה למורות ולגננות.', keys: 'מורה גננת גן בית ספר' },
  { to: '/create', title: 'יוצרים ומדפיסים', emoji: '🖨️', kind: 'page', desc: 'מחוללים ודפים להדפסה.', keys: 'יצירה' },
  { to: '/ideas', title: 'רעיונות ליום הולדת', emoji: '💡', kind: 'page', desc: 'רעיונות למסיבות לפי גיל ונושא.', keys: 'השראה נושא' },
  { to: '/ideas/themes', title: 'מסיבות לפי נושא', emoji: '🎨', kind: 'page', keys: 'נושא תמה' },
  { to: '/printables', title: 'דפים להדפסה', emoji: '🖨️', kind: 'page', desc: 'ספרייה של דפי פעילות, צביעה וכתיבה.', keys: 'הדפסה דף עבודה' },
  { to: '/tools', title: 'כל הכלים', emoji: '🛠️', kind: 'page', keys: 'כלי כלים' },
  { to: '/suppliers', title: 'ספקים לימי הולדת', emoji: '🎪', kind: 'page', desc: 'מפעילים, קוסמים, עוגות וצילום.', keys: 'ספק מפעיל קוסם עוגה צלם הפעלה' },
  { to: '/suppliers/me', title: 'הצטרפות כספק', emoji: '🤝', kind: 'page', keys: 'ספק הרשמה כרטיס פרימיום' },
  { to: '/gifts', title: 'רעיונות למתנות', emoji: '🎁', kind: 'idea', desc: 'מתנות לפי גיל ותקציב.', keys: 'מתנה מתנות' },
  { to: '/guides', title: 'מדריכים', emoji: '📚', kind: 'page', keys: 'מדריך' },
  { to: '/time-tunnel', title: 'מנהרת הזמן של בוגה – משחק יומי', emoji: '⏳', kind: 'tool', desc: 'כל יום דברים שקרו בדיוק בתאריך הזה – מגלים בעזרת רמזים.', keys: 'מה היום חידון יומי היסטוריה תאריך יום מיוחד רמזים מנהרה זמן' },
  { to: '/printables/fine-motor', title: 'מוטוריקה עדינה – מחולל דפי תרגול', emoji: '✏️', kind: 'tool', desc: 'מבוכים, עקיבה אחרי קווים והמשך דפוסים לפי גיל.', keys: 'מבוך מבוכים עקיבה קווים דפוס מוטוריקה גן' },
  { to: '/game-of-the-day', title: 'משחק היום', emoji: '⭐', kind: 'page', keys: 'יומי' },
  { to: '/songs/birthday-songs', title: 'שירי יום הולדת', emoji: '🎵', kind: 'idea', keys: 'שיר שירים' },
  { to: '/compare/home-vs-venue', title: 'יום הולדת בבית או באולם?', emoji: '⚖️', kind: 'idea', keys: 'השוואה אולם בית' },
  { to: '/compare/entertainer-vs-diy', title: 'מפעיל או לבד?', emoji: '⚖️', kind: 'idea', keys: 'השוואה מפעיל' },
  { to: '/calculator/how-many-pizzas', title: 'כמה פיצות להזמין', emoji: '🍕', kind: 'tool', keys: 'פיצה פיצות מחשבון' },
  { to: '/calculator/how-many-drinks', title: 'כמה שתייה צריך', emoji: '🥤', kind: 'tool', keys: 'שתייה מחשבון' },
  { to: '/calculator/birthday-cost', title: 'כמה עולה יום הולדת', emoji: '💰', kind: 'tool', keys: 'עלות תקציב מחשבון' },
  { to: '/classroom/quiz', title: 'מבחן אמריקאי אונליין לכיתה', emoji: '📝', kind: 'tool', keys: 'חידון מבחן בוחן מורה' },
  { to: '/faq', title: 'שאלות נפוצות', emoji: '❓', kind: 'page', keys: 'עזרה' },
  { to: '/about', title: 'אודות עוגה בוגה', emoji: '🎂', kind: 'page', keys: 'קשר מי אנחנו' },
]

const TOOL_DESC = {
  '/tools/trivia-quiz': 'טריוויה עם מצבי משחק, ניקוד ותחרות.', '/tools/truth-or-buga': 'משחק אמת/שקר עם קושי, קבוצות וניקוד.',
  '/tools/buga-town': 'משחק עיר ונכסים עם שאלות וקוביות.', '/tools/escape-rooms': 'חדרים דיגיטליים וקיטים להנחיה.',
  '/tools/riddles': 'מאגר חידות לפי נושא, גיל וקושי.', '/tools/emoji-studio': 'מנחשים שירים וסרטים באימוג׳ים.',
  '/tools/bingo-maker': 'כרטיסיות בינגו מוכנות או מותאמות אישית.', '/tools/word-search-maker': 'צרו תפזורות לפי מילים ונושאים.',
  '/tools/crossword-maker': 'מכניסים מילים ומקבלים תשבץ להדפסה.', '/tools/scavenger-hunt-maker': 'רמזים ומשימות מוכנים להפעלה.',
  '/calculator': 'כמה פיצות, שתייה וחטיפים צריך למסיבה.', '/invitation': 'הזמנה אישית ליום הולדת.', '/greeting': 'ברכה אישית ליום הולדת.',
  '/tools/bring-list': 'רשימה שיתופית: כל הורה תופס פריט בקישור אחד.', '/tools/birthday-famous': 'אילו מפורסמים נולדו באותו תאריך.',
  '/classroom/first-grade': 'כתיבה, שעון, חשבון וקריאה בתרגול משחקי.', '/tools/eretz-ir': 'ארץ עיר עם אותיות, טיימר וניקוד.',
  '/tools/experiment-maker': 'בוחרים ניסוי, ממלאים דף חקר ומדפיסים.',
}
const TOOL_KEYS = {
  '/tools/random-picker': 'גלגל מזל הגרלה', '/tools/team-generator': 'קבוצות חלוקה', '/tools/countdown-timer': 'שעון עצר',
  '/tools/crossword-maker': 'תשבץ', '/tools/word-search-maker': 'תפזורת', '/invitation': 'הזמנה הזמנות', '/greeting': 'ברכה ברכות',
  '/calculator': 'פיצה שתייה עלות', '/tools/escape-rooms': 'חדר בריחה אסקייפ', '/tools/scavenger-hunt-maker': 'מטמון ציד אוצר',
  '/tools/trivia-quiz': 'טריוויה חידון שאלות', '/classroom/first-grade': 'כיתה א הכנה',
}

const clean = to => to.split('#')[0]
function buildStatic() {
  const out = [...PAGES]
  for (const group of MENU_GROUPS) for (const it of group.items) {
    const to = it.to
    const kind = to.startsWith('/printables') ? 'printable' : to.startsWith('/games') ? 'page' : to.startsWith('/gifts') || to.startsWith('/suppliers') ? 'page' : 'tool'
    out.push({ to, title: it.label, emoji: it.icon, kind, desc: TOOL_DESC[clean(to)] || '', keys: TOOL_KEYS[clean(to)] || '' })
  }
  for (const c of PRINTABLES) out.push({ to: printableHref(c), title: c.title, emoji: c.emoji, kind: 'printable', desc: c.desc })
  for (const [slug, c] of Object.entries({ ...CATEGORIES, ...CLASS_PAGES })) out.push({ to: `/games/${slug}`, title: c.title.split(' — ')[0], emoji: '🎲', kind: 'page', desc: c.desc })
  for (const [slug, a] of Object.entries(IDEA_ARTICLES)) out.push({ to: `/ideas/${slug}`, title: a.title, emoji: a.emoji, kind: 'idea', desc: a.description })
  for (const [slug, k] of Object.entries(PARTY_KITS)) out.push({ to: `/ideas/themes/${slug}`, title: k.name, emoji: k.emoji, kind: 'idea', desc: k.desc })
  for (const g of GUIDES) out.push({ to: `/guides/${g.slug}`, title: g.title, emoji: g.emoji, kind: 'idea', desc: g.description })
  for (const age of GIFT_AGES) out.push({ to: `/gifts/${age}`, title: `מתנות לגיל ${age}`, emoji: '🎁', kind: 'idea', keys: `מתנה גיל ${age}` })
  // every date page of the time tunnel ("מה קרה ב-14 במרץ?")
  const HM = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
  ;[31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31].forEach((len, m) => { for (let d = 1; d <= len; d++) out.push({ to: `/time-tunnel/${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, title: `מה קרה ב-${d} ב${HM[m]}?`, emoji: '⏳', kind: 'page', desc: 'ימים מיוחדים, אירועים ומי נולד בתאריך הזה', keys: `מנהרת הזמן תאריך ${d} ${HM[m]}`, low: true }) })
  const seen = new Set() // one entry per link
  return out.filter(x => { if (seen.has(x.to)) return false; seen.add(x.to); return true })
}
export const STATIC_ITEMS = buildStatic()

export const gameItem = g => ({
  to: `/games/${g.slug}`, title: g.name, emoji: '🎮', kind: 'game', desc: g.short_description || '',
  keys: [g.category, ...(g.tags || []), ...(g.goals || []), ...(g.contexts || [])].filter(Boolean).join(' '),
})

// --- matching -------------------------------------------------------------
const norm = s => String(s || '').toLowerCase().replace(/[֑-ׇ]/g, '').replace(/[׳'"״`’”“\-–—_.,!?():;]/g, ' ').replace(/\s+/g, ' ').trim()
const FINALS = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' }
const unfinal = s => s.replace(/[ךםןףץ]/g, c => FINALS[c])

// Hebrew variants of one search word: with/without a one-letter prefix (ה ו ב ל מ ש כ) and a plural/feminine ending.
function variants(word) {
  const v = new Set([word])
  if (word.includes(' ')) return [word, unfinal(word)]
  if (word.length > 3 && 'הובלמשכ'.includes(word[0])) v.add(word.slice(1))
  for (const w of [...v]) {
    const u = unfinal(w)
    v.add(u)
    for (const suf of ['ים', 'ות', 'ה', 'ת', 'י']) if (u.length > suf.length + 2 && u.endsWith(suf)) v.add(u.slice(0, -suf.length))
  }
  return [...v].filter(x => x.length >= 2)
}

export function searchItems(items, query) {
  // one-letter words ("כיתה א") stay glued to the word before them
  const words = norm(query).split(' ').filter(Boolean).reduce((acc, w) => { if (w.length < 2 && acc.length) acc[acc.length - 1] += ' ' + w; else if (w.length >= 2) acc.push(w); return acc }, [])
  if (!words.length) return []
  const vs = words.map(variants)
  const scored = []
  for (const it of items) {
    const title = unfinal(norm(it.title)), rest = unfinal(norm(`${it.desc || ''} ${it.keys || ''}`))
    let score = 0, all = true
    for (const vw of vs) {
      const inTitle = vw.some(v => title.includes(v)), inRest = vw.some(v => rest.includes(v))
      if (!inTitle && !inRest) { all = false; break }
      score += inTitle ? (vw.some(v => title.startsWith(v) || title.includes(' ' + v)) ? 12 : 8) : 3
    }
    if (!all) continue
    if (title === unfinal(norm(query))) score += 20
    score += it.kind === 'tool' ? 2 : it.kind === 'game' ? 1 : 0
    if (it.low) score -= 6 // 366 date pages shouldn't crowd out games and tools
    scored.push({ ...it, score })
  }
  return scored.sort((a, b) => b.score - a.score || (a.low && b.low ? a.to.localeCompare(b.to) : a.title.length - b.title.length))
}

// Autocomplete: phrases that really appear on the site (titles, 1–4 words; keywords, single words) that
// continue what's being typed, plus the best direct hits.
let vocab = null, vocabFor = null
const STOP = new Set(['של', 'או', 'את', 'עם', 'לפי', 'על', 'עד', 'גם', 'כל', 'זה', 'לא', 'בלי', 'אל', 'מן', 'כמו', 'יותר', 'הכי', 'איך', 'מה', 'ל', 'ב', 'ו', 'ה'])
function buildVocab(items) {
  const count = new Map()
  const add = w => { if (w.length >= 2 && !/^\d+$/.test(w)) count.set(w, (count.get(w) || 0) + 1) }
  for (const it of items) {
    if (it.low) continue
    // phrases never cross a dash/colon/comma ("מנהרת הזמן של בוגה – משחק יומי" ≠ "בוגה משחק")
    for (const seg of String(it.title).split(/\s[–—-]\s|[:,|?!()]/)) {
      const t = norm(seg).split(' ').filter(Boolean)
      for (let i = 0; i < t.length; i++) for (let n = 1; n <= 4 && i + n <= t.length; n++) {
        const ph = t.slice(i, i + n)
        if (STOP.has(ph[0]) || STOP.has(ph[ph.length - 1])) continue // no "צבעו לפי", "של בוגה"
        add(ph.join(' '))
      }
    }
    for (const w of norm(it.keys || '').split(' ')) if (!STOP.has(w)) add(w)
  }
  return [...count].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length).map(([w]) => ({ w, u: unfinal(w) }))
}
export function suggest(items, input, { words = 6, hits = 6 } = {}) {
  const raw = String(input || '')
  const n = unfinal(norm(raw))
  if (!n) return { words: [], hits: [] }
  if (vocabFor !== items) { vocab = buildVocab(items); vocabFor = items }
  const seen = new Set()
  const completions = raw.endsWith(' ') && !n.includes(' ') ? [] : vocab
    .filter(({ u }) => u.startsWith(n) && u !== n)
    .filter(({ u }) => !seen.has(u) && seen.add(u))
    .slice(0, words).map(({ w }) => w)
  return { words: completions, hits: n.length >= 2 ? searchItems(items, raw).slice(0, hits) : [] }
}
