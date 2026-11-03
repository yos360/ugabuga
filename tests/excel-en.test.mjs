// /en/excel: English lessons are solvable with English function names, and mirror the Hebrew course
import { test } from 'node:test'
import assert from 'node:assert/strict'
const E = await import('../src/excel/excelEngine.js')
const { LESSONS } = await import('../src/excel/excelLessons.js')
const { LESSONS_EN } = await import('../src/en/excel/lessonsEn.js')
const { EXCEL_PAGES } = await import('../src/en/excel/catalog.js')

test('English function names, commas and semicolons evaluate', () => {
  const v = E.evaluate({ A1: '85', A2: '48', B1: '=IF(A1>=55,"Pass","Fail")', B2: '=if(A2>=55;"Pass";"Fail")', C1: '=COUNTIF(B1:B2,"Pass")', C2: '=SUM(A1:A2)', C3: '=AVERAGE(A1:A2)' })
  assert.deepEqual([v.B1, v.B2, v.C1, v.C2, v.C3], ['Pass', 'Fail', 1, 133, 66.5])
})

test('dollar format is opt-in; the default stays the shekel', () => {
  assert.equal(E.display(1234.5, { cur: true }), '₪1,234.5')
  assert.equal(E.display(1234.5, { cur: true }, '$'), '$1,234.5')
})

test('English lessons mirror the Hebrew course and every task is solvable', () => {
  assert.equal(LESSONS_EN.length, LESSONS.length)
  LESSONS_EN.forEach((lesson, li) => {
    const he = LESSONS[li]
    assert.equal(lesson.slug, he.slug)
    assert.equal(lesson.tasks.length, he.tasks.length)
    assert.ok(!/[֐-׿]/.test(JSON.stringify(lesson)), `${lesson.slug} has Hebrew text`)
    let prev = null
    lesson.tasks.forEach((task, i) => {
      assert.equal(task.checks.length, he.tasks[i].checks.length)
      const start = task.sheet ? E.startState(task.sheet) : prev
      assert.ok(E.checkTask(task, start, start).some(c => !c.ok), `${lesson.slug} task ${i + 1} starts solved`)
      const solved = E.applySolution(start, task.solution)
      for (const c of E.checkTask(task, solved, start)) assert.ok(c.ok, `${lesson.slug} task ${i + 1}: "${c.label}" fails`)
      for (const [ref, v] of Object.entries(E.evaluate(solved.cells))) assert.ok(!E.isErr(v), `${lesson.slug} task ${i + 1}: ${ref} = ${v}`)
      const sheet = lesson.tasks.slice(0, i + 1).reverse().find(t => t.sheet).sheet
      for (const ref of Object.keys(solved.cells)) { const p = E.parseRef(ref); assert.ok(p.c < sheet.cols && p.r < sheet.rows, `${lesson.slug}: ${ref} outside sheet`) }
      prev = solved
    })
  })
})

test('catalog: home plus one page per lesson, paired with the Hebrew paths', () => {
  assert.equal(EXCEL_PAGES.length, LESSONS_EN.length + 1)
  assert.equal(EXCEL_PAGES[0].counterpart, '/excel')
  LESSONS_EN.forEach((l, i) => assert.deepEqual([EXCEL_PAGES[i + 1].path, EXCEL_PAGES[i + 1].counterpart], [`/en/excel/${l.slug}`, `/excel/${l.slug}`]))
})
