// "דף שם לצביעה ולמידת אותיות" (/printables/name-coloring): pure helpers, no JSX, so node tests
// can import them. Letter grids, fitting the name to the bubble cloud, and the per-name SEO pages
// (/printables/name-coloring/:name) built from the site's baby-names list.
import { BABY_NAMES, LETTER_NAMES, nameBySlug, similarNames } from '../../data/babyNames.js'

export const NC_BASE = '/printables/name-coloring'
export const NC_MAX = 16

const NIQQUD = /[֑-ׇ]/g
const HEB = /[א-ת]/
export const isHebrew = s => HEB.test(s)

// Keeps letters, niqqud, spaces, apostrophes/geresh (ג׳ורג׳) and hyphens; up to NC_MAX letters.
export const cleanName = s => String(s || '').replace(/[^\p{L}\p{M}\s'׳״"-]/gu, '').replace(/\s+/g, ' ').trimStart().slice(0, NC_MAX + 8)
// The letters only (no niqqud, spaces or marks), as written.
export const nameLetters = s => [...String(s || '').normalize('NFC').replace(NIQQUD, '').replace(/[^\p{L}]/gu, '')]
export const plainName = s => String(s || '').replace(NIQQUD, '').replace(/\s+/g, ' ').trim()

export const FINALS = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' }
const TO_FINAL = Object.fromEntries(Object.entries(FINALS).map(([f, b]) => [b, f]))
const baseOf = c => FINALS[c] || c
const HEB_LETTERS = [...'אבגדהוזחטיכלמנסעפצקרשת']
const LATIN = [...'abcdefghijklmnopqrstuvwxyz']
// Look-alike letters: the harder distractors for first grade.
const LOOKALIKE = { ב: 'כפ', כ: 'בנ', ד: 'רך', ר: 'דך', ה: 'חת', ח: 'הת', ת: 'חה', ו: 'זן', ז: 'ון', ס: 'םט', ג: 'נצ', נ: 'גכ', מ: 'טם', ט: 'מס', ע: 'צש', צ: 'עג', ש: 'עצ', א: 'עש', י: 'וז', ל: 'קר', ק: 'לה', פ: 'כב', ן: 'וז', ם: 'סמ', ך: 'דר', ף: 'פך', ץ: 'צן' }

// Letter names for the page text: 'נו״ן', 'מ״ם סופית'.
export const letterName = c => FINALS[c] ? `${LETTER_NAMES[FINALS[c]].replace('"', '״')} סופית` : LETTER_NAMES[c] ? LETTER_NAMES[c].replace('"', '״') : c

export function hashString(s) {
  let h = 2166136261
  for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) }
  return h >>> 0
}
export function rng(seed) {
  let a = seed >>> 0
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
const shuffle = (list, rand) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

// Distractor letters: never a letter of the name, nor its regular/final twin (so מ never
// stands in for the ם of "אדם"). First grade gets look-alikes first.
function distractors(letters, rand, lookalikes) {
  const heb = letters.some(isHebrew) || !letters.length
  const used = new Set(letters.flatMap(c => [c, c.toLowerCase(), baseOf(c), TO_FINAL[c]].filter(Boolean)))
  const pool = shuffle((heb ? HEB_LETTERS : LATIN).filter(c => !used.has(c)), rand)
  if (!lookalikes || !heb) return pool
  const near = shuffle([...new Set(letters.flatMap(c => [...(LOOKALIKE[c] || '')]))].filter(c => !used.has(c)), rand)
  return [...new Set([...near, ...pool])]
}

// "הקיפו את אותיות השם": every distinct letter of the name at least once, mixed with other
// letters. Kindergarten: 12 circles, about half from the name. First grade: 18, look-alikes.
// Reproducible: the same name and level always give the same grid.
export function letterGrid(name, level = 'gan') {
  const letters = nameLetters(name)
  const unique = [...new Set(letters)]
  const alef = level === 'alef'
  const base = alef ? 18 : 12
  const cols = Math.ceil(Math.max(base, unique.length + 4) / 2)
  const cells = cols * 2
  const rand = rng(hashString(`${level}|${letters.join('')}`))
  const fromName = Math.min(cells - 3, Math.max(unique.length, Math.round(cells * (alef ? 0.4 : 0.5))))
  const picks = [...unique]
  const extra = shuffle(letters, rand)
  for (let i = 0; picks.length < fromName && extra.length; i++) picks.push(extra[i % extra.length])
  const others = distractors(unique, rand, alef)
  const fill = []
  for (let i = 0; fill.length < cells - picks.length; i++) fill.push(others[i % others.length])
  return { cells: shuffle([...picks, ...fill], rand).map(c => ({ c, inName: unique.includes(c) })), cols }
}

// "מה האות הראשונה?" for kindergarten: the first letter and two others, in a fixed shuffle.
export function firstLetterChoices(name) {
  const letters = nameLetters(name)
  if (!letters.length) return []
  const rand = rng(hashString(`first|${letters.join('')}`))
  return shuffle([letters[0], ...distractors([letters[0]], rand, false).slice(0, 2)], rand)
}

// ── Fitting the bubble name ──
// Advance widths of Heebo Black (em), measured from the font file.
const W = { א: .688, ב: .553, ג: .472, ד: .589, ה: .642, ו: .335, ז: .406, ח: .647, ט: .65, י: .365, ך: .536, כ: .56, ל: .56, ם: .671, מ: .681, ן: .335, נ: .419, ס: .652, ע: .651, ף: .645, פ: .683, ץ: .602, צ: .61, ק: .669, ר: .5, ש: .903, ת: .657, ' ': .25, "'": .153, '׳': .256, '״': .4, '"': .4, '-': .464,
  a: .531, b: .564, c: .521, d: .564, e: .548, f: .366, g: .578, h: .566, i: .278, j: .306, k: .553, l: .281, m: .858, n: .566, o: .562, p: .564, q: .563, r: .383, s: .514, t: .346, u: .566, v: .52, w: .724, x: .518, y: .522, z: .518 }
const UPPER = { I: .306, J: .563, M: .878, W: .866 }
export const textEm = s => [...String(s).replace(NIQQUD, '')].reduce((w, c) => w + (W[c] ?? UPPER[c] ?? (/[A-Z]/.test(c) ? .66 : .62)), 0)

// Splits a long multi-word name into two lines, then picks the largest font size that fits the
// box (the outline stroke adds ~0.2em). Returns { lines, size }.
export function fitName(name, width, height, max = 60) {
  const text = String(name || '').trim()
  const words = text.split(' ').filter(Boolean)
  let lines = [text]
  if (words.length > 1 && [...plainName(text)].length > 7) {
    let best = null
    for (let i = 1; i < words.length; i++) {
      const pair = [words.slice(0, i).join(' '), words.slice(i).join(' ')]
      const w = Math.max(...pair.map(textEm))
      if (!best || w < best.w) best = { pair, w }
    }
    lines = best.pair
  }
  const spacing = 0.08
  const em = Math.max(...lines.map(l => textEm(l) + [...plainName(l)].length * spacing), 0.6) + 0.15
  const lineH = 1.08
  const size = Math.min(max, width / em, height / (0.78 + (lines.length - 1) * lineH))
  return { lines, size, lineH, spacing }
}

// ── Per-name SEO pages ──
const HEB_COUNT = { 1: 'אות אחת', 2: 'שתי אותיות', 3: 'שלוש אותיות', 4: 'ארבע אותיות', 5: 'חמש אותיות', 6: 'שש אותיות', 7: 'שבע אותיות', 8: 'שמונה אותיות', 9: 'תשע אותיות', 10: 'עשר אותיות' }
export const countText = n => HEB_COUNT[n] || `${n} אותיות`

// Every name in the baby-names list gets a page; the URL reuses its slug (/printables/name-coloring/noa).
export const NAME_PAGES = BABY_NAMES
export const nameColoringPath = n => `${NC_BASE}/${n.slug}`
export const nameColoringPaths = () => NAME_PAGES.map(nameColoringPath)

// The route parameter: a known slug, or any word typed into the URL (rendered, not listed).
export function resolveNameParam(param) {
  let raw = String(param || '')
  try { raw = decodeURIComponent(raw) } catch { /* keep as is */ }
  const bySlug = nameBySlug(raw.toLowerCase())
  if (bySlug) return { name: bySlug.name, entry: bySlug }
  const name = cleanName(raw.replace(/[-_]+/g, ' ')).trim().slice(0, NC_MAX + 8)
  const entry = NAME_PAGES.find(n => n.name === plainName(name)) || null
  return { name, entry }
}

export function nameFacts(name) {
  const letters = nameLetters(name)
  const last = letters[letters.length - 1]
  return { letters, count: letters.length, first: letters[0], last, finalLast: Boolean(FINALS[last]) }
}

export const namePageTitle = n => `דף צביעה עם השם ${n.name} — אותיות השם להדפסה`
export function namePageDescription(n) {
  const f = nameFacts(n.name)
  const d = `דף צביעה עם השם ${n.name} להדפסה: השם באותיות בועה גדולות, ציורים לצביעה ומשחקי אותיות — ${countText(f.count)}, מתחיל ב${letterName(f.first)}. חינם, A4.`
  return d.length <= 165 ? d : `דף צביעה עם השם ${n.name}: אותיות בועה גדולות, ציורים לצביעה ומשחקי אותיות — ${countText(f.count)}. חינם להדפסה.`
}
export function namePageIntro(n) {
  const f = nameFacts(n.name)
  const parts = [`בשם ${n.name} יש ${countText(f.count)}: ${f.letters.join(', ')}. האות הראשונה היא ${letterName(f.first)}`]
  parts[0] += f.finalLast ? `, והאחרונה היא ${letterName(f.last)} (${f.last}) — הזדמנות טובה להראות לילדים שהאות משנה צורה בסוף המילה.` : '.'
  return parts[0]
}
export const similarNamePages = n => similarNames(n, 8)

// ── Per-name guide: everything below is computed from the name's letters and its baby-names row,
// so each name page carries facts its siblings don't (letter by letter, the actual sheet's
// activities, look-alike letters to practise, names that share its first letter or length).

// Pairs that first graders commonly mix up (the classic reversal/shape pairs taught in class).
const CONFUSABLE = { ב: 'כ', כ: 'ב', ד: 'ר', ר: 'ד', ה: 'חת', ח: 'הת', ת: 'ח', ו: 'זן', ז: 'ו', ן: 'ו', ס: 'ם', ם: 'ס', ג: 'נ', נ: 'ג', ע: 'צ', צ: 'ע', ך: 'דר', י: 'ו' }
const TIMES = { 2: 'פעמיים', 3: 'שלוש פעמים', 4: 'ארבע פעמים' }
const ORIGIN_TEXT = { 'עברי': 'שם עברי', 'תנ"כי': 'שם תנ״כי', 'ארמי': 'שם ממקור ארמי', 'לועזי': 'שם לועזי', 'יידיש': 'שם ממקור יידיש' }
const GENDER_TEXT = { f: 'לבת', m: 'לבן', u: 'לבנים ולבנות' }
const joinHe = list => list.length < 2 ? list.join('') : `${list.slice(0, -1).join(', ')} ו${list[list.length - 1]}`

export function nameColoringGuide(n) {
  const f = nameFacts(n.name)
  const counts = new Map()
  for (const c of f.letters) counts.set(c, (counts.get(c) || 0) + 1)
  const repeats = [...counts].filter(([, k]) => k > 1).map(([c, k]) => `${letterName(c)} (${c}) מופיעה ${TIMES[k] || `${k} פעמים`}`)
  const lookalikes = [...counts.keys()].filter(c => CONFUSABLE[c]).map(c => ({ c, like: [...CONFUSABLE[c]] }))
  const finals = f.letters.filter(c => FINALS[c])
  const breakdown = f.letters.map((c, i) => `${i + 1}. ${c} — ${letterName(c)}`)
  const gan = letterGrid(n.name, 'gan'), alef = letterGrid(n.name, 'alef')
  const ganIn = gan.cells.filter(x => x.inName).length, alefIn = alef.cells.filter(x => x.inName).length
  const choices = firstLetterChoices(n.name)
  const sheet = `בדף של ${n.name} ברמת גן מופיעים ${gan.cells.length} עיגולים, ו־${ganIn} מהם הם אותיות מהשם שצריך למצוא ולהקיף. ברמת כיתה א׳ יש ${alef.cells.length} עיגולים, ${alefIn} מהם מהשם${alef.cells.some(x => !x.inName && lookalikes.some(l => l.like.includes(x.c))) ? ', וביניהם גם אותיות שדומות לאותיות של השם' : ''}. בשאלה „מה האות הראשונה?” בוחרים בין ${joinHe(choices)} — והתשובה היא ${f.first}.`
  const length = f.count <= 3
    ? `${n.name} הוא שם קצר, ולכן הוא מתאים במיוחד לילדים שרק מתחילים להכיר אותיות: אפשר להתמקד בכל יום באות אחת מ${countText(f.count)} שלו.`
    : f.count >= 6
      ? `${n.name} הוא שם ארוך יחסית (${countText(f.count)}), ולכן כדאי לעבור עליו קודם עם האצבע, אות אחר אות מימין לשמאל, ורק אחר כך לצבוע ולהקיף.`
      : `ב${n.name} ${countText(f.count)} — אורך נוח לגן: מספיק כדי לתרגל ספירה, ועדיין קל לזכור את כל האותיות בעל פה.`
  const practice = lookalikes.length
    ? `כדאי לשים לב ל${joinHe(lookalikes.slice(0, 3).map(l => `${letterName(l.c)} (${l.c}), שדומה ל־${l.like.join(' ול־')}`))}. ילדים מתבלבלים ביניהן בתחילת הדרך, ולכן בכיתה א׳ הדף מוסיף אותיות דומות כאלה בין האותיות להקפה.`
    : `באותיות של ${n.name} אין זוגות מוכרים של אותיות דומות (כמו ב/כ או ד/ר), כך שהשם נוח במיוחד לזיהוי ראשון.`
  const about = `השם ${n.name} הוא ${ORIGIN_TEXT[n.origin] || 'שם'} ${GENDER_TEXT[n.gender] || ''}`.trim() + (n.source ? ` (מקור: ${n.source}).` : '.')

  // Other name pages that share the first letter (alphabetical neighbours) or the length and gender.
  const sorted = [...NAME_PAGES].sort((a, b) => a.name.localeCompare(b.name, 'he'))
  const similar = new Set(similarNamePages(n).map(x => x.slug))
  const sameLetterAll = sorted.filter(x => x !== n && nameLetters(x.name)[0] === f.first && !similar.has(x.slug))
  const at = sorted.indexOf(n)
  const sameLetter = sameLetterAll.sort((a, b) => Math.abs(sorted.indexOf(a) - at) - Math.abs(sorted.indexOf(b) - at)).slice(0, 6)
  const taken = new Set([...similar, ...sameLetter.map(x => x.slug)])
  const lenPool = sorted.filter(x => x !== n && !taken.has(x.slug) && x.gender === n.gender && nameLetters(x.name).length === f.count)
  const start = lenPool.length ? hashString(n.slug) % lenPool.length : 0
  const sameLength = [...lenPool.slice(start), ...lenPool.slice(0, start)].slice(0, 6)

  const faq = [
    { q: `מה פירוש השם ${n.name}?`, a: `${n.meaning} ${about}` },
    { q: `באיזו אות מסתיים השם ${n.name}?`, a: f.finalLast
      ? `השם ${n.name} מסתיים ב${letterName(f.last)} (${f.last}). זו אות סופית: באמצע מילה היא נכתבת ${FINALS[f.last]}, ובסוף מילה — ${f.last}. בדף של כיתה א׳ יש שאלה בדיוק על זה.`
      : `השם ${n.name} מסתיים באות ${letterName(f.last)} (${f.last}).${finals.length ? '' : ' אין בשם אות סופית, ולכן בכיתה א׳ התשובה לשאלה „יש בשם אות סופית?” היא „לא”.'}` },
    lookalikes.length
      ? { q: `באילו אותיות של ${n.name} ילדים מתבלבלים?`, a: `בשם ${n.name} יש `+joinHe(lookalikes.map(l => `${l.c} (שדומה ל־${l.like.join(' ול־')})`))+'. אלה זוגות שקל להתבלבל בהם בתחילת הלמידה, ולכן כדאי להצביע עליהם יחד עם הילד.' }
      : repeats.length ? { q: `יש אות שחוזרת בשם ${n.name}?`, a: `כן: ${joinHe(repeats)}. כשסופרים כמה אותיות יש בשם, סופרים כל הופעה שלה בנפרד.` }
        : { q: `יש אות שחוזרת בשם ${n.name}?`, a: `לא. כל ${countText(f.count)} בשם ${n.name} שונות זו מזו, וכל אחת מופיעה בשם פעם אחת בלבד.` },
  ]
  return { facts: f, breakdown, repeats, lookalikes, sheet, length, practice, about, sameLetter, sameLength, faq }
}

// A different decoration for every name page, so the sheets don't all look alike.
export const THEME_IDS = ['art', 'sports', 'space', 'animals', 'flowers', 'vehicles', 'sea', 'party']
export const themeForName = name => THEME_IDS[hashString(plainName(name)) % THEME_IDS.length]
