// Data for /speech/language/prepositions — spatial concepts (מילות יחס ומושגים מרחביים):
// the graded concept list, the "where is the cat?" pictures and the contrast groups they are shown
// in, the "put the … " room (tap zones and what is true of each zone), and the instruction
// generator shared by the game and the cut-and-paste sheets. Plain Hebrew, no niqqud — the texts
// are also what speak() reads. The pictures themselves are drawn in PrepositionsArt.jsx.

// Levels follow the order reported across languages by Johnston & Slobin (1979): in, on, under
// first; next to; then between and in front / behind. Right / left are learned much later and
// start on the child's own body, so they are a separate, last level.
export const LEVELS = [
  { id: 1, label: 'שלב 1', name: 'בתוך, על, מתחת, למעלה ולמטה', desc: 'המושגים הראשונים — מתרגלים קודם בתנועה ועם חפצים.' },
  { id: 2, label: 'שלב 2', name: 'ליד, מחוץ ל, מעל, קרוב ורחוק', desc: 'מוסיפים מושגים שמשווים בין מקומות קרובים.' },
  { id: 3, label: 'שלב 3', name: 'לפני, מאחורי ובין', desc: 'מושגים שתלויים בנקודת מבט ובשני חפצים.' },
  { id: 4, label: 'מתקדם', name: 'ימין ושמאל', desc: 'מתחילים מהגוף של הילד/ה, ורק אחר כך בתמונה.' },
]
export const levelById = Object.fromEntries(LEVELS.map(l => [l.id, l]))

// move: an idea with the body; objects: an idea with real things at home or in the gan.
export const CONCEPTS = [
  { id: 'in', word: 'בתוך', level: 1, pair: 'out', scene: 'in-box',
    move: 'נכנסים לתוך חישוק, לתוך קופסת קרטון גדולה או לתוך „בית” של שמיכה.',
    objects: 'מכניסים צעצועים לתוך הסל בזמן הסידור: „הדובי בתוך הסל!”' },
  { id: 'on', word: 'על', level: 1, pair: 'under', scene: 'on-table',
    move: 'יושבים על כרית, עומדים על השטיח, שמים יד על הראש.',
    objects: 'מושיבים את הבובה על הכיסא ושמים את הכוס על הצלחת.' },
  { id: 'under', word: 'מתחת ל…', level: 1, pair: 'on', scene: 'under-table',
    move: 'זוחלים מתחת לשולחן, מתחבאים מתחת לשמיכה.',
    objects: 'מחביאים כדור מתחת לכרית, ושואלים: „איפה הכדור?”' },
  { id: 'up', word: 'למעלה', level: 1, pair: 'down', scene: 'up-tree',
    move: 'מותחים ידיים למעלה, קופצים למעלה, עולים במדרגות.',
    objects: 'שמים את הספר למעלה על המדף, ואת הנעליים למטה.' },
  { id: 'down', word: 'למטה', level: 1, pair: 'up', scene: 'down-tree',
    move: 'מתכופפים למטה, יורדים במגלשה, „מעלית” בידיים: למעלה… ולמטה!',
    objects: 'מפילים בעדינות כרית: „היא נפלה למטה”.' },
  { id: 'next', word: 'ליד', level: 2, pair: null, scene: 'next-box',
    move: 'עומדים ליד הדלת, יושבים ליד אבא, הולכים ליד הקיר.',
    objects: 'מושיבים את הדובי ליד הצלחת בארוחה של כאילו.' },
  { id: 'out', word: 'מחוץ ל…', level: 2, pair: 'in', scene: 'out-box',
    move: 'חישוק על הרצפה: קופצים פנימה — ובחוץ! „עכשיו אני מחוץ לחישוק”.',
    objects: 'מוציאים את הקוביות מחוץ לקופסה, ומחזירים פנימה.' },
  { id: 'above', word: 'מעל', level: 2, pair: 'under', scene: 'above-box',
    move: 'מחזיקים כדור מעל הראש, מעבירים יד מעל השולחן בלי לגעת.',
    objects: 'מטוס צעצוע „עף” מעל הבית של הקוביות. „על” נוגע — „מעל” לא נוגע.' },
  { id: 'near', word: 'קרוב', level: 2, pair: 'far', scene: 'near-house',
    move: 'הולכים קרוב לקיר — ורחוק ממנו; עומדים קרוב או רחוק מהסל וזורקים כדור.',
    objects: 'בגינה: „הנדנדה קרובה אלינו, והמגלשה רחוקה”.' },
  { id: 'far', word: 'רחוק', level: 2, pair: 'near', scene: 'far-house',
    move: 'צעדי ענק כדי להגיע רחוק, צעדי נמלה כדי להישאר קרוב.',
    objects: 'מניחים שני צעצועים — אחד קרוב ואחד רחוק — ושואלים איזה מהם קרוב.' },
  { id: 'front', word: 'לפני', level: 3, pair: 'behind', scene: 'front-box',
    move: 'עומדים בתור: „נועה לפני יואב, ויואב מאחורי נועה”.',
    objects: 'מעמידים בובות בטור ומספרים מי לפני מי.' },
  { id: 'behind', word: 'מאחורי', level: 3, pair: 'front', scene: 'behind-box',
    move: 'מתחבאים מאחורי הספה או מאחורי הווילון — „איפה אני?”',
    objects: 'מחביאים צעצוע מאחורי ספר, ומגלים לאט־לאט.' },
  { id: 'between', word: 'בין', level: 3, pair: null, scene: 'between-ct',
    move: 'עומדים בין אבא לאמא, או בין שני כיסאות.',
    objects: 'שמים כפית בין הצלחת לכוס, וקובייה בין שתי קוביות.' },
  { id: 'right', word: 'מימין ל…', level: 4, pair: 'left', scene: 'right-box',
    move: 'צמיד או מדבקה על יד ימין: „הרימו יד ימין”, „רגל ימין קדימה”.',
    objects: 'רק אחרי שהגוף מוכר: „שימו את הכוס מימין לצלחת”.' },
  { id: 'left', word: 'משמאל ל…', level: 4, pair: 'right', scene: 'left-box',
    move: 'מוחאים כף ביד שמאל, קופצים על רגל שמאל.',
    objects: 'מסדרים שולחן יחד: המזלג משמאל לצלחת.' },
]
export const conceptById = Object.fromEntries(CONCEPTS.map(c => [c.id, c]))

