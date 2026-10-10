// Switching level must change the FIRST item on screen, and that item must be of the chosen level —
// not one borrowed from an easier level (pools that are topped up, or ladders where every level
// contains the one below). Question banks use Vite-style extensionless imports, so a tiny resolve hook
// adds ".js".
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

const { pickByLevel, seededRandom, newAtLevel, buildLeveledPool } = await import('../src/utils/difficultyLevels.js')
const { QUESTION_BANK_EXPANDED, AUDIENCES, DIFFICULTIES, pickNextQuestion } = await import('../src/data/questionBankExpanded.js')
const { CLOCK_LEVELS, FRAC_LEVELS, clockItems, fractionItems } = await import('../src/data/mathVisualLevels.js')
const { ageItems, orderCards } = await import('../src/data/worksheetTasks.js')
const { exercises } = await import('../src/utils/mathSheets.js')
const { topicsFor, makeExercise, makeLevelExercise, findTopic } = await import('../src/math/registry.js')

const HOLIDAY_QUIZZES = await Promise.all([
  ['hanukkah', 'HANUKKAH_QUIZ'], ['purim', 'PURIM_QUIZ'], ['pesach', 'PESACH_QUIZ'], ['tubishvat', 'TUBISHVAT_QUIZ'],
  ['yomkippur', 'YOMKIPPUR_QUIZ'], ['roshhashana', 'ROSHHASHANA_QUIZ'], ['sukkot', 'SUKKOT_QUIZ'], ['shavuot', 'SHAVUOT_QUIZ'],
  ['lagbaomer', 'LAGBAOMER_QUIZ'], ['yomhaatzmaut', 'ATZMAUT_QUIZ'],
].map(async ([file, name]) => [file, (await import(`../src/data/${file}.js`))[name]]))

test('holiday quizzes: the first question of a round is always of the chosen level', () => {
  for (const [name, questions] of HOLIDAY_QUIZZES) {
    assert.ok(Array.isArray(questions) && questions.length, name)
    for (const level of [1, 2, 3]) {
      for (let run = 0; run < 60; run++) {
        const round = pickByLevel(questions, level, 10, { min: 6 })
        assert.equal(round[0].level, level, `${name} level ${level}`)
      }
    }
  }
})

test('holiday quizzes: the seeded first round (prerender) is stable and differs between levels', () => {
  for (const [name, questions] of HOLIDAY_QUIZZES) {
    const first = [1, 2, 3].map((level) => pickByLevel(questions, level, 10, { min: 6, rand: seededRandom(level * 7919 + questions.length) })[0].q)
    const again = [1, 2, 3].map((level) => pickByLevel(questions, level, 10, { min: 6, rand: seededRandom(level * 7919 + questions.length) })[0].q)
    assert.deepEqual(first, again, name)
    assert.equal(new Set(first).size, 3, name)
  }
})

test('trivia: the first question is of exactly the chosen audience and level whenever the bank has one', () => {
  const trivia = QUESTION_BANK_EXPANDED.filter((q) => q.triviaOptions?.length >= 2)
  const audienceIds = AUDIENCES.map((a) => a.id), difficultyIds = DIFFICULTIES.map((d) => d.id)
  for (const audience of audienceIds) for (const difficulty of difficultyIds) {
    const pool = buildLeveledPool(trivia, { audience, difficulty, topic: 'all', min: 8, audienceIds, difficultyIds })
    const exact = (q) => q.audience === audience && q.difficulty === difficulty
    if (!pool.some(exact)) continue
    for (let run = 0; run < 40; run++) {
      // History from the previous level must not push the new level's first question to a borrowed one.
      const history = pool.filter((q) => !exact(q)).slice(0, 3).map((q) => q.id)
      assert.ok(exact(pickNextQuestion(pool, history, exact)), `${audience}/${difficulty}`)
    }
  }
})

test('pickNextQuestion: preferred questions come first, then the rest, and never the one just shown', () => {
  const qs = [{ id: 'a', p: true }, { id: 'b', p: true }, { id: 'c' }, { id: 'd' }]
  const pref = (q) => q.p
  for (let run = 0; run < 30; run++) {
    assert.equal(pickNextQuestion(qs, ['a'], pref).id, 'b')
    assert.ok(['c', 'd'].includes(pickNextQuestion(qs, ['a', 'b'], pref).id))
    assert.notEqual(pickNextQuestion(qs, ['b', 'a', 'c', 'd'], pref).id, 'b')
  }
})

test('read notes: a level click shows a note that is new at that level and not the one on screen', () => {
  const C4 = 60, scale = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21].map((s) => C4 + s)
  const pools = { 1: scale.slice(0, 5), 2: scale.slice(0, 8), 3: scale }
  for (let run = 0; run < 100; run++) {
    const two = newAtLevel(pools, 2, 64), three = newAtLevel(pools, 3, two), one = newAtLevel(pools, 1, three)
    assert.ok(!pools[1].includes(two) && pools[2].includes(two))
    assert.ok(!pools[2].includes(three) && pools[3].includes(three))
    assert.ok(pools[1].includes(one))
    assert.notEqual(newAtLevel(pools, 1, 64), 64)
  }
})

