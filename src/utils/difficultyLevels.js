// Shared difficulty logic: a chosen level must change which questions/exercises appear, not only how many.
import { shuffle } from './shuffle.js'

// Numbered levels (1..3): every item of the chosen level first. When there are fewer than `count`, borrow
// from the nearest level — easier levels may top the round up to `count`, harder ones only up to `min`
// (so a young child's round is never padded with hard questions unless it would otherwise be too short).
export function pickByLevel(items, level, count, { min = count, levelOf = (x) => x.level } = {}) {
  const levels = [...new Set(items.map(levelOf))]
  const order = levels.sort((a, b) => Math.abs(a - level) - Math.abs(b - level) || a - b)
  const out = []
  for (const l of order) {
    const cap = l <= level ? count : Math.min(count, min)
    if (out.length >= cap) continue
    out.push(...shuffle(items.filter((x) => levelOf(x) === l)).slice(0, cap - out.length))
  }
  return shuffle(out)
}

// Trivia bank (audience × difficulty). Each pair gets a challenge score (audience index + difficulty
// index), so "hard for kids" sits next to "medium for teens" and "hard for adults" next to "hard for
// teens". When the exact filter is short, groups are added nearest-first — same difficulty before same
// audience on a tie — and an easy question is never used to pad a hard round while closer ones exist.
export function triviaFallbackOrder(audienceIds, difficultyIds, audience, difficulty) {
  const score = (a, d) => audienceIds.indexOf(a) + difficultyIds.indexOf(d)
  const target = score(audience, difficulty)
  const groups = []
  for (const a of audienceIds) for (const d of difficultyIds) groups.push({ audience: a, difficulty: d, dist: Math.abs(score(a, d) - target) })
  return groups.sort((x, y) => x.dist - y.dist
    || (x.difficulty === difficulty ? 0 : 1) - (y.difficulty === difficulty ? 0 : 1)
    || (x.audience === audience ? 0 : 1) - (y.audience === audience ? 0 : 1)
    || Math.abs(audienceIds.indexOf(x.audience) - audienceIds.indexOf(audience)) - Math.abs(audienceIds.indexOf(y.audience) - audienceIds.indexOf(audience)))
}

// Builds the pool for one audience/difficulty/topic. Widening order: nearby groups in the chosen topic,
// nearby groups in any topic, then (rare) anything in the topic and anything at all.
export function buildLeveledPool(items, { audience, difficulty, topic = 'all', min = 8, audienceIds, difficultyIds, maxDist = 1 }) {
  const order = triviaFallbackOrder(audienceIds, difficultyIds, audience, difficulty)
  const inTopic = (q) => topic === 'all' || q.topic === topic
  const pool = []
  const ids = new Set()
  const add = (list) => { for (const q of list) if (!ids.has(q.id)) { ids.add(q.id); pool.push(q) } }
  const fill = (topicOk, dist) => {
    for (const g of order) {
      if (pool.length >= min && g !== order[0]) break
      if (g.dist > dist) break
      add(items.filter((q) => topicOk(q) && q.audience === g.audience && q.difficulty === g.difficulty))
    }
  }
  fill(inTopic, maxDist)
  if (pool.length < min && topic !== 'all') fill(() => true, maxDist)
  if (pool.length < min) fill(inTopic, Infinity)
  if (pool.length < min) fill(() => true, Infinity)
  return pool
}

// First-grade addition (/classroom/first-grade): each level has its own range of sums, so switching
// level changes the exercise itself. Deterministic per round (the page is prerendered).
export const ADDITION_LEVELS = {
  easy: { min: 2, max: 10, minAddend: 1 },
  medium: { min: 11, max: 15, minAddend: 2 },
  hard: { min: 16, max: 20, minAddend: 3 },
}

export function additionExercise(levelId, round) {
  const L = ADDITION_LEVELS[levelId] || ADDITION_LEVELS.easy
  // Small integer hash so consecutive rounds don't march through the sums in order.
  let h = (Math.imul(round + 1, 2654435761) ^ (Object.keys(ADDITION_LEVELS).indexOf(levelId) * 97)) >>> 0
  h = (h ^ (h >>> 15)) >>> 0
  const sum = L.min + (h % (L.max - L.min + 1))
  const span = sum - 2 * L.minAddend + 1
  const a = L.minAddend + ((h >>> 8) % span)
  return { a, b: sum - a, correct: sum }
}