// "Where is the cat?" pictures. ref = the drawing around the cat; s = the sentence that describes it.
// extra: a picture used only inside its contrast group (its sentence repeats another picture's).
export const SCENES = [
  { id: 'in-box', concept: 'in', ref: 'box', s: 'החתול בתוך הקופסה' },
  { id: 'on-box', concept: 'on', ref: 'box', s: 'החתול על הקופסה' },
  { id: 'on-table', concept: 'on', ref: 'table', s: 'החתול על השולחן' },
  { id: 'under-table', concept: 'under', ref: 'table', s: 'החתול מתחת לשולחן' },
  { id: 'on-chair', concept: 'on', ref: 'chair', s: 'החתול על הכיסא' },
  { id: 'under-chair', concept: 'under', ref: 'chair', s: 'החתול מתחת לכיסא' },
  { id: 'up-tree', concept: 'up', ref: 'tree', s: 'החתול למעלה על העץ' },
  { id: 'down-tree', concept: 'down', ref: 'tree', s: 'החתול למטה על הדשא' },
  { id: 'next-box', concept: 'next', ref: 'box', s: 'החתול ליד הקופסה' },
  { id: 'next-table', concept: 'next', ref: 'table', s: 'החתול ליד השולחן' },
  { id: 'next-chair', concept: 'next', ref: 'chair', s: 'החתול ליד הכיסא' },
  { id: 'out-box', concept: 'out', ref: 'box', s: 'החתול מחוץ לקופסה' },
  { id: 'above-box', concept: 'above', ref: 'box', s: 'החתול קופץ מעל הקופסה' },
  { id: 'near-house', concept: 'near', ref: 'house', s: 'החתול קרוב לבית' },
  { id: 'far-house', concept: 'far', ref: 'house', s: 'החתול רחוק מהבית' },
  { id: 'front-box', concept: 'front', ref: 'box', s: 'החתול לפני הקופסה' },
  { id: 'behind-box', concept: 'behind', ref: 'box', s: 'החתול מאחורי הקופסה' },
  { id: 'between-ct', concept: 'between', ref: 'chairTable', s: 'החתול בין הכיסא לשולחן' },
  { id: 'on-ct', concept: 'on', ref: 'chairTable', s: 'החתול על הכיסא', extra: true },
  { id: 'under-ct', concept: 'under', ref: 'chairTable', s: 'החתול מתחת לשולחן', extra: true },
  { id: 'right-box', concept: 'right', ref: 'box', s: 'החתול מימין לקופסה' },
  { id: 'left-box', concept: 'left', ref: 'box', s: 'החתול משמאל לקופסה' },
]
export const sceneById = Object.fromEntries(SCENES.map(s => [s.id, s]))
export const levelOfScene = id => conceptById[sceneById[id].concept].level
export const CARD_SCENES = SCENES.filter(s => !s.extra)