test('clock worksheets: each level opens on a time that only that level has', () => {
  const keys = Object.keys(CLOCK_LEVELS)
  for (let seed = 1; seed < 60; seed++) {
    const firsts = keys.map((k) => clockItems(k, seed)[0])
    keys.forEach((k, i) => {
      const lower = i ? CLOCK_LEVELS[keys[i - 1]][1] : []
      if (i) assert.ok(!lower.includes(firsts[i][1]), `${k} opens on ${firsts[i][1]} minutes`)
      for (const [h, m] of clockItems(k, seed)) assert.ok(h >= 1 && h <= 12 && CLOCK_LEVELS[k][1].includes(m))
    })
    assert.equal(new Set(firsts.map(([h, m]) => `${h}:${m}`)).size, keys.length, `seed ${seed}`)
  }
})

test('fraction worksheets: each level opens on a denominator that only that level has', () => {
  const keys = Object.keys(FRAC_LEVELS)
  for (const mode of ['name', 'color', 'compare']) for (let seed = 1; seed < 40; seed++) {
    keys.forEach((k, i) => {
      const first = fractionItems(k, mode, seed)[0], d = mode === 'compare' ? first[0].d : first.d
      if (i) assert.ok(!FRAC_LEVELS[keys[i - 1]][1].includes(d), `${k}/${mode} opens on 1/${d}`)
    })
  }
})

test('activity worksheets: the first row changes with the age and older ages start on a harder word', () => {
  const words = ['אריה', 'פיל', 'ג׳ירפה', 'כלב', 'חתול', 'צפרדע', 'פרפר', 'צב']
  const ages = ['3–4', '5–6', '7–8']
  for (let version = 0; version < 30; version++) {
    const lists = ages.map((age) => ageItems(words, age, version, (w) => w.length))
    assert.deepEqual(lists.map((l) => l.length), [4, 6, 8])
    assert.equal(new Set(lists.map((l) => l[0])).size, 3, `version ${version}`)
    const byLength = [...words].sort((a, b) => a.length - b.length)
    assert.ok(lists[0].every((w) => byLength.slice(0, 4).includes(w)), 'youngest gets the shortest words')
    assert.ok(byLength.slice(6).includes(lists[2][0]), 'oldest opens on one of the longest words')
    const cards = ages.map((age) => orderCards(age, version).cards[0])
    assert.equal(new Set(cards).size, 3, `cut-and-order version ${version}`)
  }
})

test('math worksheets: the first exercise belongs to the chosen range only', () => {
  for (let seed = 1; seed < 200; seed++) {
    for (const op of ['+', '-', 'mix']) {
      const [e20] = exercises({ range: 20, op, type: 'regular', count: 20, seed })
      assert.ok(Math.max(e20.a, e20.b, e20.c) > 10, `up to 20: ${e20.a}${e20.o}${e20.b}`)
      const [e100] = exercises({ range: 100, op, type: 'regular', count: 20, seed })
      assert.ok(Math.max(e100.a, e100.b, e100.c) > 20, `up to 100: ${e100.a}${e100.o}${e100.b}`)
    }
  }
})

test('math topics: the first exercise of level 2/3 is (almost) never one an easier level also gives', () => {
  const key = (ex) => `${ex.q}|${ex.expr || ''}|${ex.svg || ''}|${String(ex.answer)}`
  for (let g = 1; g <= 12; g++) for (const t of topicsFor(g)) {
    const lower = { 1: new Set(), 2: new Set() }
    for (let i = 1; i <= 1500; i++) { lower[1].add(key(makeExercise(t, 1, i * 104729 + 3))); lower[2].add(key(makeExercise(t, 2, i * 104729 + 3))) }
    let hits = 0
    for (let s = 1; s <= 25; s++) {
      if (lower[1].has(key(makeLevelExercise(t, 2, s * 31337)))) hits++
      const e3 = makeLevelExercise(t, 3, s * 31337)
      if (lower[1].has(key(e3)) || lower[2].has(key(e3))) hits++
    }
    assert.ok(hits <= 1, `grade-${g}/${t.slug}: ${hits}/50 first exercises also exist at an easier level`)
  }
})

test('math: fraction multiplication levels 1 and 2 no longer overlap (level 2 = cross-cancelling)', () => {
  const t = findTopic(6, 'fraction-multiplication')
  const l1 = new Set(), l2 = new Set()
  for (let i = 1; i <= 800; i++) { l1.add(makeExercise(t, 1, i).expr); l2.add(makeExercise(t, 2, i).expr) }
  for (const e of l2) assert.ok(!l1.has(e), e)
})
