// /math registry: grades, topic lookup, worksheets and mixed tests. Pure ESM (no JSX) so node tests,
// the pages and the sitemap script can all import it.
import { createRng } from './rng.js'
import { mixSeed } from './gen.js'
import grade1 from './topics/grade1.js'
import grade2 from './topics/grade2.js'
import grade3 from './topics/grade3.js'
import grade4 from './topics/grade4.js'
import grade5 from './topics/grade5.js'
import grade6 from './topics/grade6.js'
import grade7 from './topics/grade7.js'
import grade8 from './topics/grade8.js'
import grade9 from './topics/grade9.js'
import grade10 from './topics/grade10.js'
import grade11 from './topics/grade11.js'
import grade12 from './topics/grade12.js'

const TOPICS = { 1: grade1, 2: grade2, 3: grade3, 4: grade4, 5: grade5, 6: grade6, 7: grade7, 8: grade8, 9: grade9, 10: grade10, 11: grade11, 12: grade12 }

export const STAGES = [
  { id: 'elementary', label: 'יסודי', range: 'כיתות א׳–ו׳', grades: [1, 2, 3, 4, 5, 6] },
  { id: 'middle', label: 'חטיבת ביניים', range: 'כיתות ז׳–ט׳', grades: [7, 8, 9] },
  { id: 'high', label: 'תיכון', range: 'כיתות י׳–י״ב', grades: [10, 11, 12] },
]

const LABELS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳', 'ט׳', 'י׳', 'י״א', 'י״ב']
const AGES = ['6–7', '7–8', '8–9', '9–10', '10–11', '11–12', '12–13', '13–14', '14–15', '15–16', '16–17', '17–18']
const EMOJI = ['🍎', '🧮', '✖️', '➗', '🔢', '📐', '➖', '📈', '🧩', '📊', '∑', '∫']

export const GRADES = LABELS.map((label, i) => {
  const n = i + 1
  const stage = STAGES.find(s => s.grades.includes(n))
  return { n, label, ages: AGES[i], emoji: EMOJI[i], stage: stage.id, stageLabel: stage.label, path: `/math/grade-${n}`, testPath: `/math/tests/grade-${n}` }
})

export const STRANDS = {
  arithmetic: { label: 'מספרים ופעולות חשבון', emoji: '🔢' },
  fractions: { label: 'שברים ומספרים עשרוניים', emoji: '🍕' },
  algebra: { label: 'אלגברה', emoji: '🧩' },
  geometry: { label: 'גאומטריה', emoji: '📐' },
  measurement: { label: 'מדידות', emoji: '📏' },
  data: { label: 'סטטיסטיקה וייצוג נתונים', emoji: '📊' },
  probability: { label: 'הסתברות', emoji: '🎲' },
  functions: { label: 'פונקציות', emoji: '📈' },
  trigonometry: { label: 'טריגונומטריה', emoji: '📐' },
  calculus: { label: 'חשבון דיפרנציאלי ואינטגרלי', emoji: '∫' },
  sequences: { label: 'סדרות', emoji: '🔁' },
  vectors: { label: 'וקטורים', emoji: '➡️' },
}
export const STRAND_ORDER = Object.keys(STRANDS)

export const gradeInfo = n => GRADES[Number(n) - 1] || null

// '/math/grade-3' → 3 ; anything else → null.
export function parseGradeParam(p) {
  const m = String(p ?? '').match(/^grade-(\d{1,2})$/)
  const n = m ? Number(m[1]) : NaN
  return n >= 1 && n <= 12 ? n : null
}

export function topicsFor(grade) {
  const list = TOPICS[Number(grade)]
  return Array.isArray(list) ? list : []
}

export function findTopic(grade, slug) {
  return topicsFor(grade).find(t => t.slug === slug) || null
}

export const topicPath = t => `/math/grade-${t.grade}/${t.slug}`

// Topics of a grade grouped by strand, in a stable strand order.
export function topicsByStrand(grade) {
  const groups = new Map()
  for (const t of topicsFor(grade)) {
    if (!groups.has(t.strand)) groups.set(t.strand, [])
    groups.get(t.strand).push(t)
  }
  return [...groups.entries()]
    .sort((a, b) => STRAND_ORDER.indexOf(a[0]) - STRAND_ORDER.indexOf(b[0]))
    .map(([strand, topics]) => ({ strand, ...(STRANDS[strand] || { label: strand, emoji: '•' }), topics }))
}

