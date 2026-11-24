import { test } from 'node:test'
import assert from 'node:assert/strict'
import { adaptedMathQuestions, ADAPTED_MATH_GRADES } from '../src/learn/subjects/adaptedMath.js'
import { adaptedReadingQuestions, ADAPTED_READING_GRADES, shortReadings } from '../src/learn/subjects/adaptedReading.js'
import { numberToHebrew, speakMath } from '../src/learn/subjects/speakMath.js'
import { READINGS } from '../src/learn/subjects/readings/science.js'
import { READINGS as HISTORY } from '../src/learn/subjects/readings/history.js'

const LRI = '⁦', PDI = '⁩'
const OP = /^\s*(\d+(?:\.\d+)?)\s*([+−×÷-])\s*(\d+(?:\.\d+)?)\s*=\s*\?\s*$/
const calc = { '+': (a, b) => a + b, '−': (a, b) => a - b, '-': (a, b) => a - b, '×': (a, b) => a * b, '÷': (a, b) => a / b }

test('every grade gives 10 deterministic questions with 3 distinct options', () => {
  for (const g of ADAPTED_MATH_GRADES) {
    for (let seed = 1; seed <= 60; seed++) {
      const qs = adaptedMathQuestions(g, seed, 10)
      assert.equal(qs.length, 10, `grade ${g} seed ${seed}`)
      assert.deepEqual(adaptedMathQuestions(g, seed, 10), qs, 'same seed → same exam')
      assert.equal(new Set(qs.map(q => q.id)).size, 10)
      for (const q of qs) {
        assert.equal(q.options.length, 3)
        assert.equal(new Set(q.options).size, 3, `distinct options: ${q.q} ${q.expr}`)
        assert.equal(q.sayOptions.length, 3)
        assert.ok(q.answer >= 0 && q.answer < 3)
        assert.ok(q.exp && q.exp.length > 3, 'an explanation per question')
        assert.ok(q.say && !/\d/.test(q.say), `read-aloud text has no digits left: ${q.say}`)
        for (const s of q.sayOptions) assert.ok(s && !/\d/.test(s), `spoken option: ${s}`)
      }
    }
  }
})

test('simple exercises: the marked option is the true result', () => {
  let checked = 0
  for (const g of ADAPTED_MATH_GRADES) {
    for (let seed = 1; seed <= 80; seed++) {
      for (const q of adaptedMathQuestions(g, seed, 10)) {
        const m = OP.exec(q.expr.replace(LRI, '').replace(PDI, ''))
        if (!m) continue
        const want = calc[m[2]](Number(m[1]), Number(m[3]))
        assert.ok(Math.abs(Number(q.options[q.answer]) - want) < 1e-9, `${q.expr} → ${q.options[q.answer]}`)
        for (let j = 0; j < 3; j++) if (j !== q.answer) assert.notEqual(Number(q.options[j]), want)
        checked++
      }
    }
  }
  assert.ok(checked > 300, `only ${checked} simple exercises checked`)
})

test('wrong answers are non-negative and never repeat the right one', () => {
  for (const g of ADAPTED_MATH_GRADES) for (let seed = 1; seed <= 40; seed++) for (const q of adaptedMathQuestions(g, seed, 10)) {
    for (const o of q.options) assert.ok(parseFloat(o) >= 0, `${o} in ${q.q}`)
  }
})

test('numbers and signs are spoken as natural Hebrew', () => {
  assert.equal(speakMath('7 + 5 = ?'), 'שבע ועוד חמש שווה כמה')
  assert.equal(speakMath('12 − 4'), 'שתים עשרה פחות ארבע')
  assert.equal(speakMath('6 × 3'), 'שש כפול שלוש')
  assert.equal(speakMath('8 ÷ 2'), 'שמונה לחלק לשתיים')
  assert.equal(speakMath('8 : 2'), 'שמונה לחלק לשתיים')
  assert.equal(speakMath('1 + ? = 8'), 'אחת ועוד כמה שווה שמונה')
  assert.equal(speakMath('כמה הם 25% מ-40?'), 'כמה הם עשרים וחמש אחוז מארבעים?')
  assert.equal(speakMath('3.5'), 'שלוש נקודה חמש')
  const words = { 0: 'אפס', 10: 'עשר', 11: 'אחת עשרה', 21: 'עשרים ואחת', 100: 'מאה', 115: 'מאה וחמש עשרה', 200: 'מאתיים', 999: 'תשע מאות ותשעים ותשע', 1000: 'אלף', 3000: 'שלושת אלפים', 12345: 'שנים עשר אלף ושלוש מאות וארבעים וחמש', 1000000: 'מיליון' }
  for (const [n, w] of Object.entries(words)) assert.equal(numberToHebrew(Number(n)), w)
})

test('reading exam: one passage, up to five questions, three options, answer kept', () => {
  assert.deepEqual(ADAPTED_READING_GRADES, [2, 3, 4, 5, 6])
  const list = [...READINGS, ...HISTORY]
  for (const g of ADAPTED_READING_GRADES) {
    assert.ok(shortReadings(list, g).length > 0, `grade ${g}`)
    for (let seed = 1; seed <= 20; seed++) {
      const res = adaptedReadingQuestions(list, g, seed)
      assert.ok(res.questions.length >= 4 && res.questions.length <= 5)
      assert.deepEqual(adaptedReadingQuestions(list, g, seed).slug, res.slug)
      const src = list.find(r => r.slug === res.slug)
      res.questions.forEach((q, k) => {
        assert.equal(q.options.length, 3)
        assert.equal(new Set(q.options).size, 3)
        assert.equal(q.passage, res.passage)
        assert.equal(q.options[q.answer], src.q[k][1][src.q[k][2]], 'right answer survives the cut to 3 options')
      })
    }
  }
  assert.equal(adaptedReadingQuestions([], 3, 1), null)
})
