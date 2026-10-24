import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { TEACHER_TEMPLATES, TT_BASE, parseBirthdays, parseRoutine } from '../src/pages/printables/teacherTemplatesData.js'

test('birthday lines parse name, day and month; bad lines are reported', () => {
  const { list, missing } = parseBirthdays('נועה 12/3\nאורי - 4.11\nמאיה כהן, 28/6/2019\nיונתן\nדנה 40/2')
  assert.deepEqual(list, [{ name: 'נועה', day: 12, month: 3 }, { name: 'אורי', day: 4, month: 11 }, { name: 'מאיה כהן', day: 28, month: 6 }])
  assert.deepEqual(missing, ['יונתן', 'דנה 40/2'])
})

test('routine lines split an optional time from the activity', () => {
  assert.deepEqual(parseRoutine('08:30 | מפגש בוקר\n9.00 ארוחת בוקר\nמשחק בחצר'), [
    { time: '08:30', what: 'מפגש בוקר' }, { time: '9:00', what: 'ארוחת בוקר' }, { time: '', what: 'משחק בחצר' },
  ])
})

test('teacher templates hub and every template are routed and in the sitemap', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  assert.ok(app.includes(`path="${TT_BASE}"`) && app.includes(`path="${TT_BASE}/:slug"`))
  assert.equal(new Set(TEACHER_TEMPLATES.map(t => t[0])).size, TEACHER_TEMPLATES.length)
  for (const [slug] of TEACHER_TEMPLATES) assert.ok(sitemap.includes(`https://ugabuga.co.il${TT_BASE}/${slug}<`), slug)
})
