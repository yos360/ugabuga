// /excel: formula engine, fill/sort/chart, and every lesson task is solvable but not pre-solved
import { test } from 'node:test'
import assert from 'node:assert/strict'
const E = await import('../src/excel/excelEngine.js')
const { LESSONS } = await import('../src/excel/excelLessons.js')

const val = (cells, ref) => E.evaluate(cells)[ref]

test('formulas: arithmetic, precedence, functions, errors', () => {
  const cells = { A1: '2', A2: '3', A3: '', A4: 'טקסט', B1: '=A1+A2*4', B2: '=(A1+A2)*4', B3: '=SUM(A1:A4)', B4: '=AVERAGE(A1:A3)', B5: '=A1/0', B6: '=SUMM(A1)', B7: '=B7+1', B8: '=MAX(A1:A2)-MIN(A1:A2)', B9: '=COUNT(A1:A4)', B10: '=COUNTA(A1:A4)', B11: '=2^3', B12: '=50%*A1', B13: '=A4&"!"', B14: '=ROUND(10/3,2)' }
  const v = E.evaluate(cells)
  assert.equal(v.B1, 14)
  assert.equal(v.B2, 20)
  assert.equal(v.B3, 5)
  assert.equal(v.B4, 2.5)
  assert.equal(String(v.B5), '#DIV/0!')
  assert.equal(String(v.B6), '#NAME?')
  assert.equal(String(v.B7), '#CIRC!')
  assert.equal(v.B8, 1)
  assert.equal(v.B9, 2)
  assert.equal(v.B10, 3)
  assert.equal(v.B11, 8)
  assert.equal(v.B12, 1)
  assert.equal(v.B13, 'טקסט!')
  assert.equal(v.B14, 3.33)
})

test('IF, COUNTIF, SUMIF, lower-case names, ; separator', () => {
  const cells = { A1: '85', A2: '48', A3: '55', B1: '=if(A1>=55,"עבר","לא עבר")', B2: '=IF(A2>=55;"עבר";"לא עבר")', C1: '=COUNTIF(A1:A3,">=55")', C2: '=SUMIF(A1:A3,">50")', C3: '=COUNTIF(B1:B2,"עבר")' }
  const v = E.evaluate(cells)
  assert.equal(v.B1, 'עבר')
  assert.equal(v.B2, 'לא עבר')
  assert.equal(v.C1, 2)
  assert.equal(v.C2, 140)
  assert.equal(v.C3, 1)
})

test('a formula typed with a Hebrew keyboard is flagged', () => {
  assert.equal(E.hebrewInFormula('=דוצ(B2:B7)'), true)
  assert.equal(E.hebrewInFormula('=IF(B2>55,"עבר","לא")'), false)
  assert.equal(String(val({ A1: '=דוצ(1)' }, 'A1')), '#NAME?')
})

test('fill shifts relative refs, keeps $ refs, and continues series', () => {
  assert.equal(E.shiftFormula('=B2*C2', 3, 0), '=B5*C5')
  assert.equal(E.shiftFormula('=A3*$B$1', 2, 0), '=A5*$B$1')
  assert.equal(E.shiftFormula('=SUM(A1:A3)', 0, 1), '=SUM(B1:B3)')
  assert.equal(E.shiftFormula('=IF(A1>1,"B2","x")', 1, 0), '=IF(A2>1,"B2","x")')
  const s = E.fill({ cells: { A1: '1', A2: '2', B1: '=A1*10' }, fmt: {} }, E.parseRange('A1:B2'), E.parseRange('A1:B5'))
  assert.deepEqual([s.cells.A3, s.cells.A4, s.cells.A5], ['3', '4', '5'])
  assert.equal(s.cells.B3, '=A3*10')
})

test('sort keeps rows together and never moves the header', () => {
  const st = { cells: { A1: 'שם', B1: 'נק', A2: 'א', B2: '5', A3: 'ב', B3: '9', A4: 'ג', B4: '1' }, fmt: {} }
  const s = E.sortRows(st, E.region(st.cells, 1, 2), 1, 'desc')
  assert.deepEqual([s.cells.A1, s.cells.A2, s.cells.A3, s.cells.A4], ['שם', 'ב', 'א', 'ג'])
  assert.deepEqual([s.cells.B2, s.cells.B3, s.cells.B4], ['9', '5', '1'])
})

test('display: currency and rounding', () => {
  assert.equal(E.display(1234.5, { cur: true }), '₪1,234.5')
  assert.equal(E.display(484 / 6), '80.67')
  assert.equal(E.display(null), '')
})

test('every lesson task: starts unsolved, its solution passes every check', () => {
  assert.equal(LESSONS.length, 10)
  const slugs = new Set()
  for (const lesson of LESSONS) {
    assert.ok(!slugs.has(lesson.slug), `duplicate slug ${lesson.slug}`); slugs.add(lesson.slug)
    let prev = null
    lesson.tasks.forEach((task, i) => {
      assert.ok(task.sheet || prev, `${lesson.slug} task ${i} has no sheet and no previous task`)
      const start = task.sheet ? E.startState(task.sheet) : prev
      const before = E.checkTask(task, start, start)
      assert.ok(before.some(c => !c.ok), `${lesson.slug} task ${i + 1} is already solved at the start`)
      const solved = E.applySolution(start, task.solution)
      for (const c of E.checkTask(task, solved, start)) assert.ok(c.ok, `${lesson.slug} task ${i + 1}: "${c.label}" fails with the solution`)
      // nothing on the sheet is an error after solving
      for (const [ref, v] of Object.entries(E.evaluate(solved.cells))) assert.ok(!E.isErr(v), `${lesson.slug} task ${i + 1}: ${ref} = ${v}`)
      // the sheet is big enough for every cell the task touches
      const sheet = lesson.tasks.slice(0, i + 1).reverse().find(t => t.sheet).sheet
      for (const ref of Object.keys(solved.cells)) { const p = E.parseRef(ref); assert.ok(p.c < sheet.cols && p.r < sheet.rows, `${lesson.slug}: ${ref} is outside the ${sheet.cols}×${sheet.rows} sheet`) }
      prev = solved
    })
  }
})
