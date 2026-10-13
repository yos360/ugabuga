// Endless practice for /learn/gifted-test/practice and /simulation: every round is generated fresh.
// Items have the same shape as the hand-written bank (giftedData.js), so the same quiz, figures and
// explain() work for them. Each generator checks its own answer; tests/gifted-gen.test.mjs re-checks
// thousands of generated items independently.
//
//   series   — number series from a rule (answer computed by seriesTerm)
//   matrices — 3×3 shape matrix (answer computed by matrixCell)
//   verbal   — analogies built from the site's opposites/synonyms word pairs, plus the hand-written bank
//   logic    — quantitative word problems and "which word doesn't belong" (rendered as text questions)
import { seriesTerm, matrixCell, VERBAL, LOGIC, MATRICES, SERIES } from './giftedData.js'
import { ADV_VERBAL, ADV_LOGIC } from './giftedGrades.js'
import { WORD_SETS, answersFor } from '../../data/wordPairs.js'

// ── grades → difficulty (1 easy … 5 hardest). ז׳–ט׳ is the bridge to the psychometric exam. ──
export const GEN_GRADES = [
  { id: 1, label: 'א׳', levels: [1] },
  { id: 2, label: 'ב׳', levels: [1, 2] },
  { id: 3, label: 'ג׳', levels: [2, 3] },
  { id: 4, label: 'ד׳', levels: [2, 3] },
  { id: 5, label: 'ה׳', levels: [3, 4] },
  { id: 6, label: 'ו׳', levels: [3, 4] },
  { id: 7, label: 'ז׳–ט׳', levels: [4, 5] },
]
export const gradeById = id => GEN_GRADES.find(g => g.id === Number(id)) || GEN_GRADES[1]

// Small seeded random (mulberry32) so tests can reproduce a round.
export function rng(seed = Date.now()) {
  let a = seed >>> 0
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
const int = (r, a, b) => a + Math.floor(r() * (b - a + 1))
const pick = (r, list) => list[Math.floor(r() * list.length)]
const shuffle = (r, a) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1));[x[i], x[j]] = [x[j], x[i]] } return x }
let serial = 0
const gid = k => `g${k}${++serial}`

// Put the correct option among the wrong ones at a random place. Returns null if options repeat.
function withOptions(r, correct, wrong) {
  const key = o => JSON.stringify(o)
  const uniq = [...new Map(wrong.filter(w => key(w) !== key(correct)).map(w => [key(w), w])).values()].slice(0, 3)
  if (uniq.length < 3) return null
  const options = [...uniq], answer = int(r, 0, 3)
  options.splice(answer, 0, correct)
  return { options, answer }
}

