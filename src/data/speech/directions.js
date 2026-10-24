// Data for /speech/language/directions — graded instructions (1 → 2 → 3 steps, basic concepts,
// "before/after"), the items of the listening-game scene, printable instruction cards and a
// "הרצל אמר" movement list. All instructions use the plural imperative (צבעו, הקיפו, קומו), which
// fits a group in the gan and avoids choosing a gender; an adult can switch to the singular.
// Texts are plain Hebrew (no niqqud) — they are also what speak() reads.

// ── The scene used by the game and the colouring sheets ────────────────────────────────────
// name: a plain name that is unique in the scene (level "one");
// refs: descriptions that need a concept to find the item (level "concepts").
export const SCENE_ITEMS = [
  { id: 'sun', name: 'השמש', refs: [] },
  { id: 'cloud', name: 'הענן', refs: [] },
  { id: 'house', name: 'הבית', refs: [] },
  { id: 'tree', name: 'העץ', refs: [] },
  { id: 'table', name: 'השולחן', refs: [] },
  { id: 'box', name: 'הקופסה', refs: [] },
  { id: 'cat', name: 'החתול', refs: ['החתול שמתחת לשולחן'] },
  { id: 'cup', name: 'הכוס', refs: ['הכוס שעל השולחן'] },
  { id: 'duckMom', name: 'אמא ברווזה', refs: ['הברווזה הגדולה'] },
  { id: 'ballBig', name: null, refs: ['הכדור הגדול', 'הכדור שליד הקופסה'] },
  { id: 'ballSmall', name: null, refs: ['הכדור הקטן', 'הכדור שבתוך הקופסה'] },
  { id: 'flowerBig', name: null, refs: ['הפרח הגדול'] },
  { id: 'flowerSmall', name: null, refs: ['הפרח הקטן'] },
  { id: 'birdUp', name: null, refs: ['הציפור שלמעלה', 'הציפור שבשמיים'] },
  { id: 'birdDown', name: null, refs: ['הציפור שלמטה', 'הציפור שעל הדשא'] },
  { id: 'duck1', name: null, refs: ['הברווזון הראשון'] },
  { id: 'duck2', name: null, refs: ['הברווזון שבאמצע'] },
  { id: 'duck3', name: null, refs: ['הברווזון האחרון'] },
]
export const itemById = Object.fromEntries(SCENE_ITEMS.map(i => [i.id, i]))

export const COLORS = [
  { id: 'red', name: 'אדום', hex: '#ef4444' },
  { id: 'blue', name: 'כחול', hex: '#3b82f6' },
  { id: 'yellow', name: 'צהוב', hex: '#facc15' },
  { id: 'green', name: 'ירוק', hex: '#22c55e' },
  { id: 'orange', name: 'כתום', hex: '#fb923c' },
  { id: 'purple', name: 'סגול', hex: '#a855f7' },
]
export const colorById = Object.fromEntries(COLORS.map(c => [c.id, c]))

export const LEVELS = [
  { id: 'one', label: 'שלב אחד', short: '1', steps: 1, desc: 'הוראה אחת, עם שם פשוט של דבר בתמונה: „הקיפו את הבית”.' },
  { id: 'concepts', label: 'שלב אחד + מושג', short: '1+', steps: 1, desc: 'הוראה אחת, אבל כדי למצוא את הדבר צריך להבין מושג: גדול/קטן, למעלה/למטה, בתוך, על, מתחת, ליד, ראשון/אחרון.' },
  { id: 'two', label: 'שני שלבים', short: '2', steps: 2, desc: 'שתי פעולות ברצף: „צבעו בכחול את הענן, ואז הקיפו את החתול”.' },
  { id: 'three', label: 'שלושה שלבים', short: '3', steps: 3, desc: 'שלוש פעולות ברצף — צריך לזכור את כולן ואת הסדר.' },
  { id: 'time', label: 'לפני / אחרי', short: '⏱', steps: 2, desc: 'סדר הפעולות שונה מסדר המילים: „לפני שתצבעו את השמש, הקיפו את העץ” — קודם מקיפים.' },
]
export const levelById = Object.fromEntries(LEVELS.map(l => [l.id, l]))