// Contrast groups: pictures shown side by side in the game. Within a group only one picture fits
// each sentence (e.g. "outside the box" is never shown next to "next to the box").
export const GROUPS = [
  ['in-box', 'on-box'],
  ['on-table', 'under-table'],
  ['on-chair', 'under-chair'],
  ['up-tree', 'down-tree'],
  ['in-box', 'on-box', 'next-box'],
  ['on-table', 'under-table', 'next-table'],
  ['on-chair', 'under-chair', 'next-chair'],
  ['in-box', 'out-box'],
  ['on-box', 'above-box', 'next-box'],
  ['near-house', 'far-house'],
  ['front-box', 'behind-box'],
  ['front-box', 'behind-box', 'on-box'],
  ['between-ct', 'on-ct', 'under-ct'],
  ['right-box', 'left-box'],
  ['right-box', 'left-box', 'on-box'],
].map(ids => ({ ids, level: Math.max(...ids.map(levelOfScene)) }))

// Seeded random numbers (same as the other language pages), so a printed set is stable.
export function seeded(seed) {
  let a = typeof seed === 'number' ? seed >>> 0 : [...String(seed)].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261)
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
export function shuffle(list, rand = Math.random) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
const pick = (list, rand) => list[Math.floor(rand() * list.length)]

// One round of "where is the cat?" at a level: a group that includes something new at this level
// (earlier groups now and then, for review), the target, and the pictures in random order.
export function whereRound(level, rand = Math.random, avoid = null) {
  const fresh = GROUPS.filter(g => g.level === level)
  const review = GROUPS.filter(g => g.level < level)
  const pool = review.length && rand() < 0.25 ? review : fresh
  const group = pick(pool, rand)
  const newOnes = group.ids.filter(id => levelOfScene(id) === level)
  let options = newOnes.length && pool === fresh ? newOnes : group.ids
  if (avoid && options.length > 1) options = options.filter(id => id !== avoid)
  const target = pick(options, rand)
  return { ids: shuffle(group.ids, rand), target }
}

// ── "Put the …" room ─────────────────────────────────────────────────────────────────────
// Things to place (the plural imperative fits a group and avoids choosing a gender).
export const THINGS = [
  { id: 'ball', name: 'הכדור', e: '⚽' },
  { id: 'teddy', name: 'הדובי', e: '🧸' },
  { id: 'apple', name: 'התפוח', e: '🍎' },
  { id: 'duck', name: 'הברווז', e: '🦆' },
  { id: 'car', name: 'המכונית', e: '🚗' },
  { id: 'book', name: 'הספר', e: '📕' },
]
export const thingById = Object.fromEntries(THINGS.map(t => [t.id, t]))

