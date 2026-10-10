// Shared difficulty logic: a chosen level must change which questions/exercises appear, not only how many.
import { shuffle } from './shuffle.js'

// Numbered levels (1..3): every item of the chosen level first. When there are fewer than `count`, borrow
// from the nearest level — easier levels may top the round up to `count`, harder ones only up to `min`
// (so a young child's round is never padded with hard questions unless it would otherwise be too short).
// The round is shuffled, but its FIRST item is always one of the chosen level (when the level has any),
// so switching level visibly opens on a question of that level, never on a borrowed one.
// `rand` (optional, e.g. seededRandom(n)) makes the round deterministic — for a prerendered first paint.
export function pickByLevel(items, level, count, { min = count, levelOf = (x) => x.level, rand } = {}) {
  const mix = rand ? (list) => seededShuffle(list, rand) : shuffle
  const levels = [...new Set(items.map(levelOf))]
  const order = levels.sort((a, b) => Math.abs(a - level) - Math.abs(b - level) || a - b)
  const out = []
  for (const l of order) {
    const cap = l <= level ? count : Math.min(count, min)
    if (out.length >= cap) continue
    out.push(...mix(items.filter((x) => levelOf(x) === l)).slice(0, cap - out.length))
  }
  const round = mix(out)
  const first = round.findIndex((x) => levelOf(x) === level)
  if (first > 0) [round[0], round[first]] = [round[first], round[0]]
  return round
}

// Ladders where each level contains the one below (read-notes: C–G, then the octave, then the whole
// staff). Returns a random item that is NEW at `level` — not one the easier level also has — and is not
// the item on screen, so a level click always shows something different and of that level.
// `pools` is keyed by level number (1, 2, 3…).
export function newAtLevel(pools, level, current, rand = Math.random) {
  const lower = new Set(pools[level - 1] || [])
  let fresh = (pools[level] || []).filter((x) => !lower.has(x) && x !== current)
  if (!fresh.length) fresh = (pools[level] || []).filter((x) => x !== current)
  return fresh[Math.floor(rand() * fresh.length)]
}

// Small deterministic PRNG (mulberry32) and a Fisher–Yates shuffle that uses it.
export function seededRandom(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export function seededShuffle(items, rand) {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
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
