import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bubbleChoices, challengeTask, cleanTask, dictationCorrect, gradeTemplate, matchAnswers, MATCH_MAX, mathItems, newTask, parseNames, READING_OPTIONS, readingPassage, taskProblems, taskTitle, TEMPLATE_GRADES } from '../src/utils/homework/tasks.js'

test('maths homework: the same settings give every student the same exercises', () => {
  const task = { type: 'math', op: '-', range: 20, table: 'mix', kind: 'regular', count: 12, seed: 42 }
  const a = mathItems(task), b = mathItems({ ...task })
  assert.equal(a.length, 12)
  assert.deepEqual(a, b)
  for (const item of a) {
    const [x, , y, , z] = item.parts
    assert.equal(z, null)
    assert.equal(item.answer, x - y)
  }
  const missing = mathItems({ type: 'math', op: 'x', table: 7, kind: 'missing', count: 8, seed: 3 })
  for (const item of missing) {
    const [x, , y, , z] = item.parts.map((p, i) => p === null ? (i === 0 ? item.answer : i === 2 ? item.answer : item.answer) : p)
    assert.equal(x * y, z, item.text)
  }
  assert.notDeepEqual(mathItems({ ...task, seed: 43 }), a)
})

test('dictation ignores niqqud, spaces and punctuation but not spelling', () => {
  assert.ok(dictationCorrect('תַּפּוּחַ', 'תפוח'))
  assert.ok(dictationCorrect('עגבנייה', ' עגבנייה. '))
  assert.ok(!dictationCorrect('כתום', 'קתום'))
  assert.ok(!dictationCorrect('כתום', ''))
})

test('new tasks are valid, and broken ones are reported in Hebrew', () => {
  for (const type of ['math', 'reading', 'dictation']) assert.deepEqual(taskProblems(newTask(type), 0), [], type)
  assert.ok(taskProblems(newTask('questions'), 0).length)
  assert.match(taskProblems({ type: 'reading', slug: 'nope' }, 1)[0], /משימה 2/)
  assert.ok(READING_OPTIONS.length >= 20 && READING_OPTIONS.every(r => readingPassage(r.slug)?.q.length))
  assert.match(taskTitle({ type: 'math', op: 'x', table: 6, count: 10, kind: 'regular' }), /לוח 6/)
})

test('saving a question drops empty answers and keeps the right one marked', () => {
  const saved = cleanTask({ type: 'questions', title: ' חזרה ', items: [{ q: ' כמה רגליים לעכביש? ', options: ['6', '', '8', ' '], correct: 2 }] })
  assert.deepEqual(saved, { type: 'questions', title: 'חזרה', items: [{ q: 'כמה רגליים לעכביש?', options: ['6', '8'], correct: 1 }] })
})

test('class names: one per line or comma, no duplicates', () => {
  assert.deepEqual(parseNames('דנה\nיואב, נועה  כהן\nדנה\n\n'), ['דנה', 'יואב', 'נועה כהן'])
})

test('balloons: four different choices with the answer, the same for every child', () => {
  const task = { type: 'math', op: '+', range: 10, table: 'mix', kind: 'regular', count: 10, mode: 'bubbles', seed: 5 }
  mathItems(task).forEach((item, i) => {
    const choices = bubbleChoices(item, i, task.seed)
    assert.equal(choices.length, 4)
    assert.equal(new Set(choices).size, 4)
    assert.ok(choices.includes(item.answer))
    assert.ok(choices.every(n => n >= 0))
    assert.deepEqual(bubbleChoices(item, i, task.seed), choices)
  })
})

test('matching game: every answer appears once, and the game is capped', () => {
  const task = { type: 'math', op: 'x', table: 4, kind: 'regular', count: 20, mode: 'match', seed: 9 }
  const items = mathItems(task)
  assert.equal(items.length, MATCH_MAX)
  const answers = matchAnswers(items, task.seed)
  assert.deepEqual(answers.map(a => a.i).sort((a, b) => a - b), items.map((_, i) => i))
  assert.ok(answers.every(a => a.value === items[a.i].answer))
  assert.match(taskProblems(task, 0)[0], /משחק ההתאמה/)
  assert.deepEqual(taskProblems({ ...task, count: 6 }, 0), [])
})

test('the challenge level is harder and shared by the class', () => {
  const easy = { type: 'math', op: '+', range: 10, table: 'mix', kind: 'regular', count: 10, seed: 3, levels: true }
  assert.equal(challengeTask(easy).range, 20)
  assert.equal(challengeTask({ ...easy, range: 100 }).kind, 'missing')
  const table = challengeTask({ ...easy, op: 'x', table: 3 })
  assert.equal(table.table, 'mix')
  assert.equal(table.kind, 'missing')
  assert.deepEqual(mathItems(challengeTask(easy)), mathItems(challengeTask({ ...easy })))
  assert.equal(challengeTask(easy).levels, false)
})

test('grade templates are valid homework for every grade', () => {
  assert.deepEqual(TEMPLATE_GRADES, ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳'])
  for (const grade of TEMPLATE_GRADES) {
    const t = gradeTemplate(grade, 100)
    assert.match(t.title, new RegExp(grade))
    assert.ok(t.tasks.length >= 2 && t.tasks.length <= 12, grade)
    assert.deepEqual(t.tasks.flatMap(taskProblems), [], grade)
    assert.ok(t.tasks.some(task => task.mode === 'bubbles' || task.mode === 'match' || task.levels), grade)
  }
  assert.equal(gradeTemplate('ז׳'), null)
})

test('bank and game tasks: titles, problems, and the same questions for the whole class', async () => {
  const { HW_GAMES, hwGame } = await import('../src/utils/homework/tasks.js')
  const { BANKS, loadBank, pickIds, filterBank, bankQuestions } = await import('../src/utils/homework/banks.js')
  const { ARCADE } = await import('../src/arcade/registry.js')
  for (const g of HW_GAMES) assert.ok(ARCADE.some(a => a.slug === g.slug), g.slug)
  const game = newTask('game')
  assert.ok(hwGame(game.game))
  assert.deepEqual(taskProblems(game, 0), [])
  for (const id of BANKS.filter(b => b.id.startsWith('gifted:')).map(b => b.id)) {
    const items = await loadBank(id)
    assert.equal(items.length, 30, id)
    for (const q of items) assert.ok(q.q && q.options[q.correct] !== undefined && q.exp, `${id} ${q.id}`)
    const ids = pickIds(items, 10, 7)
    assert.equal(ids.length, 10)
    assert.deepEqual(ids, pickIds(items, 10, 7), 'same seed, same questions')
    assert.equal(bankQuestions(items, ids).length, 10)
    assert.ok(filterBank(items, { level: 1 }).every(q => q.level === 1))
  }
  const bank = { ...newTask('bank'), bank: 'gifted:subj-science', ids: ['ss01', 'ss02', 'ss03'] }
  assert.deepEqual(taskProblems(bank, 0), [])
  assert.match(taskTitle(bank), /מדע וטבע · 3 שאלות/)
  assert.equal(taskProblems({ ...bank, ids: ['ss01'] }, 0).length, 1)
})