// What can be asked about the room. zones: every place where the instruction is true.
export const FACTS = [
  { id: 'on-table', concept: 'on', text: 'על השולחן', zones: ['onTable'] },
  { id: 'under-table', concept: 'under', text: 'מתחת לשולחן', zones: ['underTable'] },
  { id: 'on-chair', concept: 'on', text: 'על הכיסא', zones: ['onChair'] },
  { id: 'under-chair', concept: 'under', text: 'מתחת לכיסא', zones: ['underChair'] },
  { id: 'in-box', concept: 'in', text: 'בתוך הקופסה', zones: ['inBox'] },
  { id: 'up-shelf', concept: 'up', text: 'למעלה, במדף העליון', zones: ['shelfTop'] },
  { id: 'down-shelf', concept: 'down', text: 'למטה, במדף התחתון', zones: ['shelfBottom'] },
  { id: 'next-box', concept: 'next', text: 'ליד הקופסה', zones: ['gapTableBox', 'rightOfBox'] },
  { id: 'between-chair-table', concept: 'between', text: 'בין הכיסא לשולחן', zones: ['gapChairTable'] },
  { id: 'between-table-box', concept: 'between', text: 'בין השולחן לקופסה', zones: ['gapTableBox'] },
  { id: 'right-box', concept: 'right', text: 'מימין לקופסה', zones: ['rightOfBox'] },
  { id: 'left-box', concept: 'left', text: 'משמאל לקופסה', zones: ['gapTableBox'] },
]
export const factById = Object.fromEntries(FACTS.map(f => [f.id, f]))
export const levelOfFact = f => conceptById[f.concept].level

// Zones of the room, with the words that describe a thing placed there (used when the child puts
// it somewhere else: the game says where it is now, which models the word).
export const ZONES = [
  { id: 'shelfTop', where: 'למעלה, במדף העליון' },
  { id: 'shelfBottom', where: 'למטה, במדף התחתון' },
  { id: 'onChair', where: 'על הכיסא' },
  { id: 'underChair', where: 'מתחת לכיסא' },
  { id: 'gapChairTable', where: 'בין הכיסא לשולחן' },
  { id: 'onTable', where: 'על השולחן' },
  { id: 'underTable', where: 'מתחת לשולחן' },
  { id: 'gapTableBox', where: 'בין השולחן לקופסה' },
  { id: 'inBox', where: 'בתוך הקופסה' },
  { id: 'rightOfBox', where: 'ליד הקופסה' },
]
export const zoneById = Object.fromEntries(ZONES.map(z => [z.id, z]))

export const placeText = (thing, fact, verb = 'שימו') => `${verb} את ${thing.name} ${fact.text}`

// One instruction for the game: mostly a fact new at this level, sometimes an earlier one.
export function placeRound(level, rand = Math.random, avoid = null) {
  const fresh = FACTS.filter(f => levelOfFact(f) === level)
  const review = FACTS.filter(f => levelOfFact(f) < level)
  let pool = (review.length && rand() < 0.3) || !fresh.length ? review : fresh
  if (avoid && pool.length > 1) pool = pool.filter(f => f.id !== avoid)
  return { fact: pick(pool, rand), thing: pick(THINGS, rand) }
}

// A cut-and-paste sheet: six different things, six instructions whose places don't overlap, so
// every thing has its own spot. Includes everything new at the level, filled up with review.
export function sheetPlan(level, seed) {
  const rand = seeded(`prep-${level}-${seed}`)
  const fresh = shuffle(FACTS.filter(f => levelOfFact(f) === level), rand)
  const review = shuffle(FACTS.filter(f => levelOfFact(f) < level), rand)
  const chosen = []
  const used = new Set()
  for (const f of [...fresh, ...review]) {
    if (chosen.length === 6) break
    if (f.zones.some(z => used.has(z))) continue
    chosen.push(f)
    f.zones.forEach(z => used.add(z))
  }
  const things = shuffle(THINGS, rand)
  return shuffle(chosen, rand).map((fact, i) => ({ fact, thing: things[i] }))
}

// Prompts for the child to describe (expressive language). The adult can reveal a model sentence.
export const TALK_PROMPTS = [
  { q: 'איפה הנעליים שלך עכשיו?', e: '👟' },
  { q: 'איפה ישן החתול / הכלב / הדובי בלילה?', e: '🛏️' },
  { q: 'מה יש בתוך התיק שלך?', e: '🎒' },
  { q: 'מי יושב לידך בארוחת ערב?', e: '🍽️' },
  { q: 'מה יש מתחת למיטה שלך?', e: '🧸' },
  { q: 'מה למעלה בשמיים ומה למטה על האדמה?', e: '☁️' },
  { q: 'מי עומד לפניך ומי מאחוריך בתור?', e: '🚶' },
  { q: 'איפה החבאת את הצעצוע? תנו לי רמז במילה אחת!', e: '🔎' },
]