// ── number series ──
const SERIES_RULES = {
  1: r => pick(r, [
    () => ({ k: 'cycle', a: int(r, 1, 12), ops: [['+', int(r, 2, 6)]] }),
    () => ({ k: 'cycle', a: int(r, 30, 60), ops: [['-', int(r, 2, 6)]] }),
    () => ({ k: 'cycle', a: int(r, 1, 3), ops: [['*', 2]] }),
  ])(),
  2: r => pick(r, [
    () => ({ k: 'cycle', a: int(r, 2, 10), ops: [['+', int(r, 2, 5)], ['+', int(r, 1, 3)]] }),
    () => ({ k: 'grow', a: int(r, 1, 6), d: int(r, 1, 3), dd: 1 }),
    () => ({ k: 'inter', x: { a: int(r, 1, 6), d: int(r, 1, 3) }, y: { a: int(r, 20, 40), d: -int(r, 1, 4) } }),
    () => ({ k: 'cycle', a: int(r, 1, 3), ops: [['*', 3]] }),
  ])(),
  3: r => pick(r, [
    () => ({ k: 'cycle', a: int(r, 2, 6), ops: [['*', 2], ['+', int(r, 1, 3)]] }),
    () => ({ k: 'fib', a: int(r, 1, 4), b: int(r, 2, 6) }),
    () => ({ k: 'squares', from: int(r, 1, 4) }),
    () => ({ k: 'grow', a: int(r, 2, 10), d: int(r, 2, 4), dd: int(r, 1, 2) }),
  ])(),
  4: r => pick(r, [
    () => ({ k: 'affine', a: int(r, 1, 3), m: 2, c: pick(r, [1, -1, 2]) }),
    () => ({ k: 'cycle', a: int(r, 3, 8), ops: [['+', int(r, 2, 5)], ['*', 2]] }),
    () => ({ k: 'grow', a: int(r, 60, 90), d: -int(r, 1, 3), dd: -int(r, 1, 2) }),
    () => ({ k: 'inter', x: { a: int(r, 2, 8), d: int(r, 3, 6) }, y: { a: int(r, 40, 70), d: -int(r, 3, 7) } }),
  ])(),
  5: r => pick(r, [
    () => ({ k: 'affine', a: int(r, 1, 4), m: 3, c: pick(r, [-1, 1, -2]) }),
    () => ({ k: 'cycle', a: int(r, 2, 5), ops: [['*', 3], ['-', int(r, 1, 4)]] }),
    () => ({ k: 'fib', a: int(r, 3, 8), b: int(r, 4, 10) }),
    () => ({ k: 'squares', from: int(r, 4, 9) }),
  ])(),
}
const SERIES_LEN = { cycle: 6, grow: 6, inter: 6, fib: 6, squares: 5, affine: 5 }
export function genSeries(level, r = Math.random) {
  for (let tries = 0; tries < 40; tries++) {
    const rule = SERIES_RULES[level](r)
    const n = rule.k === 'cycle' && rule.ops.length === 1 && rule.ops[0][0] === '*' ? 5 : SERIES_LEN[rule.k]
    const seq = Array.from({ length: n }, (_, i) => seriesTerm(rule, i))
    const next = seriesTerm(rule, n)
    if (![...seq, next].every(v => Number.isInteger(v) && v >= 0 && v < 2000)) continue
    if (new Set(seq).size < seq.length - 1) continue // e.g. 1,1,1,1 from ×3−2: no rule to discover
    const last = seq[n - 1], diff = last - seq[n - 2]
    // typical mistakes: repeat the last step, off by one or two, or continue the wrong way
    const wrong = shuffle(r, [last + diff, next + 1, next - 1, next + 2, next - 2, last * 2, next + diff]).filter(v => v >= 0 && v !== next)
    const o = withOptions(r, next, wrong)
    if (o) return { id: gid('s'), level, rule, seq, ...o }
  }
  return { ...pick(r, SERIES), id: gid('s') }
}

// ── shape matrices ──
const SHAPES = ['circle', 'square', 'triangle', 'star', 'diamond', 'hexagon', 'heart']
const VALS = { count: [1, 2, 3], fill: ['empty', 'striped', 'full'], size: ['s', 'm', 'l'], rot: [0, 90, 180] }
const BY = { 1: ['c', 'r'], 2: ['c', 'r', 'l'], 3: ['c', 'r', 'l', 'k'], 4: ['l', 'k', 'c', 'r'], 5: ['l', 'k'] }
const ATTRS_N = { 1: [1], 2: [1, 2], 3: [2], 4: [2, 3], 5: [3] }
export function genMatrix(level, r = Math.random) {
  for (let tries = 0; tries < 60; tries++) {
    const n = pick(r, ATTRS_N[level])
    const useRot = n < 3 && r() < 0.25
    const pool = useRot ? ['rot', 'count', 'fill'] : ['shape', 'count', 'fill', 'size']
    const attrs = shuffle(r, pool).slice(0, n)
    const usedBy = new Set(), vary = {}
    for (const a of attrs) {
      const by = pick(r, BY[level].filter(b => !usedBy.has(b) || level >= 4))
      usedBy.add(by)
      const vals = a === 'shape' ? shuffle(r, SHAPES).slice(0, 3) : shuffle(r, VALS[a])
      vary[a] = { by, vals }
    }
    const fixed = {}
    if (useRot) fixed.shape = 'arrow'
    else if (!vary.shape) fixed.shape = pick(r, SHAPES)
    if (!vary.fill) fixed.fill = pick(r, ['empty', 'full', 'striped'])
    if (vary.count && !vary.size) fixed.size = 's'
    const m = { vary, fixed }
    const ans = matrixCell(m, 2, 2)
    // every cell must differ from at least one other in the row → a real pattern, not a constant grid
    const wrong = []
    for (const [a, v] of Object.entries(vary)) for (const val of v.vals) if (val !== ans[a]) wrong.push({ ...ans, [a]: val })
    for (const a of ['fill', 'size', 'count']) if (!vary[a]) for (const val of VALS[a]) if (val !== ans[a]) wrong.push({ ...ans, [a]: val })
    const o = withOptions(r, ans, shuffle(r, wrong))
    if (o) return { id: gid('m'), level: Math.min(level, 3), ...m, ...o }
  }
  return { ...pick(r, MATRICES), id: gid('m') }
}

