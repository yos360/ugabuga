// Math tic-tac-toe for the classroom: exercises fit the grade, answers are checked, wins/draws are found.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { rng } from '../src/arcade/logic/rng.js'
import { TOPICS, GRADES, makeExercise, checkAnswer, outcome, nextTeam } from '../src/math/mathTicTacToe.js'

const MAX = { 1: 20, 2: 100, 3: 1000, 4: 10000 }

test('every exercise is correct, non-negative and within the grade range', () => {
  const rand = rng(7)
  for (const { id } of TOPICS) for (const { n } of GRADES) for (let k = 0; k < 400; k++) {
    const ex = makeExercise(id, n, rand)
    const calc = ex.op === '+' ? ex.a + ex.b : ex.op === '−' ? ex.a - ex.b : ex.a * ex.b
    assert.equal(ex.answer, calc, `${id}/${n}: ${ex.text}`)
    assert.ok(Number.isInteger(ex.answer) && ex.answer >= 0, `${ex.text} = ${ex.answer}`)
    assert.ok(ex.a > 0 && ex.b > 0, ex.text)
    assert.equal(ex.text, `${ex.a} ${ex.op} ${ex.b}`)
    if (ex.op !== '×') assert.ok(Math.max(ex.a, ex.answer) <= MAX[n], `${id}/${n}: ${ex.text}`)
    if (id === 'add') assert.equal(ex.op, '+')
    if (id === 'sub') assert.equal(ex.op, '−')
    if (id === 'mul') assert.equal(ex.op, '×')
  }
})

test('multiplication stays at the table for the grade', () => {
  const rand = rng(3)
  for (let k = 0; k < 500; k++) {
    assert.ok(makeExercise('mul', 1, rand).answer <= 50)
    assert.ok(makeExercise('mul', 2, rand).answer <= 100)
    const g3 = makeExercise('mul', 3, rand)
    assert.ok(g3.a <= 10 && g3.b <= 10, g3.text)
  }
})

test('mixed gives all three operations', () => {
  const rand = rng(11), ops = new Set()
  for (let k = 0; k < 200; k++) ops.add(makeExercise('mix', 2, rand).op)
  assert.deepEqual([...ops].sort(), ['+', '×', '−'].sort())
})

test('typed answers are checked leniently but exactly', () => {
  const ex = { answer: 1200 }
  assert.ok(checkAnswer(ex, '1200'))
  assert.ok(checkAnswer(ex, ' 1,200 '))
  assert.ok(checkAnswer(ex, '١٢٠٠'))
  assert.ok(!checkAnswer(ex, '120'))
  assert.ok(!checkAnswer(ex, ''))
  assert.ok(!checkAnswer(ex, '12a00'))
  assert.ok(!checkAnswer(ex, '-1200'))
})

test('wins, early draws and turns', () => {
  assert.equal(outcome(Array(9).fill(0)), null)
  assert.deepEqual(outcome([1, 1, 1, 2, 2, 0, 0, 0, 0]), { winner: 1, line: [0, 1, 2] })
  assert.deepEqual(outcome([2, 1, 1, 0, 2, 1, 0, 0, 2]).line, [0, 4, 8])
  // Full board with no line.
  assert.deepEqual(outcome([1, 2, 1, 1, 2, 2, 2, 1, 1]), { draw: true })
  // Empty cells remain but every line already holds both marks — no one can win.
  assert.deepEqual(outcome([1, 2, 1, 1, 2, 2, 2, 1, 0]), { draw: true })
  // One line still open — keep playing.
  assert.equal(outcome([1, 2, 1, 0, 2, 0, 0, 0, 0]), null)
  assert.equal(nextTeam(1), 2)
  assert.equal(nextTeam(2), 1)
})

test('the page is routed, in the sitemap, searchable and linked from the math hub', () => {
  const read = p => readFileSync(new URL(p, import.meta.url), 'utf8')
  assert.match(read('../src/App.jsx'), /path="\/classroom\/math-tic-tac-toe"/)
  assert.ok(read('../public/sitemap-static.xml').includes('https://ugabuga.co.il/classroom/math-tic-tac-toe</loc>'))
  assert.ok(read('../src/data/searchStatic.js').includes("to: '/classroom/math-tic-tac-toe'"))
  assert.ok(read('../src/math/MathPages.jsx').includes('/classroom/math-tic-tac-toe'))
})