// Every /math URL — for the sitemap and the prerender list.
export function allMathPaths() {
  const out = ['/math']
  for (const g of GRADES) {
    out.push(g.path)
    if (topicsFor(g.n).length) out.push(g.testPath)
    for (const t of topicsFor(g.n)) out.push(topicPath(t))
  }
  return out
}

// One exercise from a topic, tagged with its topic slug and level.
export function makeExercise(topic, level, seed) {
  const r = createRng(mixSeed(seed))
  const ex = topic.gen(clampLevel(level), r)
  return { ...ex, topic: topic.slug, grade: topic.grade, level: clampLevel(level) }
}

export const clampLevel = l => Math.min(3, Math.max(1, Number(l) || 1))

const exKey = ex => `${ex.q}|${ex.expr || ''}|${ex.svg ? ex.svg.length : ''}|${String(ex.answer)}`

// Exercises that an easier level of the same topic can also produce (e.g. "5 × 7" is in both "tables
// 2–5" and "tables 6–9"). Sampled once per topic/level from fixed seeds, so it is deterministic.
const lowerCache = new Map()
function lowerLevelKeys(topic, level) {
  const id = `${topic.grade}/${topic.slug}/${level}`
  if (!lowerCache.has(id)) {
    // Stop once the easier pool looks exhausted (400 draws without a new exercise) or after ~50ms per
    // level: big pools rarely collide anyway, and a level click must stay instant on a phone.
    const keys = new Set()
    for (let l = 1; l < level; l++) {
      const t0 = Date.now()
      for (let i = 1, lastNew = 0; i <= 2500 && i - lastNew <= 400 && Date.now() - t0 < 50; i++) {
        const k = exKey(makeExercise(topic, l, i * 7919))
        if (!keys.has(k)) { keys.add(k); lastNew = i }
      }
    }
    lowerCache.set(id, keys)
  }
  return lowerCache.get(id)
}

// The exercise shown first at a level: never one an easier level could also show, so switching level
// always opens on an exercise of that level (when the topic has any of its own).
export function makeLevelExercise(topic, level, seed) {
  const lv = clampLevel(level)
  let ex = makeExercise(topic, lv, seed)
  if (lv === 1) return ex
  const lower = lowerLevelKeys(topic, lv)
  const r = createRng(mixSeed(seed + 17))
  for (let i = 0; i < 60 && lower.has(exKey(ex)); i++) ex = makeExercise(topic, lv, Math.floor(r.next() * 2 ** 31) + 1)
  return ex
}

// n exercises for a printable sheet: reproducible from the seed, avoiding repeats where possible.
// The first one is always of the chosen level only (see makeLevelExercise).
export function makeWorksheet(topic, level, n = 20, seed = 1) {
  const r = createRng(mixSeed(seed))
  const seen = new Set()
  const out = []
  for (let tries = 0; out.length < n && tries < n * 30; tries++) {
    const s = Math.floor(r.next() * 2 ** 31) + 1
    const ex = out.length ? makeExercise(topic, level, s) : makeLevelExercise(topic, level, s)
    const k = exKey(ex)
    if (seen.has(k) && tries < n * 25) continue
    seen.add(k)
    out.push(ex)
  }
  return out
}

// A mixed test over a grade's topics: topics are dealt round-robin from a shuffled order, so every
// topic appears before any repeats. level 0 = mixed levels (easy → hard as the test goes on).
export function makeTest(grade, n = 10, seed = 1, level = 0) {
  const topics = topicsFor(grade)
  if (!topics.length) return []
  const r = createRng(mixSeed(seed))
  let order = r.shuffle(topics)
  const seen = new Set()
  const out = []
  for (let i = 0, tries = 0; out.length < n && tries < n * 30; tries++) {
    if (i >= order.length) { order = r.shuffle(topics); i = 0 }
    const t = order[i]
    const lv = level ? clampLevel(level) : Math.min(3, 1 + Math.floor((out.length / n) * 3))
    const s = Math.floor(r.next() * 2 ** 31) + 1
    const ex = out.length ? makeExercise(t, lv, s) : makeLevelExercise(t, lv, s)
    const k = exKey(ex)
    if (seen.has(k) && tries < n * 25) continue
    seen.add(k)
    out.push({ ...ex, topicTitle: t.title, topicEmoji: t.emoji })
    i++
  }
  return out
}