// ── verbal analogies from the opposites / synonyms word pairs ──
export function genAnalogy(level, r = Math.random) {
  const setId = level >= 3 && r() < 0.5 ? 'synonyms' : 'opposites'
  const set = WORD_SETS[setId], other = WORD_SETS[setId === 'opposites' ? 'synonyms' : 'opposites']
  const lv = Math.min(3, Math.max(1, level - 1 || 1))
  const pairs = set.pairs.filter(p => p.level <= lv && !p.a.includes(' ') && !p.b.includes(' '))
  for (let tries = 0; tries < 40; tries++) {
    const [p1, p2] = shuffle(r, pairs)
    if (!p1 || !p2 || [p1.a, p1.b].includes(p2.a) || [p1.a, p1.b].includes(p2.b)) continue
    const ok = answersFor(set, p2.a)
    // the trap: a word that has the *other* relation to the asked word (its opposite when synonyms are asked, and vice versa)
    const trap = [...answersFor(other, p2.a)]
    const fillers = shuffle(r, set.pairs.filter(p => p.level <= lv).flatMap(p => [p.a, p.b]))
    const wrong = [...trap, ...fillers].filter(w => w !== p2.a && !ok.has(w) && w !== p1.a && w !== p1.b)
    const o = withOptions(r, p2.b, wrong)
    if (!o) continue
    const rel = setId === 'opposites' ? 'הפכים' : 'מילים נרדפות (פירושן דומה)'
    return { id: gid('v'), level: Math.min(level, 3), pair: [p1.a, p1.b], ask: p2.a, ...o, exp: `"${p1.a}" ו"${p1.b}" הן ${rel}. לכן מחפשים את המילה שהיא ${setId === 'opposites' ? 'ההפך' : 'בעלת אותו פירוש'} של "${p2.a}": "${p2.b}".` }
  }
  return { ...pick(r, VERBAL), id: gid('v') }
}

