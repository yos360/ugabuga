// Ready question banks a teacher can assign as homework ("שאלות מהאתר"): the gifted-area
// enrichment questions and the school-subject lessons. A homework task stores the chosen question
// ids, so the whole class gets the same questions even if a bank grows later.
import { SUBJECTS as LESSON_SUBJECTS, placeQuiz } from '../../learn/subjects/subjects.js'

const GIFTED = [
  ['subj-math', '➗ חשבון ואתגרי מספרים'], ['subj-science', '🔬 מדע וטבע'], ['subj-hebrew', '📜 לשון ועברית'],
  ['subj-geo', '🌍 גאוגרפיה וידע עולם'], ['subj-english', '🔠 אנגלית'], ['verbal', '🔤 אנלוגיות מילוליות'], ['logic', '🧩 חשיבה לוגית'],
]
export const BANKS = [
  ...LESSON_SUBJECTS.map(s => ({ id: `lesson:${s.key}`, label: `${s.emoji} ${s.title}`, group: 'שיעורים לפי מקצוע', topics: true })),
  ...GIFTED.map(([key, label]) => ({ id: `gifted:${key}`, label, group: 'העשרה ומחוננים', levels: true })),
]
export const bankInfo = id => BANKS.find(b => b.id === id) || null

// Every bank question as { id, q, options, correct, exp, level?, topic?, topicTitle? }.
const cache = new Map()
export function loadBank(id) {
  if (!cache.has(id)) cache.set(id, readBank(id).catch(e => { cache.delete(id); throw e }))
  return cache.get(id)
}
async function readBank(id) {
  const [kind, key] = String(id).split(':')
  if (kind === 'lesson') {
    if (!LESSON_SUBJECTS.some(s => s.key === key)) return []
    const { TOPICS } = await import(`../../learn/subjects/data/${key}.js`)
    return TOPICS.flatMap(t => placeQuiz(t.slug, t.quiz).map((x, i) => ({ id: `${t.slug}#${i}`, q: x.q, options: x.options, correct: x.answer, exp: x.exp, topic: t.slug, topicTitle: t.title })))
  }
  if (kind === 'gifted') {
    const [{ TYPES }, { SUBJECTS }] = await Promise.all([import('../../learn/gifted/giftedData.js'), import('../../learn/gifted/giftedSubjects.js')])
    const type = [...TYPES, ...SUBJECTS].find(t => t.key === key)
    if (!type || !['verbal', 'logic'].includes(key) && !type.subject) return []
    return type.items.map(it => ({ id: it.id, q: key === 'verbal' ? `${it.pair[0]} ל${it.pair[1]} — כמו ${it.ask} ל…?` : it.q, options: it.options.map(String), correct: it.answer, exp: it.exp, level: it.level }))
  }
  return []
}

// The bank questions a teacher's filters allow (topic for lessons, level for enrichment banks).
export const filterBank = (items, { topic = '', level = 0 } = {}) => items.filter(x => (!topic || x.topic === topic) && (!level || x.level === Number(level)))

// `count` questions picked by `seed` — the same seed always gives the same questions.
export function pickIds(items, count, seed = 1) {
  let x = (Number(seed) || 1) % 2147483648
  const list = items.map(i => i.id)
  for (let i = list.length - 1; i > 0; i--) { x = (x * 1103515245 + 12345) % 2147483648; const j = Math.floor((x / 2147483648) * (i + 1)); [list[i], list[j]] = [list[j], list[i]] }
  return list.slice(0, Math.max(0, count))
}

export const bankQuestions = (items, ids) => ids.map(id => items.find(x => x.id === id)).filter(Boolean)
