// Per-page generated content for /math: curriculum placement, prerequisite / follow-up topics,
// solved sample exercises and page-specific FAQ. Pure ESM (no JSX) so tests can check that sibling
// pages really differ. Everything is computed from the topic data and the generators — deterministic
// seeds only, so the prerendered HTML matches hydration.
import { KINDERGARTEN, GRADES, gradeInfo, topicsFor, topicPath, makeExercise, STRANDS } from './registry.js'
import { gradeName, inGrade } from './seo.js'
import { GRADE_PROGRAM, TOPIC_UNITS, topicUnit } from './curriculum.js'

const ALL_GRADES = [KINDERGARTEN, ...GRADES].map(g => g.n)

// FNV-1a — a stable seed per string.
export const strSeed = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) || 1 }

export function listHe(xs) { return xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ו${xs[xs.length - 1]}` }

// Words of a topic (slug parts + Hebrew title words) for a rough "how related" score.
const STOP = new Set(['של', 'עם', 'עד', 'על', 'בין', 'את', 'או', 'and', 'of', 'the'])
const words = t => new Set([
  ...t.slug.split('-').filter(w => w.length > 2 && !/^\d+$/.test(w)),
  ...t.title.replace(/[—–:,()׳"״.]/g, ' ').split(/\s+/).map(w => w.replace(/^[והבלמש](?=[א-ת]{3,})/, '')).filter(w => w.length > 2 && !STOP.has(w)),
].filter(w => !STOP.has(w)))
const overlap = (a, b) => { let k = 0; for (const w of a) if (b.has(w)) k++; return k }

// Same-strand topics in the nearest earlier / later grade that has any (up to two grades away),
// most related first (shared words), then in curriculum order.
function strandNeighbours(topic, dir) {
  const i = ALL_GRADES.indexOf(topic.grade)
  const mine = words(topic)
  for (let step = 1; step <= 2; step++) {
    const n = ALL_GRADES[i + dir * step]
    if (n == null) return null
    // Same strand, or a shared word in another strand (e.g. "אחוזים" moves from fractions to arithmetic).
    const scored = topicsFor(n).map((t, k) => ({ t, k, s: overlap(mine, words(t)) + (t.strand === topic.strand ? 0.5 : 0) }))
    const list = scored.filter(x => x.s > 0)
    if (list.length) {
      const ranked = list.sort((a, b) => b.s - a.s || a.k - b.k)
      return { grade: gradeInfo(n), topics: ranked.slice(0, 4).map(x => x.t) }
    }
  }
  return null
}

export function topicContext(topic) {
  const g = gradeInfo(topic.grade)
  const unit = topicUnit(topic)
  const prev = strandNeighbours(topic, -1)
  const next = strandNeighbours(topic, 1)
  const siblings = topicsFor(topic.grade)
  const sameStrand = siblings.filter(t => t.strand === topic.strand && t.slug !== topic.slug)
  const position = siblings.findIndex(t => t.slug === topic.slug) + 1
  const strand = STRANDS[topic.strand]?.label || ''

  // Curriculum sentence(s) — only what curriculum.js states.
  const unitText = unit ? [
    unit.chapter ? `${topic.title} נלמד ${inGrade(g)} בפרק "${unit.chapter}" של ${unit.program}.` : '',
    unit.note || '',
  ].filter(Boolean).join(' ') : ''

  const faq = []
  if (unitText) faq.push({ q: `איפה ${topic.title} נמצא בתוכנית הלימודים של משרד החינוך?`, a: unitText })
  if (prev) faq.push({ q: `מה צריך לדעת לפני שלומדים ${topic.title}?`, a: `כדאי להגיע אחרי שמכירים את הנושאים של ${gradeName(prev.grade)} בתחום ${STRANDS[topic.strand]?.label || 'הזה'}: ${listHe(prev.topics.map(t => t.title))}. אם אחד מהם עוד לא יושב טוב, שווה לחזור אליו ולתרגל קודם.` })
  if (next) faq.push({ q: `מה לומדים אחרי ${topic.title}?`, a: `${inGrade(next.grade)} ממשיכים באותו תחום אל ${listHe(next.topics.map(t => t.title))}. מי ששולט ברמה 3 כאן מוכן להתחיל את הנושאים האלה.` })

  const summary = `${topic.title} הוא נושא ${position} מתוך ${siblings.length} במתמטיקה ${inGrade(g)}, בתחום ${strand}${sameStrand.length ? `, יחד עם ${listHe(sameStrand.slice(0, 4).map(t => t.title))}` : ''}.`
  return { unit, unitText, prev, next, sameStrand, faq, summary }
}

// One solved exercise for every level of the topic, from fixed seeds.
export function sampleExercises(topic) {
  return topic.levels.map((label, i) => ({ level: i + 1, label, ex: makeExercise(topic, i + 1, strSeed(`${topic.grade}/${topic.slug}/sample/${i + 1}`)) }))
}

// Official chapters of a grade, each with the site's topics placed in it (by TOPIC_UNITS).
export function gradeChapters(n) {
  const prog = GRADE_PROGRAM[n]
  if (!prog) return null
  const topics = topicsFor(n)
  const chapters = Object.entries(prog.chapters).map(([key, label]) => ({
    key, label, topics: topics.filter(t => TOPIC_UNITS[`${n}/${t.slug}`]?.ch === key),
  }))
  const notes = topics.map(t => ({ t, note: TOPIC_UNITS[`${n}/${t.slug}`]?.note })).filter(x => x.note && !TOPIC_UNITS[`${n}/${x.t.slug}`]?.ch)
  return { ...prog, chapters, notes }
}

// A fixed sample of test questions (one per topic, spread over the levels) for the test page.
export function testSampleItems(n, count = 6) {
  const topics = topicsFor(n)
  if (!topics.length) return []
  const step = topics.length / Math.min(count, topics.length)
  const out = []
  for (let i = 0; i < Math.min(count, topics.length); i++) {
    const t = topics[Math.floor(i * step)]
    const lv = 1 + (i % 3)
    out.push({ topic: t, level: lv, ex: makeExercise(t, lv, strSeed(`test/${n}/${t.slug}/${i}`)) })
  }
  return out
}

export const pathOf = topicPath