// Deterministic random numbers, so printed sheets are stable.
export function seeded(seed) {
  let h = 2166136261
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => {
    h = (h + 0x6D2B79F5) | 0
    let t = Math.imul(h ^ (h >>> 15), h | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const pick = (list, rnd) => list[Math.floor(rnd() * list.length)]

// One action as text. form: 'imp' (צבעו) or 'fut' (תצבעו, after "לפני ש" / "אחרי ש").
// medium: 'screen' (the game has a star sticker) or 'print' (on paper you draw a star).
export function actionText(step, form = 'imp', medium = 'screen') {
  const ref = step.ref
  const fut = form === 'fut'
  if (step.type === 'color') return `${fut ? 'תצבעו' : 'צבעו'} ב${colorById[step.color].name} את ${ref}`
  if (step.type === 'circle') return `${fut ? 'תקיפו' : 'הקיפו'} את ${ref}`
  const verb = medium === 'print' ? (fut ? 'תציירו' : 'ציירו') : (fut ? 'תשימו' : 'שימו')
  return `${verb} כוכב על ${ref}`
}

const STEP_TYPES = ['color', 'color', 'color', 'circle', 'circle', 'star']

function makeStep(level, rnd, used) {
  const free = SCENE_ITEMS.filter(i => !used.has(i.id))
  let pool
  if (level === 'one') pool = free.filter(i => i.name)
  else if (level === 'concepts') pool = free.filter(i => i.refs.length)
  else pool = free
  if (!pool.length) return null
  const item = pick(pool, rnd)
  used.add(item.id)
  // In the longer levels, mix plain names and concept descriptions.
  const ref = level === 'one' ? item.name
    : level === 'concepts' ? pick(item.refs, rnd)
      : item.name && (!item.refs.length || rnd() < 0.5) ? item.name : pick(item.refs, rnd)
  const type = pick(STEP_TYPES, rnd)
  return { type, item: item.id, ref, ...(type === 'color' ? { color: pick(COLORS, rnd).id } : {}) }
}

// An instruction: { level, steps (in the order they should be DONE), text }.
// `used` (a Set of item ids) lets a printed sheet avoid using an item twice.
export function makeInstruction(level, rnd = Math.random, used = new Set(), medium = 'screen') {
  const n = levelById[level].steps
  const steps = []
  for (let i = 0; i < n; i++) {
    const s = makeStep(level, rnd, used)
    if (!s) return null
    steps.push(s)
  }
  let text
  const imp = s => actionText(s, 'imp', medium), fut = s => actionText(s, 'fut', medium)
  if (n === 1) text = `${imp(steps[0])}.`
  else if (level === 'two') text = `${imp(steps[0])}, ואז ${imp(steps[1])}.`
  else if (level === 'three') text = `${imp(steps[0])}, אחר כך ${imp(steps[1])}, ובסוף ${imp(steps[2])}.`
  else {
    // "before / after": the order of the words is not always the order of the actions.
    const [a, b] = steps
    const form = Math.floor(rnd() * 3)
    if (form === 0) text = `לפני ש${fut(b)}, ${imp(a)}.`
    else if (form === 1) text = `אחרי ש${fut(a)}, ${imp(b)}.`
    else text = `${imp(b)} — אבל קודם ${imp(a)}.`
  }
  return { level, steps, text }
}

// Instructions for one printed colouring sheet: no item is used twice on the same sheet.
export const SHEET_COUNTS = { one: 6, concepts: 6, two: 5, three: 4, time: 5 }
export function sheetInstructions(level, seed = 'sheet') {
  const rnd = seeded(`${level}-${seed}`)
  const used = new Set(), list = []
  for (let i = 0; i < SHEET_COUNTS[level]; i++) {
    const ins = makeInstruction(level, rnd, used, 'print')
    if (!ins) break
    list.push(ins)
  }
  return list
}

// Does what the child did match the instruction? `log` is the list of actions in the order they
// were done ({ type, item, color }). Returns 'done', 'order' (all steps done, other order) or 'open'.
export function checkLog(steps, log) {
  const at = steps.map(s => {
    for (let i = log.length - 1; i >= 0; i--) {
      const a = log[i]
      if (a.type === s.type && a.item === s.item && (s.type !== 'color' || a.color === s.color)) return i
    }
    return -1
  })
  if (at.some(i => i < 0)) return 'open'
  return at.every((v, i) => i === 0 || v > at[i - 1]) ? 'done' : 'order'
}

// ── Basic concepts (shown on the page) ─────────────────────────────────────────────────────
export const CONCEPTS = [
  { id: 'updown', label: 'למעלה / למטה', e: '⬆️', idea: 'מרימים צעצוע למעלה ומורידים למטה; „הציפור למעלה בשמיים, הכלב למטה על הדשא”.' },
  { id: 'onunder', label: 'על / מתחת', e: '🪑', idea: 'מחביאים בובה מתחת לכיסא ושמים כדור על הכיסא; מבקשים מהילד/ה למצוא ולהחזיר.' },
  { id: 'inout', label: 'בתוך / מחוץ ל…', e: '📦', idea: 'משחק קופסה: מכניסים ומוציאים חפצים, ומתארים בקול מה נמצא בתוך הקופסה ומה מחוץ לה.' },
  { id: 'near', label: 'ליד / רחוק מ…', e: '🧸', idea: '„שבו ליד הדובי”, „שימו את הנעליים ליד הדלת” — בהתחלה מצביעים, ואחר כך רק אומרים.' },
  { id: 'beforeafter', label: 'לפני / אחרי', e: '⏱️', idea: 'מושג של זמן: „לפני שיוצאים — נועלים נעליים”. קשה יותר כשסדר המילים הפוך לסדר הפעולות.' },
  { id: 'order', label: 'ראשון / אחרון / באמצע', e: '🦆', idea: 'עומדים בתור, מסדרים בובות בשורה או רכבת של קוביות: מי ראשון? מי אחרון? מי באמצע?' },
  { id: 'size', label: 'גדול / קטן', e: '🐘', idea: 'מיון כפות, כדורים או קוביות לגדולים וקטנים; אחר כך „הכי גדול” ו„הכי קטן”.' },
  { id: 'colors', label: 'צבעים', e: '🎨', idea: '„תנו לי את הקובייה הצהובה” — בהתחלה שני צבעים לבחירה, ואחר כך יותר.' },
]

// ── Printable instruction cards (an adult reads them; the child does what was said) ──────
export const CARD_LEVELS = [
  { id: 1, label: 'שלב אחד', cards: [
    'מחאו כפיים.',
    'געו באף.',
    'הביאו לי כפית.',
    'שימו את הספר על הכיסא.',
    'הצביעו על החלון.',
    'שבו על הרצפה.',
    'הרימו את הידיים למעלה.',
    'הכניסו את העיפרון לקלמר.',
    'קפצו פעם אחת.',
    'הביאו לי משהו אדום.',
    'סגרו את הספר.',
    'שימו את הכרית מתחת לשולחן.',
  ] },
  { id: 2, label: 'שני שלבים', cards: [
    'געו בברכיים, ואז מחאו כפיים.',
    'קחו את הכדור ושימו אותו בתוך הסל.',
    'קומו ולכו אל הדלת.',
    'הביאו לי כפית ומגבת.',
    'שימו את הספר על השולחן ושבו על הכיסא.',
    'הצביעו על התקרה, ואחר כך על הרצפה.',
    'קפצו פעמיים, ואז שבו.',
    'קחו עיפרון כחול וציירו עיגול.',
    'שימו את הבובה מתחת לכיסא ואת הכדור על הכיסא.',
    'הביאו את הנעליים ושימו אותן ליד הדלת.',
    'לפני שתשבו, הסתובבו פעם אחת.',
    'אחרי שתמחאו כפיים, געו בראש.',
  ] },
  { id: 3, label: 'שלושה שלבים', cards: [
    'קומו, לכו אל החלון ונופפו לשלום.',
    'קחו את הספר, שימו אותו על המדף וחזרו לשבת.',
    'געו באף, אחר כך באוזניים, ובסוף בבטן.',
    'הביאו לי כפית, כוס ומפית.',
    'קפצו פעמיים, הסתובבו ושבו על הרצפה.',
    'הורידו נעל אחת, שימו אותה ליד הדלת וחזרו אליי.',
    'הכניסו את הכדור לסל, סגרו את הדלת ומחאו כפיים.',
    'ציירו שמש, צבעו אותה בצהוב וציירו ענן לידה.',
    'שימו את הבובה בתוך הקופסה, סגרו אותה ותנו לי אותה.',
    'הרימו את הידיים, געו בכתפיים ושבו.',
    'לפני שתשבו, קחו כרית ושימו אותה על הכיסא.',
    'אחרי שתסגרו את הספר, שימו אותו על המדף ובואו אליי.',
  ] },
]

// ── "הרצל אמר" — movement instructions ────────────────────────────────────────────────────
export const HERZL = [
  { group: 'גוף', items: ['געו בראש', 'געו באף', 'געו באוזניים', 'געו בברכיים', 'שימו ידיים על הבטן', 'עצמו עיניים', 'נופפו לשלום', 'מחאו כפיים שלוש פעמים'] },
  { group: 'תנועה', items: ['קפצו פעמיים', 'עמדו על רגל אחת', 'הסתובבו סביב עצמכם', 'שבו על הרצפה', 'קומו', 'רקעו ברגליים', 'לכו לאט כמו צב', 'רוצו במקום מהר'] },
  { group: 'מושגים', items: ['הרימו ידיים למעלה', 'הורידו ידיים למטה', 'שימו יד על הראש', 'שימו ידיים מאחורי הגב', 'עמדו ליד הכיסא', 'היו ענקים — על קצות האצבעות', 'היו קטנים — התכופפו', 'צעדו צעד אחד קדימה', 'צעדו צעד אחד אחורה'] },
  { group: 'שני שלבים', items: ['מחאו כפיים, ואז קפצו', 'געו באף, ואחר כך בבטן', 'הסתובבו ושבו', 'קומו ונופפו לשלום', 'קפצו פעם אחת ושימו יד על הראש'] },
]