// ── "which word doesn't belong?" ──
const GROUPS = [
  ['פירות', ['תפוח', 'בננה', 'אגס', 'ענבים', 'תות', 'אבטיח', 'שזיף', 'מנגו']],
  ['ירקות', ['גזר', 'חסה', 'בצל', 'כרוב', 'צנון', 'סלק', 'ברוקולי', 'תפוח אדמה']], // no tomato/cucumber: botanically fruits, a kid could argue,
  ['חיות שחיות בים', ['דג', 'דולפין', 'לוויתן', 'תמנון', 'כריש', 'מדוזה', 'סוסון ים', 'צב ים']],
  ['ציפורים', ['יונה', 'עורב', 'תוכי', 'ינשוף', 'דרור', 'נשר', 'פינגווין', 'חסידה']],
  ['כלי תחבורה', ['אוטובוס', 'רכבת', 'מטוס', 'אופניים', 'אונייה', 'מונית', 'משאית', 'קורקינט']],
  ['כלי נגינה', ['גיטרה', 'פסנתר', 'תוף', 'חליל', 'כינור', 'חצוצרה', 'מפוחית', 'נבל']],
  ['בגדים', ['חולצה', 'מכנסיים', 'שמלה', 'מעיל', 'חצאית', 'סוודר', 'פיג׳מה', 'גופייה']],
  ['רהיטים', ['כיסא', 'שולחן', 'מיטה', 'ארון', 'ספה', 'מדף', 'שידה', 'כורסה']],
  ['מקצועות', ['רופא', 'מורה', 'טבח', 'נגר', 'טייס', 'שוטר', 'גנן', 'צייר']],
  ['צבעים', ['אדום', 'כחול', 'ירוק', 'צהוב', 'סגול', 'כתום', 'ורוד', 'חום']],
  ['חלקי גוף', ['יד', 'רגל', 'אף', 'אוזן', 'ברך', 'כתף', 'מרפק', 'סנטר']],
  ['כלי עבודה', ['פטיש', 'מברג', 'מסור', 'מפתח ברגים', 'צבת', 'מקדחה']],
  ['ימות השבוע', ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']],
  ['חודשים', ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט']],
]
// close pairs make the harder questions: the odd word is "almost" from the same family
const CLOSE = [['פירות', 'ירקות'], ['חיות שחיות בים', 'ציפורים'], ['בגדים', 'רהיטים'], ['ימות השבוע', 'חודשים'], ['כלי נגינה', 'כלי עבודה']]
export function genOddOne(level, r = Math.random) {
  let main, odd
  if (level >= 3 && r() < 0.7) { const [a, b] = shuffle(r, pick(r, CLOSE)); main = GROUPS.find(g => g[0] === a); odd = GROUPS.find(g => g[0] === b) }
  else { [main, odd] = shuffle(r, GROUPS) }
  const three = shuffle(r, main[1].filter(w => !odd[1].includes(w))).slice(0, 3)
  const out = pick(r, odd[1].filter(w => !main[1].includes(w)))
  const options = [...three], answer = int(r, 0, 3)
  options.splice(answer, 0, out)
  return { id: gid('o'), level: Math.min(level, 3), q: 'איזו מילה לא שייכת לקבוצה?', options, answer, kind: 'odd', exp: `${three.join(', ')} — כולם ${main[0]}. "${out}" שייך ל${odd[0]}, ולכן הוא יוצא הדופן.` }
}

// ── quantitative word problems ──
const NAMES = ['נועה', 'איתי', 'מאיה', 'יונתן', 'תמר', 'עומר', 'שירה', 'אורי', 'ליה', 'דניאל']
const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const QUANT = {
  // a + b, take away, equal sharing
  share: (r, level) => {
    const kids = int(r, 2, level >= 2 ? 6 : 4), each = int(r, 2, level >= 2 ? 9 : 5), total = kids * each, n = pick(r, NAMES)
    return { q: `ל${n} יש ${total} סוכריות. היא מחלקת אותן שווה בשווה בין ${kids} חברים. כמה סוכריות יקבל כל חבר?`, ok: each, wrong: [total - kids, each + 1, each - 1, kids], exp: `${total} לחלק ל־${kids} זה ${each}, כי ${kids}×${each}=${total}.` }
  },
  think: (r, level) => {
    const x = int(r, 2, level >= 3 ? 15 : 9), m = level >= 3 ? int(r, 2, 4) : 1, a = int(r, 1, 9), res = x * m + a
    const q = m === 1 ? `חשבתי על מספר, הוספתי לו ${a} וקיבלתי ${res}. על איזה מספר חשבתי?` : `חשבתי על מספר, כפלתי אותו ב־${m}, הוספתי ${a} וקיבלתי ${res}. על איזה מספר חשבתי?`
    const exp = m === 1 ? `הולכים אחורה: ${res} פחות ${a} זה ${x}.` : `הולכים אחורה: ${res} פחות ${a} זה ${res - a}, ולחלק ל־${m} זה ${x}. בדיקה: ${x}×${m}+${a}=${res}.`
    return { q, ok: x, wrong: [res + a, res - a, x + 1, (res + a) / m, x - 1].filter(Number.isInteger), exp }
  },
  change: (r) => {
    const items = int(r, 2, 5), price = int(r, 3, 9), bill = pick(r, [50, 100]), n = pick(r, NAMES), cost = items * price
    return { q: `${n} קנה ${items} מחברות, כל אחת ב־${price} שקלים, ושילם בשטר של ${bill}. כמה עודף קיבל?`, ok: bill - cost, wrong: [cost, bill - price, bill - cost + price, bill - cost - 1], exp: `${items}×${price}=${cost} שקלים. ${bill} פחות ${cost} זה ${bill - cost}.` }
  },
  legs: (r) => {
    const hens = int(r, 2, 8), dogs = int(r, 1, 6), heads = hens + dogs, legs = hens * 2 + dogs * 4
    return { q: `בחצר יש תרנגולות וכלבים. סופרים ${heads} ראשים ו־${legs} רגליים. כמה כלבים יש בחצר?`, ok: dogs, wrong: [hens, heads - 1, dogs + 1, legs / 4 | 0].filter(v => v !== dogs), exp: `אילו כולם היו תרנגולות, היו ${heads * 2} רגליים. יש ${legs - heads * 2} רגליים יותר — וכל כלב מוסיף 2. ${legs - heads * 2}÷2=${dogs} כלבים.` }
  },
  days: (r) => {
    const d = int(r, 0, 6), k = pick(r, [8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 29, 30]), target = (d + k) % 7
    return { q: `היום יום ${DAYS[d]}. איזה יום יהיה בעוד ${k} ימים?`, ok: `יום ${DAYS[target]}`, wrong: [1, 2, 6, 5].map(s => `יום ${DAYS[(target + s) % 7]}`), exp: `כל 7 ימים חוזרים לאותו יום. ${k} = ${Math.floor(k / 7)}×7 + ${k % 7}, אז סופרים רק ${k % 7} ימים קדימה מיום ${DAYS[d]}: יום ${DAYS[target]}.` }
  },
  clock: (r) => {
    const h = int(r, 7, 11), m = pick(r, [10, 20, 40, 50]), add = pick(r, [35, 45, 50, 75, 90]), tot = h * 60 + m + add
    const fmt = t => `${Math.floor(t / 60) % 24}:${String(t % 60).padStart(2, '0')}`
    return { q: `השעה ${fmt(h * 60 + m)}. הסרט נמשך ${add} דקות. מתי הוא ייגמר?`, ok: fmt(tot), wrong: [fmt(tot + 10), fmt(tot - 10), fmt(h * 60 + m + add % 60), fmt(tot + 60)], exp: `${add >= 60 ? `${add} דקות זה שעה ו־${add - 60} דקות. ` : ''}מ־${fmt(h * 60 + m)} מוסיפים ${add} דקות ומקבלים ${fmt(tot)}.` }
  },
  ages: (r) => {
    const younger = int(r, 5, 12), d = int(r, 2, 6), k = int(r, 2, 5), older = younger + d, sum = older + younger + 2 * k, [a, b] = shuffle(r, NAMES).slice(0, 2)
    return { q: `${a} מבוגר מ${b} ב־${d} שנים. בעוד ${k} שנים סכום הגילים שלהם יהיה ${sum}. בן כמה ${a} היום?`, ok: older, wrong: [older + k, younger, (sum + d) / 2, older - 1].filter(Number.isInteger), exp: `בעוד ${k} שנים כל אחד גדל ב־${k}, אז היום הסכום הוא ${sum}−${2 * k}=${sum - 2 * k}. אם ${a} מבוגר ב־${d}: (${sum - 2 * k}+${d})÷2=${older}.` }
  },
  fraction: (r) => {
    const parts = pick(r, [3, 4, 5]), total = parts * int(r, 4, 12) * 2, first = total / parts, rest = total - first
    return { q: `בספר ${total} עמודים. ביום הראשון קראו ${parts === 3 ? 'שליש' : parts === 4 ? 'רבע' : 'חמישית'} מהספר, וביום השני חצי ממה שנשאר. כמה עמודים נשארו?`, ok: rest / 2, wrong: [first, rest, total / 2, rest / 2 + first].filter(v => v !== rest / 2), exp: `${parts === 3 ? 'שליש' : parts === 4 ? 'רבע' : 'חמישית'} מ־${total} זה ${first}, נשארו ${rest}. חצי מהם נקראו ביום השני, ולכן נשארו ${rest / 2}.` }
  },
  consecutive: (r) => {
    const mid = int(r, 8, 40), n = pick(r, [3, 5]), sum = mid * n, big = mid + (n - 1) / 2
    return { q: `סכום של ${n} מספרים עוקבים (שבאים זה אחרי זה) הוא ${sum}. מהו הגדול מביניהם?`, ok: big, wrong: [mid, big + 1, big - 1, sum / (n - 1) | 0].filter(v => v !== big), exp: `${sum}÷${n}=${mid} — זה המספר האמצעי. ${n === 3 ? `המספרים: ${mid - 1}, ${mid}, ${mid + 1}` : `המספרים: ${mid - 2}…${mid + 2}`}, והגדול הוא ${big}.` }
  },
}
const QUANT_BY_LEVEL = { 1: ['share', 'think', 'days'], 2: ['share', 'think', 'change', 'clock', 'days'], 3: ['think', 'change', 'clock', 'legs', 'days'], 4: ['legs', 'ages', 'fraction', 'think', 'consecutive'], 5: ['ages', 'fraction', 'consecutive', 'legs'] }
export function genQuant(level, r = Math.random) {
  for (let tries = 0; tries < 30; tries++) {
    const kind = pick(r, QUANT_BY_LEVEL[level]), p = QUANT[kind](r, level)
    const o = withOptions(r, String(p.ok), p.wrong.map(String))
    if (o) return { id: gid('q'), level: Math.min(level, 3), q: p.q, ...o, kind, exp: p.exp }
  }
  return { ...pick(r, LOGIC), id: gid('q') }
}

// The three areas of the test (and of the psychometric exam later on).
export const DOMAINS = [
  { key: 'verbal', label: 'מילולי', emoji: '🔤', desc: 'אנלוגיות ו"מה לא שייך"' },
  { key: 'quant', label: 'כמותי', emoji: '🔢', desc: 'סדרות מספרים ובעיות חשבון חכמות' },
  { key: 'figural', label: 'צורני', emoji: '🔷', desc: 'מטריצות צורות 3×3' },
]
const BANK = { verbal: [...VERBAL, ...ADV_VERBAL], logic: [...LOGIC, ...ADV_LOGIC] }

// One question of a domain at a level → { type, item } (type decides how the quiz shows it).
export function genQuestion(domain, level, r = Math.random) {
  if (domain === 'figural') return { type: 'matrices', item: genMatrix(level, r) }
  if (domain === 'quant') return r() < 0.5 ? { type: 'series', item: genSeries(level, r) } : { type: 'logic', item: genQuant(level, r) }
  const x = r()
  if (x < 0.45) return { type: 'verbal', item: genAnalogy(level, r) }
  if (x < 0.75) return { type: 'logic', item: genOddOne(level, r) }
  // a hand-written analogy at the right level, for variety (the bank has richer relations than opposites)
  const lv = Math.min(level, 4), bank = BANK.verbal.filter(i => i.level === lv || (lv === 4 && i.level >= 3))
  return { type: 'verbal', item: { ...pick(r, bank), id: gid('b') } }
}

// A round: n questions, domains mixed (or one domain), levels from the grade.
export function genRound(gradeId, domain = 'all', n = 10, r = Math.random) {
  const g = gradeById(gradeId)
  const doms = domain === 'all' ? DOMAINS.map(d => d.key) : [domain]
  return Array.from({ length: n }, (_, i) => genQuestion(doms[i % doms.length], pick(r, g.levels), r))
}

// A full practice test in three timed parts, like the real one is built (not its exact content).
export const SIM_PARTS = [
  { domain: 'verbal', title: 'פרק מילולי', n: 10, minutes: 10 },
  { domain: 'quant', title: 'פרק כמותי', n: 10, minutes: 12 },
  { domain: 'figural', title: 'פרק צורני', n: 8, minutes: 10 },
]
export const genSimulation = (gradeId, r = Math.random) => SIM_PARTS.map(p => ({ ...p, qs: genRound(gradeId, p.domain, p.n, r) }))

// keep the bank series importable for callers that want a fixed example
export { SERIES }
