// Difficulty selectors must change the content itself: quiz pools by level, holiday quiz rounds,
// first-grade addition ranges. Question banks use Vite-style extensionless imports, so a tiny resolve
// hook adds ".js".
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { register } from 'node:module'

const hooks = `
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
export async function resolve(spec, ctx, next) {
  if ((spec.startsWith('.') || spec.startsWith('/')) && !/\\.(m?js|jsx|json)$/.test(spec)) {
    for (const ext of ['.js', '/index.js']) {
      if (existsSync(fileURLToPath(new URL(spec + ext, ctx.parentURL)))) return next(spec + ext, ctx)
    }
  }
  return next(spec, ctx)
}`
register('data:text/javascript,' + encodeURIComponent(hooks), import.meta.url)

const { pickByLevel, buildLeveledPool, triviaFallbackOrder, additionExercise, ADDITION_LEVELS } = await import('../src/utils/difficultyLevels.js')
const { QUESTION_BANK_EXPANDED, AUDIENCES, DIFFICULTIES } = await import('../src/data/questionBankExpanded.js')

const audienceIds = AUDIENCES.map((a) => a.id)
const difficultyIds = DIFFICULTIES.map((d) => d.id)
const trivia = QUESTION_BANK_EXPANDED.filter((q) => q.triviaOptions?.length >= 2)
const pool = (audience, difficulty, topic = 'all') => buildLeveledPool(trivia, { audience, difficulty, topic, min: 8, audienceIds, difficultyIds })

test('trivia: easy pools are only easy questions, and the levels give different questions', () => {
  for (const a of audienceIds) {
    const easy = pool(a, 'easy')
    assert.ok(easy.length >= 8, `${a} easy has ${easy.length}`)
    const hard = pool(a, 'hard')
    assert.ok(hard.length >= 8, `${a} hard has ${hard.length}`)
    // Exact questions always come first and are all included.
    const exactHard = trivia.filter((q) => q.audience === a && q.difficulty === 'hard')
    assert.deepEqual(hard.slice(0, exactHard.length).map((q) => q.id).sort(), exactHard.map((q) => q.id).sort())
    // A hard round never borrows an easy question of the same audience while closer ones exist.
    assert.ok(!hard.some((q) => q.audience === a && q.difficulty === 'easy'), `${a} hard contains ${a} easy`)
    assert.ok(!easy.some((q) => q.difficulty === 'hard'), `${a} easy contains hard`)
    const easyIds = new Set(easy.map((q) => q.id))
    assert.ok(hard.filter((q) => easyIds.has(q.id)).length === 0, `${a}: easy and hard pools overlap`)
  }
  assert.ok(pool('kids', 'easy').every((q) => q.audience === 'kids' && q.difficulty === 'easy'))
})

test('trivia: fallback order is nearest-first (kids hard ← teens medium, adults hard ← teens hard)', () => {
  const key = (g) => `${g.audience}/${g.difficulty}`
  const kidsHard = triviaFallbackOrder(audienceIds, difficultyIds, 'kids', 'hard').map(key)
  assert.equal(kidsHard[0], 'kids/hard')
  assert.ok(kidsHard.indexOf('teens/medium') < kidsHard.indexOf('kids/easy'))
  assert.ok(kidsHard.indexOf('kids/medium') < kidsHard.indexOf('kids/easy'))
  const adultsHard = triviaFallbackOrder(audienceIds, difficultyIds, 'adults', 'hard').map(key)
  assert.equal(adultsHard[1], 'teens/hard')
  assert.ok(adultsHard.indexOf('adults/easy') > adultsHard.indexOf('adults/medium'))
})

test('trivia: a narrow topic still yields a non-empty pool for every level', () => {
  const topics = [...new Set(trivia.map((q) => q.topic))]
  for (const t of topics) for (const a of audienceIds) for (const d of difficultyIds) {
    const p = pool(a, d, t)
    assert.ok(p.length >= 8, `${t}/${a}/${d}: ${p.length}`)
    assert.equal(new Set(p.map((q) => q.id)).size, p.length, 'no duplicates')
  }
})

test('holiday quiz: rounds are built from the chosen level', async () => {
  const holidays = ['hanukkah', 'pesach', 'purim', 'sukkot', 'yomkippur', 'tubishvat', 'shavuot', 'roshhashana', 'lagbaomer', 'yomhaatzmaut']
  for (const h of holidays) {
    const mod = await import(`../src/data/${h}.js`)
    const questions = Object.values(mod).flatMap((v) => (Array.isArray(v) && v[0]?.q && v[0]?.level ? v : (v?.quiz?.questions || [])))
    assert.ok(questions.length, `${h} has quiz questions`)
    const count = (l) => questions.filter((q) => q.level === l).length
    for (const level of [1, 2, 3]) {
      const round = pickByLevel(questions, level, 10, { min: 6 })
      assert.ok(round.length >= 6, `${h} level ${level}: ${round.length}`)
      const own = round.filter((q) => q.level === level).length
      assert.equal(own, Math.min(10, count(level)), `${h} level ${level} uses all its own questions first`)
      if (level === 1) assert.ok(round.every((q) => q.level <= 2), `${h}: level 1 never gets level-3 questions`)
      if (level === 3) assert.ok(round.every((q) => q.level >= 2), `${h}: level 3 never gets level-1 questions`)
    }
  }
})

test('pickByLevel: easy rounds are only padded with harder items when below min', () => {
  const items = [...Array(7)].map((_, i) => ({ id: `a${i}`, level: 1 })).concat([...Array(9)].map((_, i) => ({ id: `b${i}`, level: 2 })), [...Array(3)].map((_, i) => ({ id: `c${i}`, level: 3 })))
  assert.ok(pickByLevel(items, 1, 10, { min: 6 }).every((q) => q.level === 1))
  assert.equal(pickByLevel(items, 1, 10, { min: 6 }).length, 7)
  const hard = pickByLevel(items, 3, 10, { min: 6 })
  assert.equal(hard.length, 10)
  assert.equal(hard.filter((q) => q.level === 3).length, 3)
  assert.ok(hard.every((q) => q.level >= 2))
  assert.equal(pickByLevel(items.filter((q) => q.level === 1).slice(0, 3), 1, 10, { min: 6 }).length, 3)
  assert.equal(pickByLevel(items.filter((q) => q.level !== 1).concat(items.slice(0, 2)), 1, 10, { min: 6 }).length, 6)
})

test('first-grade addition: every level stays in its own sum range and the first exercise differs', () => {
  for (const [id, L] of Object.entries(ADDITION_LEVELS)) {
    const sums = new Set()
    for (let r = 0; r < 200; r++) {
      const e = additionExercise(id, r)
      assert.equal(e.a + e.b, e.correct)
      assert.ok(e.correct >= L.min && e.correct <= L.max, `${id} r${r}: ${e.correct}`)
      assert.ok(e.a >= L.minAddend && e.b >= L.minAddend, `${id} r${r}: ${e.a}+${e.b}`)
      sums.add(e.correct)
    }
    assert.equal(sums.size, L.max - L.min + 1, `${id} covers its whole range`)
  }
  const first = Object.keys(ADDITION_LEVELS).map((id) => additionExercise(id, 0).correct)
  assert.equal(new Set(first).size, 3)
})
