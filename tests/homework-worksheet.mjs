import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { blankCorrect, cleanTask, newTask, parseBlanks, sheetBlanks, sheetItemLabel, sheetMatchOrder, sheetWordBank, taskProblems, taskTitle, TASK_TYPES } from '../src/utils/homework/tasks.js'

test('worksheet: blanks are read from square brackets, with "/" for more right answers', () => {
  assert.deepEqual(parseBlanks('השמש [זורחת/עולה] במזרח'), [{ text: 'השמש ' }, { answers: ['זורחת', 'עולה'] }, { text: ' במזרח' }])
  assert.equal(sheetBlanks('[א] ו[ב] ו[ג]').length, 3)
  assert.equal(sheetBlanks('בלי סוגריים').length, 0)
})

test('worksheet: answers ignore niqqud, spaces, punctuation and case, not spelling', () => {
  const blank = { answers: ['זורחת', 'עולה'] }
  assert.ok(blankCorrect(blank, ' זוֹרַחַת. '))
  assert.ok(blankCorrect(blank, 'עולה'))
  assert.ok(!blankCorrect(blank, 'זורכת'))
  assert.ok(!blankCorrect(blank, ''))
  assert.ok(blankCorrect({ answers: ['Dog'] }, 'dog'))
  assert.ok(blankCorrect({ answers: ['12'] }, '12'))
})

test('worksheet: a new sheet asks for content, a written one passes, and problems are in Hebrew', () => {
  assert.ok(TASK_TYPES.worksheet)
  assert.ok(taskProblems(newTask('worksheet'), 0).length)
  const good = { type: 'worksheet', title: '', wordBank: true, seed: 3, items: [
    { kind: 'fill', text: 'השמש [זורחת] במזרח' },
    { kind: 'tf', text: 'הלווייתן הוא דג', answer: false },
    { kind: 'match', pairs: [['כלב', 'נובח'], ['חתול', 'מיילל'], ['', '']] },
  ] }
  assert.deepEqual(taskProblems(good, 0), [])
  assert.match(taskTitle(good), /3 סעיפים/)
  assert.match(taskProblems({ ...good, items: [{ kind: 'fill', text: 'אין כאן מילה חסרה' }] }, 1)[0], /משימה 2, סעיף 1/)
  assert.ok(taskProblems({ ...good, items: [{ kind: 'fill', text: 'ריק []' }] }, 0).length)
  assert.ok(taskProblems({ ...good, items: [{ kind: 'match', pairs: [['כלב', 'נובח'], ['חתול', '']] }] }, 0).length)
  assert.ok(taskProblems({ ...good, items: [{ kind: 'tf', text: ' ', answer: true }] }, 0).length)
})

test('worksheet: saving trims text and drops half-written pairs', () => {
  const saved = cleanTask({ type: 'worksheet', title: ' מים ', wordBank: 0, seed: 1, items: [
    { kind: 'fill', text: '  מים   [מתאדים] ' }, { kind: 'match', pairs: [[' א ', ' ב '], ['ג', ''], ['ד', 'ה']] }, { kind: 'tf', text: ' x ', answer: 1 },
  ] })
  assert.deepEqual(saved.items, [{ kind: 'fill', text: 'מים [מתאדים]' }, { kind: 'match', pairs: [['א', 'ב'], ['ד', 'ה']] }, { kind: 'tf', text: 'x', answer: true }])
  assert.equal(saved.title, 'מים')
  assert.equal(saved.wordBank, false)
})

test('worksheet: matching order is shared, complete and never left in place', () => {
  for (let n = 2; n <= 8; n++) for (let seed = 1; seed < 30; seed++) {
    const order = sheetMatchOrder(n, seed, 2)
    assert.deepEqual([...order].sort((a, b) => a - b), [...Array(n).keys()])
    assert.ok(!order.every((v, i) => v === i))
    assert.deepEqual(sheetMatchOrder(n, seed, 2), order)
  }
})

test('worksheet: word bank holds every blank once; teacher labels hide the answers', () => {
  const task = { items: [{ kind: 'fill', text: '[א] ו[ב]' }, { kind: 'tf', text: 'x', answer: true }, { kind: 'fill', text: 'עוד [ג/ד]' }] }
  assert.deepEqual([...sheetWordBank(task, 4)].sort(), ['א', 'ב', 'ג'])
  assert.equal(sheetItemLabel({ kind: 'fill', text: 'השמש [זורחת] במזרח' }), 'השמש ___ במזרח')
  assert.match(sheetItemLabel({ kind: 'match', pairs: [['כלב', 'נובח']] }), /כלב/)
})

test('worksheet: the database accepts the new task type', () => {
  const dir = new URL('../supabase/migrations/', import.meta.url)
  const last = readdirSync(dir).filter(f => readFileSync(new URL(f, dir), 'utf8').includes('function public.hw_clean_tasks')).sort().pop()
  assert.match(readFileSync(new URL(last, dir), 'utf8'), /'worksheet'/)
})
